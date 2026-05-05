import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Checkbox,
  Paper,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import API_URL from '../config';

interface Turma {
  id: number;
  nome: string;
  periodo: string;
}

interface Aluno {
  id: number;
  nome: string;
  turmaId: number;
}

interface FrequenciaResponse {
  id: number;
  aluno: Aluno;
  turma: Turma;
  data: string;
  status: string;
}

const periodos = ['Manha', 'Tarde', 'Noite'];

const FrequenciaAulas: React.FC = () => {
  // Estado geral
  const [periodo, setPeriodo] = useState<string>('');
  const [turmaId, setTurmaId] = useState<number | string>('');
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  
  // Dados
  const [todasAsTurmas, setTodasAsTurmas] = useState<Turma[]>([]);
  const [turmasDoPerido, setTurmasDoPerido] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [frequencias, setFrequencias] = useState<Record<number, Record<number, string>>>({});
  const [diasDesbloqueados, setDiasDesbloqueados] = useState<Set<number>>(new Set());

  // ===== FUNÇÕES UTILITÁRIAS =====
  const getDiasDoMes = useCallback((): number => {
    return new Date(ano, mes, 0).getDate();
  }, [ano, mes]);

  const getDiaDaSemana = (dia: number): string => {
    const diasNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const data = new Date(ano, mes - 1, dia);
    return diasNomes[data.getDay()];
  };

  // Removido getDataInicio e getDataFim - não são mais necessárias
  // O endpoint dados-completos já calcula as datas baseado em mes e ano

  // Conta faltas apenas nos dias exibidos no mês
  const contarFaltas = (alunoId: number): number => {
    const diasMes = getDiasDoMes();
    let faltas = 0;
    for (let dia = 1; dia <= diasMes; dia++) {
      if (frequencias[alunoId]?.[dia] === 'F') faltas++;
    }
    // Log para depuração
    console.log(`Aluno ${alunoId} faltas:`, faltas, frequencias[alunoId]);
    return faltas;
  };

  const toggleDia = (dia: number) => {
    const novosDias = new Set(diasDesbloqueados);
    if (novosDias.has(dia)) {
      // Se está desmarcando, remove
      novosDias.delete(dia);
      
      // Remove confirmação da chamada (opcional - backend tem DELETE mas diz que é só admin)
      const dataChamada = new Date(ano, mes - 1, dia).toISOString().split('T')[0];
      fetch(`${API_URL}/chamada-confirmada?turmaId=${turmaId}&dataChamada=${dataChamada}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      }).catch(e => console.log('Não foi possível remover confirmação:', e));
      
    } else {
      // Se está marcando, adiciona
      novosDias.add(dia);
      setFrequencias(prev => {
        const novo = { ...prev };
        alunos.forEach(aluno => {
          if (!novo[aluno.id]) novo[aluno.id] = {};
          if (novo[aluno.id][dia] === undefined) novo[aluno.id][dia] = 'C';
        });
        return novo;
      });
      
      // ✅ SALVA CONFIRMAÇÃO DA CHAMADA NO BACKEND
      const dataChamada = new Date(ano, mes - 1, dia).toISOString().split('T')[0];
      const dataHoraConfirmacao = new Date().toISOString();
      const emailProfessor = localStorage.getItem('userEmail') || 'professor@escola.com';
      
      const payload = {
        turmaId: Number(turmaId),
        dataChamada: dataChamada,
        dataHoraConfirmacao: dataHoraConfirmacao,
        emailProfessor: emailProfessor
      };
      
      console.log('📤 Confirmando chamada:', payload);
      
      fetch(`${API_URL}/chamada-confirmada`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(r => {
        if (r.ok) {
          console.log('✅ Chamada confirmada para dia', dia);
          return r.json();
        } else {
          throw new Error('Erro ao confirmar chamada');
        }
      })
      .then(data => {
        console.log('✅ Resposta do servidor:', data);
      })
      .catch(e => {
        console.error('❌ Erro ao confirmar chamada:', e);
        alert('Erro ao confirmar chamada. Tente novamente.');
      });
    }
    setDiasDesbloqueados(novosDias);
  };

  const toggleFrequencia = (alunoId: number, dia: number) => {
    if (!diasDesbloqueados.has(dia)) return;

    const novoStatus = frequencias[alunoId][dia] === 'C' ? 'F' : 'C';
    setFrequencias(prev => ({
      ...prev,
      [alunoId]: {
        ...prev[alunoId],
        [dia]: novoStatus
      }
    }));

    const dataClicada = new Date(ano, mes - 1, dia).toISOString().split('T')[0];
    const payload = {
      aluno: {
        id: alunoId
      },
      turma: {
        id: turmaId
      },
      data: dataClicada,
      status: novoStatus
    };

    fetch(`${API_URL}/frequencias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(e => console.error('Erro salvar:', e));
  };

  // ===== EFFECTS =====

  // 1. Carregar TODAS as turmas
  useEffect(() => {
    fetch(`${API_URL}/turmas`)
      .then(r => r.json())
      .then(data => {
        setTodasAsTurmas(Array.isArray(data) ? data : []);
        console.log('Turmas carregadas:', data);
      })
      .catch(e => console.error('Erro turmas:', e));
  }, []);

  // 2. Filtrar turmas por PERÍODO
  const turmasFiltradasPorPeriodo = useMemo(() => {
    return periodo
      ? todasAsTurmas.filter(t => 
          t.periodo?.toLowerCase().trim() === periodo.toLowerCase().trim()
        )
      : [];
  }, [periodo, todasAsTurmas]);

  useEffect(() => {
    setTurmasDoPerido(turmasFiltradasPorPeriodo);
    setTurmaId('');
  }, [turmasFiltradasPorPeriodo]);

  // 3. ⚡ CHAMADA ÚNICA - Carregar TUDO quando TURMA, MÊS ou ANO mudam
  useEffect(() => {
    if (!turmaId) {
      setAlunos([]);
      setFrequencias({});
      setDiasDesbloqueados(new Set());
      return;
    }

    (async () => {
      try {
        console.log('🚀 CARREGANDO TUDO EM UMA ÚNICA CHAMADA!');
        console.log(`📍 Turma: ${turmaId}, Mês: ${mes}, Ano: ${ano}`);

        // ⚡ UMA ÚNICA CHAMADA QUE TRAZ TUDO!
        const url = `${API_URL}/turmas/${turmaId}/dados-completos?mes=${mes}&ano=${ano}`;
        const response = await fetch(url);

        if (!response.ok) {
          // Se der erro, volta pro método antigo temporariamente
          console.warn('⚠️ Endpoint dados-completos falhou, usando método antigo...');

          // Método antigo de fallback
          const resAlunos = await fetch(`${API_URL}/alunos`);
          let todosAlunos = [];
          if (resAlunos.ok) {
            const text = await resAlunos.text();
            todosAlunos = text ? JSON.parse(text) : [];
          }
          const alunosDaTurma = todosAlunos.filter((a: Aluno) => a.turmaId === Number(turmaId));
          setAlunos(alunosDaTurma);

          const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
          const ultimoDia = getDiasDoMes();
          const dataFim = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;

          const resFreq = await fetch(
            `${API_URL}/frequencias?turmaId=${turmaId}&dataInicio=${dataInicio}&dataFim=${dataFim}`
          );
          let dataFreq = [];
          if (resFreq.ok) {
            const text = await resFreq.text();
            dataFreq = text ? JSON.parse(text) : [];
          }

          const freqInicial: Record<number, Record<number, string>> = {};
          const diasMes = getDiasDoMes();

          alunosDaTurma.forEach((aluno: Aluno) => {
            freqInicial[aluno.id] = {};
            for (let i = 1; i <= diasMes; i++) {
              freqInicial[aluno.id][i] = 'C';
            }
          });

          dataFreq.forEach((freq: FrequenciaResponse) => {
            const dia = new Date(freq.data).getDate();
            if (freqInicial[freq.aluno.id]) {
              freqInicial[freq.aluno.id][dia] = freq.status;
            }
          });

          setFrequencias(freqInicial);

          const resChamadas = await fetch(
            `${API_URL}/chamada-confirmada?turmaId=${turmaId}&dataInicio=${dataInicio}&dataFim=${dataFim}`
          );
          if (resChamadas.ok) {
            const text = await resChamadas.text();
            if (text) {
              const chamadasConfirmadas = JSON.parse(text);
              const diasConfirmados = new Set<number>();
              chamadasConfirmadas.forEach((chamada: any) => {
                const dia = new Date(chamada.dataChamada).getDate();
                diasConfirmados.add(dia);
              });
              setDiasDesbloqueados(diasConfirmados);
            } else {
              setDiasDesbloqueados(new Set());
            }
          } else {
            setDiasDesbloqueados(new Set());
          }

          return;
        }
        
        // ✅ SUCESSO - Processar dados da ÚNICA chamada
        let dadosCompletos: { alunos?: Aluno[]; frequencias?: FrequenciaResponse[]; chamadasConfirmadas?: any[] } = {};
        const text = await response.text();
        if (text) {
          dadosCompletos = JSON.parse(text);
        }
        
        console.log('✅ DADOS RECEBIDOS EM UMA ÚNICA CHAMADA:', {
          alunos: dadosCompletos.alunos?.length || 0,
          frequencias: dadosCompletos.frequencias?.length || 0,
          chamadasConfirmadas: dadosCompletos.chamadasConfirmadas?.length || 0
        });
        
        // 1️⃣ Setar os ALUNOS
        const alunosDaTurma = dadosCompletos.alunos || [];
        setAlunos(alunosDaTurma);
        
        // 2️⃣ Processar FREQUÊNCIAS
        const freqInicial: Record<number, Record<number, string>> = {};
        const diasMes = getDiasDoMes();
        
        // Inicializar com "C" (presente)
        alunosDaTurma.forEach((aluno: Aluno) => {
          freqInicial[aluno.id] = {};
          for (let i = 1; i <= diasMes; i++) {
            freqInicial[aluno.id][i] = 'C';
          }
        });
        
        // Aplicar as frequências do banco, filtrando pelo mês e ano selecionados
        (dadosCompletos.frequencias || []).forEach((freq: FrequenciaResponse) => {
          const dataObj = new Date(freq.data);
          const dia = dataObj.getDate();
          const mesFreq = dataObj.getMonth() + 1;
          const anoFreq = dataObj.getFullYear();
          if (
            freqInicial[freq.aluno.id] &&
            mesFreq === mes &&
            anoFreq === ano
          ) {
            freqInicial[freq.aluno.id][dia] = freq.status;
          }
        });
        
        console.log('Frequências finais por aluno:', freqInicial);
        setFrequencias(freqInicial);
        
        // 3️⃣ Processar CHAMADAS CONFIRMADAS (checkboxes)
        const diasConfirmados = new Set<number>();
        (dadosCompletos.chamadasConfirmadas || []).forEach((chamada: any) => {
          const dia = new Date(chamada.dataChamada).getDate();
          diasConfirmados.add(dia);
        });
        
        setDiasDesbloqueados(diasConfirmados);
        
        console.log('🎉 TUDO CARREGADO COM SUCESSO EM UMA ÚNICA CHAMADA!');
        
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        setAlunos([]);
        setFrequencias({});
        setDiasDesbloqueados(new Set());
      }
    })();
  }, [turmaId, mes, ano, getDiasDoMes]);

  const diasMes = getDiasDoMes();

  return (
    <Container maxWidth="xl" sx={{ py: 2, px: 1 }}>
      <Box sx={{ mb: 2 }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Frequência de Aulas</h2>
      </Box>

      {/* FILTROS */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 2 }}>
        {/* Período */}
        <FormControl fullWidth size="small">
          <InputLabel sx={{ fontSize: '0.9rem' }}>Período</InputLabel>
          <Select
            value={periodo}
            label="Período"
            onChange={e => setPeriodo(e.target.value)}
            sx={{ fontSize: '0.9rem' }}
          >
            <MenuItem value="">Selecione</MenuItem>
            {periodos.map(p => (
              <MenuItem key={p} value={p} sx={{ fontSize: '0.9rem' }}>
                {p === 'Manha' ? 'Manhã' : p === 'Noite' ? 'Noite' : 'Tarde'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Turma */}
        <FormControl fullWidth size="small" disabled={!periodo}>
          <InputLabel sx={{ fontSize: '0.9rem' }}>Turma</InputLabel>
          <Select
            value={turmaId}
            label="Turma"
            onChange={e => setTurmaId(e.target.value)}
            sx={{ fontSize: '0.9rem' }}
          >
            <MenuItem value="">Selecione</MenuItem>
            {turmasDoPerido.map(turma => (
              <MenuItem key={turma.id} value={turma.id} sx={{ fontSize: '0.9rem' }}>
                {turma.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Mês */}
        <FormControl fullWidth size="small" disabled={!turmaId}>
          <InputLabel sx={{ fontSize: '0.9rem' }}>Mês</InputLabel>
          <Select
            value={mes}
            label="Mês"
            onChange={e => setMes(Number(e.target.value))}
            sx={{ fontSize: '0.9rem' }}
          >
            <MenuItem value={1}>Janeiro</MenuItem>
            <MenuItem value={2}>Fevereiro</MenuItem>
            <MenuItem value={3}>Março</MenuItem>
            <MenuItem value={4}>Abril</MenuItem>
            <MenuItem value={5}>Maio</MenuItem>
            <MenuItem value={6}>Junho</MenuItem>
            <MenuItem value={7}>Julho</MenuItem>
            <MenuItem value={8}>Agosto</MenuItem>
            <MenuItem value={9}>Setembro</MenuItem>
            <MenuItem value={10}>Outubro</MenuItem>
            <MenuItem value={11}>Novembro</MenuItem>
            <MenuItem value={12}>Dezembro</MenuItem>
          </Select>
        </FormControl>

        {/* Ano */}
        <FormControl fullWidth size="small" disabled={!turmaId}>
          <InputLabel sx={{ fontSize: '0.9rem' }}>Ano</InputLabel>
          <Select
            value={ano}
            label="Ano"
            onChange={e => setAno(Number(e.target.value))}
            sx={{ fontSize: '0.9rem' }}
          >
            <MenuItem value={2025}>2025</MenuItem>
            <MenuItem value={2026}>2026</MenuItem>
            <MenuItem value={2027}>2027</MenuItem>
            <MenuItem value={2028}>2028</MenuItem>
            <MenuItem value={2029}>2029</MenuItem>
            <MenuItem value={2030}>2030</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* TABELA */}
      {turmaId && alunos.length > 0 && (
        <TableContainer component={Paper} sx={{ overflowX: 'auto', mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ minWidth: 30, maxWidth: 35, fontWeight: 'bold', fontSize: '0.75rem', padding: '6px 3px', textAlign: 'center' }}>
                  Nº
                </TableCell>
                <TableCell sx={{ minWidth: 180, fontWeight: 'bold', fontSize: '0.75rem', padding: '6px 6px' }}>
                  Nome
                </TableCell>
                <TableCell sx={{ minWidth: 50, maxWidth: 60, fontWeight: 'bold', color: '#d32f2f', fontSize: '0.75rem', padding: '6px 12px 6px 8px', textAlign: 'left' }}>
                  Faltas
                </TableCell>
                {/* Cabeçalho dos Dias */}
                {Array.from({ length: diasMes }).map((_, idx) => {
                  const dia = idx + 1;
                  const isDesbloqueado = diasDesbloqueados.has(dia);
                  return (
                    <TableCell
                      key={dia}
                      sx={{
                        width: 28,
                        maxWidth: 28,
                        padding: '4px 1px',
                        textAlign: 'center',
                        backgroundColor: isDesbloqueado ? '#e3f2fd' : '#fafafa',
                        border: isDesbloqueado ? '1px solid #2196f3' : '1px solid #e0e0e0',
                        cursor: 'pointer',
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Checkbox
                          size="small"
                          checked={isDesbloqueado}
                          onChange={() => toggleDia(dia)}
                          sx={{ width: 10, height: 10, p: 0, m: 0, '& .MuiSvgIcon-root': { fontSize: '0.9rem' } }}
                        />
                        <Box sx={{ fontSize: '0.55rem', fontWeight: 'bold', lineHeight: 1 }}>{dia}</Box>
                        <Box sx={{ fontSize: '0.5rem', color: '#666', lineHeight: 1 }}>{getDiaDaSemana(dia)}</Box>
                      </Box>
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {alunos.map((aluno, idx) => (
                <TableRow key={aluno.id} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#fafafa' } }}>
                  <TableCell sx={{ minWidth: 30, maxWidth: 35, padding: '5px 3px', textAlign: 'center', fontSize: '0.7rem', fontWeight: '500' }}>
                    {idx + 1}
                  </TableCell>
                  <TableCell sx={{ minWidth: 180, padding: '5px 6px', fontSize: '0.7rem', fontWeight: '500' }}>
                    {aluno.nome}
                  </TableCell>
                  <TableCell sx={{ minWidth: 50, maxWidth: 60, padding: '5px 12px 5px 8px', textAlign: 'left', fontWeight: 'bold', color: '#d32f2f', fontSize: '0.7rem' }}>
                    {contarFaltas(aluno.id)}
                  </TableCell>
                  {/* Células de Frequência */}
                  {Array.from({ length: diasMes }).map((_, idx) => {
                    const dia = idx + 1;
                    const isDesbloqueado = diasDesbloqueados.has(dia);
                    const status = frequencias[aluno.id]?.[dia] || 'C';
                    const isFalta = status === 'F';
                    const bgColor = !isDesbloqueado
                      ? '#fafafa'
                      : isFalta
                      ? '#ffcdd2'
                      : '#c8e6c9';
                    const textColor = !isDesbloqueado
                      ? '#999'
                      : isFalta
                      ? '#c62828'
                      : '#2e7d32';
                    return (
                      <TableCell
                        key={dia}
                        onClick={() => toggleFrequencia(aluno.id, dia)}
                        sx={{
                          width: 28,
                          maxWidth: 28,
                          padding: '3px 0px',
                          textAlign: 'center',
                          backgroundColor: bgColor,
                          border: isDesbloqueado ? '1px solid #2196f3' : '1px solid #e0e0e0',
                          cursor: isDesbloqueado ? 'pointer' : 'not-allowed',
                          opacity: isDesbloqueado ? 1 : 0.6,
                          color: textColor,
                          fontWeight: 'bold',
                          fontSize: '0.85rem',
                          verticalAlign: 'middle',
                          height: 28,
                        }}
                      >
                        {/* Exibe o status retornado do endpoint para debug visual */}
                        {isDesbloqueado ? status : (
                          <LockOutlinedIcon sx={{ fontSize: 10, display: 'flex', margin: '0 auto' }} />
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {turmaId && alunos.length === 0 && (
        <Paper sx={{ textAlign: 'center', py: 8, px: 3, color: '#999', backgroundColor: '#fafafa' }}>
          <Box sx={{ fontSize: '1.1rem' }}>Carregando alunos da turma...</Box>
        </Paper>
      )}

      {!turmaId && (
        <Paper sx={{ textAlign: 'center', py: 8, px: 3, color: '#999', backgroundColor: '#fafafa' }}>
          <Box sx={{ fontSize: '1.1rem' }}>Selecione o período, turma, mês e ano para visualizar a frequência</Box>
        </Paper>
      )}
    </Container>
  );
};

export default FrequenciaAulas;

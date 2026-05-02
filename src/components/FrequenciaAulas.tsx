import React, { useState, useEffect, useCallback } from 'react';
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

interface Turma {
  id: number;
  nome: string;
}

interface Aluno {
  id: number;
  nome: string;
}

interface Frequencia {
  alunoId: number;
  turmaId: number;
  dia: number;
  data: string;
  status: string;
}

const FrequenciaAulas: React.FC = () => {
  const [periodo, setPeriodo] = useState<string>('Manha');
  const [turmaId, setTurmaId] = useState<number | string>('');
  const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
  const [ano, setAno] = useState<number>(new Date().getFullYear());
  
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [frequencias, setFrequencias] = useState<Record<number, Record<number, string>>>({});
  const [diasDesbloqueados, setDiasDesbloqueados] = useState<Set<number>>(new Set());

  // ===== FUNÇÕES DE CÁLCULO (DECLARAR PRIMEIRO) =====
  const getDiasDoMes = useCallback((): number => {
    return new Date(ano, mes, 0).getDate();
  }, [ano, mes]);

  const getDiaDaSemana = (dia: number): string => {
    const diasNomes = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    const data = new Date(ano, mes - 1, dia);
    return diasNomes[data.getDay()];
  };

  const getDataInicio = useCallback((): string => {
    return new Date(ano, mes - 1, 1).toISOString().split('T')[0];
  }, [ano, mes]);

  const getDataFim = useCallback((): string => {
    return new Date(ano, mes, 0).toISOString().split('T')[0];
  }, [ano, mes]);

  const contarFaltas = (alunoId: number): number => {
    return Object.values(frequencias[alunoId] || {}).filter(f => f === 'F').length;
  };

  const toggleDia = (dia: number) => {
    const novosDias = new Set(diasDesbloqueados);
    if (novosDias.has(dia)) {
      novosDias.delete(dia);
    } else {
      novosDias.add(dia);
      setFrequencias(prev => {
        const novo = { ...prev };
        alunos.forEach(aluno => {
          if (!novo[aluno.id]) novo[aluno.id] = {};
          if (novo[aluno.id][dia] === undefined) novo[aluno.id][dia] = 'C';
        });
        return novo;
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
      alunoId: alunoId,
      turmaId: turmaId,
      data: dataClicada,
      status: novoStatus
    };

    fetch('http://localhost:8080/frequencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(e => console.error('Erro salvar:', e));
  };

  // ===== EFFECTS =====
  useEffect(() => {
    fetch('http://localhost:8080/turmas')
      .then(r => r.json())
      .then(setTurmas)
      .catch(e => console.error('Erro turmas:', e));
  }, []);

  useEffect(() => {
    if (!turmaId) {
      return;
    }

    (async () => {
      try {
        const resAlunos = await fetch(`http://localhost:8080/alunos?turmaId=${turmaId}`);
        const dataAlunos = await resAlunos.json();
        setAlunos(dataAlunos);

        const freqInicial: Record<number, Record<number, string>> = {};
        const diasMes = getDiasDoMes();
        dataAlunos.forEach((aluno: Aluno) => {
          freqInicial[aluno.id] = {};
          for (let i = 1; i <= diasMes; i++) {
            freqInicial[aluno.id][i] = 'C';
          }
        });

        const dataInicio = getDataInicio();
        const dataFim = getDataFim();
        const resFreq = await fetch(
          `http://localhost:8080/frequencias?turmaId=${turmaId}&dataInicio=${dataInicio}&dataFim=${dataFim}`
        );
        const dataFreq = await resFreq.json();

        dataFreq.forEach((freq: Frequencia) => {
          if (freqInicial[freq.alunoId]) {
            freqInicial[freq.alunoId][freq.dia] = freq.status;
          }
        });

        setFrequencias(freqInicial);
        setDiasDesbloqueados(new Set());
      } catch (error) {
        console.error('Erro:', error);
      }
    })();
  }, [turmaId, mes, ano, getDiasDoMes, getDataInicio, getDataFim]);

  const diasMes = getDiasDoMes();

  return (
    <Container maxWidth="xl" sx={{ py: 2, px: 1 }}>
      <Box sx={{ mb: 2 }}>
        <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Frequência de Aulas</h2>
      </Box>

      {/* FILTROS */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 2 }}>
        <FormControl fullWidth size="small">
          <InputLabel sx={{ fontSize: '0.9rem' }}>Período</InputLabel>
          <Select
            value={periodo}
            label="Período"
            onChange={e => setPeriodo(e.target.value)}
            sx={{ fontSize: '0.9rem' }}
          >
            <MenuItem value="Manha">Manhã</MenuItem>
            <MenuItem value="Tarde">Tarde</MenuItem>
            <MenuItem value="Noite">Noite</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel sx={{ fontSize: '0.9rem' }}>Turma</InputLabel>
          <Select
            value={turmaId}
            label="Turma"
            onChange={e => setTurmaId(e.target.value)}
            sx={{ fontSize: '0.9rem' }}
          >
            <MenuItem value="">Selecione</MenuItem>
            {turmas.map(turma => (
              <MenuItem key={turma.id} value={turma.id} sx={{ fontSize: '0.9rem' }}>
                {turma.nome}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
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

        <FormControl fullWidth size="small">
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
      {turmaId && (
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
                <TableCell sx={{ minWidth: 35, maxWidth: 40, fontWeight: 'bold', color: '#d32f2f', fontSize: '0.75rem', padding: '6px 3px', textAlign: 'center' }}>
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
                  <TableCell sx={{ minWidth: 35, maxWidth: 40, padding: '5px 3px', textAlign: 'center', fontWeight: 'bold', color: '#d32f2f', fontSize: '0.7rem' }}>
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
                        {isDesbloqueado ? status : <LockOutlinedIcon sx={{ fontSize: 10, display: 'flex', margin: '0 auto' }} />}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!turmaId && (
        <Paper sx={{ textAlign: 'center', py: 8, px: 3, color: '#999', backgroundColor: '#fafafa' }}>
          <Box sx={{ fontSize: '1.1rem' }}>Selecione uma turma para visualizar a frequência</Box>
        </Paper>
      )}
    </Container>
  );
};

export default FrequenciaAulas;

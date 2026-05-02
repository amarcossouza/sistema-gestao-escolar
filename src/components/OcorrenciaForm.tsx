import { useAuth } from '../AuthContext';
import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, Paper, MenuItem, Select, InputLabel, FormControl, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

interface Aluno { id: number; nome: string; turmaId?: number; turma?: { id: number; nome: string }; }
interface Turma { id: number; nome: string; periodo?: string; }
interface TipoOcorrencia { id: number; nome: string; }

const OcorrenciaForm: React.FC = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [periodo, setPeriodo] = useState('');
  const [alunosTurma, setAlunosTurma] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [turmasPeriodo, setTurmasPeriodo] = useState<Turma[]>([]);
  const [tipos, setTipos] = useState<TipoOcorrencia[]>([]);
  const [alunoId, setAlunoId] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [tipoOcorrenciaId, setTipoOcorrenciaId] = useState('');
  const [dataOcorrencia, setDataOcorrencia] = useState('');
  const [horaOcorrencia, setHoraOcorrencia] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const { user } = useAuth();
  // Nome e email do professor serão preenchidos automaticamente
  const [ocorrenciasAluno, setOcorrenciasAluno] = useState<any[]>([]);

  useEffect(() => {
    // Busca todos os alunos (com turmaId no response)
    fetch('http://localhost:8083/alunos')
      .then(r => r.json())
      .then(data => {
        console.log('Alunos carregados:', data);
        setAlunos(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Erro ao carregar alunos:', err);
        setAlunos([]);
      });
    
    // Busca todas as turmas
    fetch('http://localhost:8083/turmas')
      .then(r => r.json())
      .then(data => {
        console.log('Turmas carregadas:', data);
        setTurmas(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Erro ao carregar turmas:', err);
        setTurmas([]);
      });
    
    // Busca tipos de ocorrências ativas
    fetch('http://localhost:8083/api/tipos-ocorrencias/ativos')
      .then(r => r.json())
      .then(data => {
        console.log('Tipos de ocorrências:', data);
        setTipos(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error('Erro ao carregar tipos:', err);
        setTipos([]);
      });
  }, []);

  // Busca turmas quando período é selecionado
  useEffect(() => {
    if (periodo) {
      // Opção 1: Usar endpoint de período se disponível
      // fetch(`http://localhost:8083/turmas/por-periodo/${periodo}`)
      
      // Opção 2: Filtrar localmente (mais simples)
      const turmasFiltered = turmas.filter(t => 
        t.periodo?.toLowerCase().trim() === periodo.toLowerCase().trim()
      );
      
      console.log('Período selecionado:', periodo);
      console.log('Todas as turmas disponíveis:', turmas);
      console.log('Turmas encontradas para período:', turmasFiltered);
      
      setTurmasPeriodo(turmasFiltered);
      setTurmaId('');
      setAlunosTurma([]);
      setAlunoId('');
    } else {
      setTurmasPeriodo([]);
      setTurmaId('');
      setAlunosTurma([]);
      setAlunoId('');
    }
  }, [periodo, turmas]);

  // Atualiza alunosTurma ao trocar turma
  useEffect(() => {
    if (turmaId) {
      // Tenta usar turmaId direto primeiro
      let alunosFiltered = alunos.filter(a => {
        const alunoTurmaId = a.turmaId || (a.turma?.id);
        const match = String(alunoTurmaId) === String(turmaId);
        if (match) {
          console.log(`Match encontrado - Aluno: ${a.nome}, turmaId: ${alunoTurmaId}, turmaId esperado: ${turmaId}`);
        }
        return match;
      });
      
      console.log('=== FILTRO DE ALUNOS ===');
      console.log('Turma ID selecionada:', turmaId);
      console.log('Total de alunos na API:', alunos.length);
      console.log('Estrutura do primeiro aluno:', alunos[0]);
      console.log('Alunos encontrados para turma:', alunosFiltered.length);
      console.log('Dados dos alunos encontrados:', alunosFiltered);
      
      setAlunosTurma(alunosFiltered);
      setAlunoId('');
    } else {
      setAlunosTurma([]);
      setAlunoId('');
    }
  }, [turmaId, alunos]);

  useEffect(() => {
    if (alunoId && turmaId) {
      fetch(`http://localhost:8083/ocorrencias/aluno/${alunoId}/turma/${turmaId}`)
        .then(r => r.json())
        .then(data => Array.isArray(data) ? setOcorrenciasAluno(data) : setOcorrenciasAluno([]))
        .catch(() => setOcorrenciasAluno([]));
    } else if (alunoId) {
      fetch(`http://localhost:8083/ocorrencias/aluno/${alunoId}`)
        .then(r => r.json())
        .then(data => Array.isArray(data) ? setOcorrenciasAluno(data) : setOcorrenciasAluno([]))
        .catch(() => setOcorrenciasAluno([]));
    } else {
      setOcorrenciasAluno([]);
    }
  }, [alunoId, turmaId]);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!alunoId || !turmaId || !tipoOcorrenciaId || !dataOcorrencia) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    const [hour, minute] = horaOcorrencia.split(':');
    // Nome do professor: se user tiver nome, usa, senão usa email
    const nomeOuEmail = user || '';
    const payload = {
      alunoId: Number(alunoId),
      turmaId: Number(turmaId),
      tipoOcorrenciaId: Number(tipoOcorrenciaId),
      dataOcorrencia,
      horaOcorrencia: { hour: Number(hour)||0, minute: Number(minute)||0, second: 0, nano: 0 },
      observacoes,
      emailProfessor: nomeOuEmail,
      nomeProfessor: nomeOuEmail
    };
    console.log('Dados sendo enviados:', payload);
    fetch('http://localhost:8083/ocorrencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => {
      if (!r.ok) {
        return r.text().then(text => {
          throw new Error(`Erro ${r.status}: ${text}`);
        });
      }
      return r.json();
    }).then(() => {
      // Limpa apenas os campos do formulário, mantém aluno e turma selecionados
      setTipoOcorrenciaId(''); setDataOcorrencia(''); setHoraOcorrencia(''); setObservacoes('');
      alert('Ocorrência salva com sucesso!');
      // Recarrega as ocorrências do aluno/turma selecionados
      if (alunoId && turmaId) {
        fetch(`http://localhost:8083/ocorrencias/aluno/${alunoId}/turma/${turmaId}`)
          .then(r => r.json())
          .then(data => Array.isArray(data) ? setOcorrenciasAluno(data) : setOcorrenciasAluno([]))
          .catch(() => setOcorrenciasAluno([]));
      } else if (alunoId) {
        fetch(`http://localhost:8083/ocorrencias/aluno/${alunoId}`)
          .then(r => r.json())
          .then(data => Array.isArray(data) ? setOcorrenciasAluno(data) : setOcorrenciasAluno([]))
          .catch(() => setOcorrenciasAluno([]));
      }
    }).catch(err => {
      console.error('Erro:', err);
      alert('Erro ao salvar ocorrência: ' + err.message);
    });
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 0 }}>
      <Paper sx={{ p: 0, mb: 4, minHeight: 0, overflow: 'hidden' }}>
        <Box sx={{ py: 1.5, px: 2, background: '#0072C3', color: '#fff' }}>
          <Typography variant="h6" mb={0} sx={{ fontSize: 15, fontWeight: 600 }}>Cadastro de Ocorrência</Typography>
        </Box>
        <Paper elevation={0} sx={{ p: 3, background: '#f8fafc', minHeight: 0, borderRadius: 0 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, minHeight: 0 }}>
            {/* Linha 1: Período, Turma, Aluno */}
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'flex-start', minHeight: 56 }}>
              <FormControl sx={{ flex: 0.7, minWidth: 80, maxWidth: 120, '.MuiInputBase-root': { minHeight: 44, height: 44, fontSize: 15, py: 0.8 } }} required>
                <InputLabel id="periodo-label">Periodo</InputLabel>
                <Select labelId="periodo-label" value={periodo} label="Periodo" onChange={e => setPeriodo(e.target.value)}>
                  <MenuItem value="">Selecione...</MenuItem>
                  <MenuItem value="manha">Manha</MenuItem>
                  <MenuItem value="tarde">Tarde</MenuItem>
                  <MenuItem value="noite">Noite</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ flex: 0.8, minWidth: 80, maxWidth: 130, '.MuiInputBase-root': { minHeight: 44, height: 44, fontSize: 15, py: 0.8 } }} required disabled={!periodo}>
                <InputLabel id="turma-label">Turma</InputLabel>
                <Select labelId="turma-label" value={turmaId} label="Turma" onChange={e => setTurmaId(e.target.value)}>
                  <MenuItem value="">Selecione...</MenuItem>
                  {turmasPeriodo.map(t => <MenuItem key={t.id} value={String(t.id)}>{t.nome}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl sx={{ flex: 2.5, minWidth: 180, '.MuiInputBase-root': { minHeight: 44, height: 44, fontSize: 15, py: 0.8 } }} required disabled={!turmaId}>
                <InputLabel id="aluno-label">Aluno</InputLabel>
                <Select labelId="aluno-label" value={alunoId} label="Aluno" onChange={e => setAlunoId(e.target.value)}>
                  <MenuItem value="">Selecione...</MenuItem>
                  {alunosTurma.map(a => <MenuItem key={a.id} value={String(a.id)}>{a.nome}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            {/* Linha 2: Tipo, Data, Hora */}
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'flex-start', minHeight: 56 }}>
              <FormControl sx={{ flex: 1, '.MuiInputBase-root': { minHeight: 44, height: 44, fontSize: 15, py: 0.8 } }} required>
                <InputLabel id="tipo-label">Tipo</InputLabel>
                <Select labelId="tipo-label" value={tipoOcorrenciaId} label="Tipo" onChange={e => setTipoOcorrenciaId(e.target.value)}>
                  <MenuItem value="">Selecione...</MenuItem>
                  {tipos.map(t => <MenuItem key={t.id} value={String(t.id)}>{t.nome}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="Data" type="date" value={dataOcorrencia} onChange={e => setDataOcorrencia(e.target.value)} required sx={{ flex: 1, minWidth: 0, minHeight: 44, height: 44, fontSize: 15, '.MuiInputBase-root': { minHeight: 44, height: 44, fontSize: 15, py: 0.8 } }} InputLabelProps={{ shrink: true }} />
              <TextField label="Hora" type="time" value={horaOcorrencia} onChange={e => setHoraOcorrencia(e.target.value)} sx={{ flex: 1, minWidth: 0, minHeight: 44, height: 44, fontSize: 15, '.MuiInputBase-root': { minHeight: 44, height: 44, fontSize: 15, py: 0.8 } }} InputLabelProps={{ shrink: true }} />
            </Box>
            {/* Linha 3: Observações e botão */}
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'flex-end', minHeight: 48 }}>
              <TextField label="Observações" value={observacoes} onChange={e => setObservacoes(e.target.value)} multiline minRows={2} maxRows={5} sx={{ flex: 3, minWidth: 0, fontSize: 14, '.MuiInputBase-root': { minHeight: 56, fontSize: 14, py: 0.5 } }} placeholder="Descreva a ocorrência..." />
              <Button variant="contained" color="primary" type="submit" sx={{ height: 36, px: 2.5, fontWeight: 600, fontSize: 13, boxShadow: 1, minWidth: 70 }}>Salvar</Button>
            </Box>
          </Box>
        </Paper>
      </Paper>
      {/* Grid de ocorrências do aluno selecionado */}
      {alunoId && (
        <Paper sx={{ p: 0, mb: 2, minHeight: 0 }}>
          <Box sx={{ py: 1.5, px: 2, background: '#0072C3', color: '#fff' }}>
            <Typography variant="h6" mb={0} sx={{ fontSize: 15, fontWeight: 600, color: '#fff' }}>Ocorrências do Aluno</Typography>
          </Box>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1.5px solid #bdbdbd', background: '#fafbfc', borderRadius: 0 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ height: 40, minHeight: 40, background: '#f0f0f0' }}>
                  <TableCell sx={{ fontWeight: 700, py: 1, height: 40, minHeight: 40, fontSize: 13, color: '#333' }}>ID</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1, height: 40, minHeight: 40, fontSize: 13, color: '#333' }}>Turma</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1, height: 40, minHeight: 40, fontSize: 13, color: '#333' }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1, height: 40, minHeight: 40, fontSize: 13, color: '#333' }}>Data</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1, height: 40, minHeight: 40, fontSize: 13, color: '#333' }}>Hora</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1, height: 40, minHeight: 40, fontSize: 13, color: '#333' }}>Observações</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1, height: 40, minHeight: 40, fontSize: 13, color: '#333' }}>Professor</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1, height: 40, minHeight: 40, fontSize: 13, color: '#333' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700, py: 1, height: 40, minHeight: 40, fontSize: 13, color: '#333' }}>Criado em</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ocorrenciasAluno.map(o => (
                  <TableRow key={o.id} sx={{ height: 36, minHeight: 36, '&:hover': { background: '#f5f5f5' } }}>
                    <TableCell sx={{ py: 0.5, height: 36, minHeight: 36, fontSize: 13 }}>{o.id}</TableCell>
                    <TableCell sx={{ py: 0.5, height: 36, minHeight: 36, fontSize: 13 }}>{turmas.find(t => t.id === o.turmaId)?.nome || o.turmaId}</TableCell>
                    <TableCell sx={{ py: 0.5, height: 36, minHeight: 36, fontSize: 13 }}>{o.tipoOcorrencia?.nome || o.tipoOcorrenciaString || o.tipoOcorrenciaId}</TableCell>
                    <TableCell sx={{ py: 0.5, height: 36, minHeight: 36, fontSize: 13 }}>{o.dataOcorrencia}</TableCell>
                    <TableCell sx={{ py: 0.5, height: 36, minHeight: 36, fontSize: 13 }}>{(o.horaOcorrencia && typeof o.horaOcorrencia.hour === 'number') ? `${String(o.horaOcorrencia.hour).padStart(2, '0')}:${String(o.horaOcorrencia.minute).padStart(2, '0')}` : ''}</TableCell>
                    <TableCell sx={{ py: 0.5, height: 36, minHeight: 36, fontSize: 13 }}>{o.observacoes}</TableCell>
                    <TableCell sx={{ py: 0.5, height: 36, minHeight: 36, fontSize: 13 }}>{o.nomeProfessor}</TableCell>
                    <TableCell sx={{ py: 0.5, height: 36, minHeight: 36, fontSize: 13 }}>{o.emailProfessor}</TableCell>
                    <TableCell sx={{ py: 0.5, height: 36, minHeight: 36, fontSize: 13 }}>{(() => {
                      if (!o.criadoEm) return '';
                      const [date, time] = o.criadoEm.split('T');
                      return date + (time ? ' ' + time.slice(0, 8) : '');
                    })()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default OcorrenciaForm;

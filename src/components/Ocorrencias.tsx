import React, { useEffect, useState } from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, TextField } from '@mui/material';

interface Ocorrencia {
  id: number;
  alunoId: number;
  turmaId: number;
  tipoOcorrencia: { nome: string };
  dataOcorrencia: string;
  observacoes: string;
  emailProfessor: string;
  nomeProfessor: string;
}
interface Aluno { id: number; nome: string; }
interface Turma { id: number; nome: string; }

const Ocorrencias: React.FC = () => {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [filtroAluno, setFiltroAluno] = useState('');
  const [filtroTurma, setFiltroTurma] = useState('');

  useEffect(() => {
    fetch('http://localhost:8083/ocorrencias')
      .then(r => r.json())
      .then(data => setOcorrencias(Array.isArray(data) ? data : []))
      .catch(() => setOcorrencias([]));
    
    fetch('http://localhost:8083/alunos')
      .then(r => r.json())
      .then(data => setAlunos(Array.isArray(data) ? data : []))
      .catch(() => setAlunos([]));
    
    fetch('http://localhost:8083/turmas')
      .then(r => r.json())
      .then(data => setTurmas(Array.isArray(data) ? data : []))
      .catch(() => setTurmas([]));
  }, []);

  const ocorrenciasFiltradas = ocorrencias.filter(o => {
    const aluno = alunos.find(a => a.id === o.alunoId);
    const turma = turmas.find(t => t.id === o.turmaId);
    const alunoMatch = filtroAluno === '' || (aluno && aluno.nome.toLowerCase().includes(filtroAluno.toLowerCase()));
    const turmaMatch = filtroTurma === '' || (turma && turma.nome.toLowerCase().includes(filtroTurma.toLowerCase()));
    return alunoMatch && turmaMatch;
  });

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={2}>Lista de Ocorrências</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Filtrar por aluno"
            value={filtroAluno}
            onChange={e => setFiltroAluno(e.target.value)}
            size="small"
            sx={{ width: 250 }}
            InputProps={{ sx: { fontSize: 14 } }}
            InputLabelProps={{ sx: { fontSize: 14 } }}
          />
          <TextField
            label="Filtrar por turma"
            value={filtroTurma}
            onChange={e => setFiltroTurma(e.target.value)}
            size="small"
            sx={{ width: 200 }}
            InputProps={{ sx: { fontSize: 14 } }}
            InputLabelProps={{ sx: { fontSize: 14 } }}
          />
        </Box>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Aluno</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Turma</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Data</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Professor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Observações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ocorrenciasFiltradas.map(o => {
                const aluno = alunos.find(a => a.id === o.alunoId);
                const turma = turmas.find(t => t.id === o.turmaId);
                return (
                  <TableRow key={o.id}>
                    <TableCell>{o.id}</TableCell>
                    <TableCell sx={{ fontSize: 14 }}>{aluno?.nome || o.alunoId}</TableCell>
                    <TableCell sx={{ fontSize: 14 }}>{turma?.nome || o.turmaId}</TableCell>
                    <TableCell sx={{ fontSize: 14 }}>{o.tipoOcorrencia?.nome || ''}</TableCell>
                    <TableCell sx={{ fontSize: 14 }}>{o.dataOcorrencia}</TableCell>
                    <TableCell sx={{ fontSize: 14 }}>{o.nomeProfessor}</TableCell>
                    <TableCell sx={{ fontSize: 14 }}>{o.observacoes}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Ocorrencias;

import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Stack, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import API_URL from '../config';


interface Aluno {
  id: number;
  nome: string;
  turmaId: number;
}

interface Turma {
  id: number;
  nome: string;
  periodo: string;
  anoLetivo: number;
  escola: {
    id: number;
    nome: string;
  };
}

const AlunoForm: React.FC = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [nome, setNome] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroTurma, setFiltroTurma] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/alunos`)
      .then(res => res.json())
      .then(data => setAlunos(data));
    fetch(`${API_URL}/turmas`)
      .then(res => res.json())
      .then(data => setTurmas(data));
  }, []);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (editId === null) {
      // Cadastrar novo aluno
      fetch(`${API_URL}/alunos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, turmaId: Number(turmaId) })
      })
        .then(res => res.json())
        .then(novo => {
          setAlunos(alunos => [...alunos, novo]);
          setNome('');
          setTurmaId('');
          setEditId(null);
        });
    } else {
      // Atualizar aluno existente
      fetch(`${API_URL}/alunos/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, turmaId: Number(turmaId) })
      })
        .then(res => res.json())
        .then(atualizado => {
          setAlunos(alunos => alunos.map(a => a.id === editId ? atualizado : a));
          setNome('');
          setTurmaId('');
          setEditId(null);
        });
    }
  };

  const handleEdit = (aluno: Aluno) => {
    setEditId(aluno.id);
    setNome(aluno.nome);
    setTurmaId(aluno.turmaId.toString());
  };

  // Filtro aplicado sobre alunos
  const alunosFiltrados = alunos.filter(aluno => {
    const turma = turmas.find(t => t.id === aluno.turmaId);
    const nomeMatch = aluno.nome.toLowerCase().includes(filtroNome.toLowerCase());
    const turmaMatch = turma ? (
      turma.nome.toLowerCase().includes(filtroTurma.toLowerCase()) ||
      turma.periodo.toLowerCase().includes(filtroTurma.toLowerCase()) ||
      turma.anoLetivo.toString().includes(filtroTurma)
    ) : false;
    return nomeMatch && (filtroTurma === '' || turmaMatch);
  });

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3, mb: 3, borderLeft: '3px solid #0072C3' }}>
        <Typography variant="h6" mb={2} sx={{ borderBottom: '2px solid #e3f2fd', pb: 1 }}>Cadastro de Aluno</Typography>
        <Box component="form" display="flex" flexDirection="row" gap={2} alignItems="center" onSubmit={handleSubmit}>
          <TextField label="Nome do Aluno" value={nome} onChange={e => setNome(e.target.value)} required fullWidth InputProps={{ sx: { fontSize: 14 } }} InputLabelProps={{ sx: { fontSize: 14 } }} />
          <FormControl sx={{ minWidth: 180 }} required>
            <InputLabel id="turma-select-label" sx={{ fontSize: 14 }}>Turma</InputLabel>
            <Select
              labelId="turma-select-label"
              value={turmaId}
              label="Turma"
              onChange={e => setTurmaId(e.target.value)}
              sx={{ fontSize: 14 }}
            >
              <MenuItem value="" sx={{ fontSize: 14, color: '#888' }}>
                Selecione...
              </MenuItem>
              {turmas.map(turma => (
                <MenuItem key={turma.id} value={turma.id} sx={{ fontSize: 14 }}>
                  {turma.nome} - {turma.periodo} ({turma.anoLetivo})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" type="submit" sx={{ fontSize: 14, px: 2, minWidth: 90 }}>
            {editId === null ? 'Salvar' : 'Atualizar'}
          </Button>
          {editId !== null && (
            <Button variant="outlined" color="secondary" onClick={() => { setEditId(null); setNome(''); setTurmaId(''); }} sx={{ fontSize: 14, px: 2, minWidth: 90 }}>
              Cancelar
            </Button>
          )}
        </Box>
      </Paper>
      {/* Filtros e quantidade */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
        <Paper sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flex: 1 }}>
          <TextField
            label="Filtrar por nome"
            value={filtroNome}
            onChange={e => setFiltroNome(e.target.value)}
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
        </Paper>
        <Typography variant="body2" sx={{ minWidth: 120, textAlign: 'right', fontWeight: 500 }}>
          {alunosFiltrados.length} aluno{alunosFiltrados.length === 1 ? '' : 's'}
        </Typography>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ height: 36 }}>
              <TableCell sx={{ py: 0.5, fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ py: 0.5, fontWeight: 600 }}>Nome</TableCell>
              <TableCell sx={{ py: 0.5, fontWeight: 600 }}>Turma</TableCell>
              <TableCell align="center" sx={{ py: 0.5, fontWeight: 600 }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alunosFiltrados.map(aluno => (
              <TableRow key={aluno.id} sx={{ height: 36 }}>
                <TableCell sx={{ py: 0.5 }}>{aluno.id}</TableCell>
                <TableCell sx={{ py: 0.5, fontSize: 14 }}>{aluno.nome}</TableCell>
                <TableCell sx={{ py: 0.5, fontSize: 14 }}>
                  {turmas.find(t => t.id === aluno.turmaId)?.nome || aluno.turmaId}
                </TableCell>
                <TableCell align="center" sx={{ py: 0.5 }}>
                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    <IconButton color="primary" size="small" title="Visualizar" sx={{ p: 0.5 }}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="secondary" size="small" title="Editar" sx={{ p: 0.5 }} onClick={() => handleEdit(aluno)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AlunoForm;

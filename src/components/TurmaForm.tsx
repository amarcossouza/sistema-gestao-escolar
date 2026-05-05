import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Stack, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import API_URL from '../config';

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

const periodos = ['Manha', 'Tarde', 'Noite'];

const TurmaForm: React.FC = () => {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [nome, setNome] = useState('');
  const [periodo, setPeriodo] = useState('');
  // Ano letivo: select de 2026 a 2030, default ano atual se no range
  const anoAtual = new Date().getFullYear();
  const anosLetivos = [2026, 2027, 2028, 2029, 2030];
  const anoInicial = anosLetivos.includes(anoAtual) ? anoAtual.toString() : '2026';
  const [anoLetivo, setAnoLetivo] = useState(anoInicial);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroPeriodo, setFiltroPeriodo] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/turmas`)
      .then(res => res.json())
      .then(data => setTurmas(data));
  }, []);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!nome || !periodo || !anoLetivo) return;
    if (editId === null) {
      fetch(`${API_URL}/turmas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, periodo, anoLetivo: Number(anoLetivo), escola: { id: 1, nome: '' } })
      })
        .then(res => res.json())
        .then(nova => {
          setTurmas(turmas => [...turmas, nova]);
          setNome('');
          setPeriodo('');
          setAnoLetivo('');
          setEditId(null);
        });
    } else {
      fetch(`${API_URL}/turmas/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, periodo, anoLetivo: Number(anoLetivo), escola: { id: 1, nome: '' } })
      })
        .then(res => res.json())
        .then(atualizada => {
          setTurmas(turmas => turmas.map(t => t.id === editId ? atualizada : t));
          setNome('');
          setPeriodo('');
          setAnoLetivo('');
          setEditId(null);
        });
    }
  };

  const handleEdit = (turma: Turma) => {
    setEditId(turma.id);
    setNome(turma.nome);
    // Corrige para remover acento se vier do backend
    let periodoPadrao = turma.periodo;
    if (periodoPadrao.normalize) {
      periodoPadrao = periodoPadrao.normalize('NFD').replace(/\p{Diacritic}/gu, '');
    }
    setPeriodo(periodoPadrao);
    setAnoLetivo(turma.anoLetivo.toString());
  };

  const turmasFiltradas = turmas.filter(turma => {
    const nomeMatch = turma.nome.toLowerCase().includes(filtroNome.toLowerCase());
    const periodoMatch = turma.periodo.toLowerCase().includes(filtroPeriodo.toLowerCase());
    return nomeMatch && (filtroPeriodo === '' || periodoMatch);
  });

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3, mb: 3, borderLeft: '3px solid #0072C3' }}>
        <Typography variant="h6" mb={2} sx={{ borderBottom: '2px solid #e3f2fd', pb: 1 }}>Cadastro de Turma</Typography>
        <Box component="form" display="flex" flexDirection="row" gap={2} alignItems="center" onSubmit={handleSubmit}>
          <TextField label="Nome da Turma" value={nome} onChange={e => setNome(e.target.value)} required fullWidth InputProps={{ sx: { fontSize: 14 } }} InputLabelProps={{ sx: { fontSize: 14 } }} />
          <FormControl sx={{ minWidth: 140 }} required>
            <InputLabel id="periodo-select-label" sx={{ fontSize: 14 }}>Período</InputLabel>
            <Select
              labelId="periodo-select-label"
              value={periodo}
              label="Período"
              onChange={e => setPeriodo(e.target.value)}
              sx={{ fontSize: 14 }}
            >
              <MenuItem value="" sx={{ fontSize: 14, color: '#888' }}>Selecione...</MenuItem>
              {periodos.map(p => (
                <MenuItem key={p} value={p} sx={{ fontSize: 14 }}>{p}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }} required>
            <InputLabel id="ano-letivo-label" sx={{ fontSize: 14 }}>Ano Letivo</InputLabel>
            <Select
              labelId="ano-letivo-label"
              value={anoLetivo}
              label="Ano Letivo"
              onChange={e => setAnoLetivo(e.target.value)}
              sx={{ fontSize: 14 }}
            >
              {anosLetivos.map(ano => (
                <MenuItem key={ano} value={ano.toString()} sx={{ fontSize: 14 }}>{ano}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" color="primary" type="submit" sx={{ fontSize: 14, px: 2, minWidth: 90 }}>
            {editId === null ? 'Salvar' : 'Atualizar'}
          </Button>
          {editId !== null && (
            <Button variant="outlined" color="secondary" onClick={() => { setEditId(null); setNome(''); setPeriodo(''); setAnoLetivo(''); }} sx={{ fontSize: 14, px: 2, minWidth: 90 }}>
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
            label="Filtrar por período"
            value={filtroPeriodo}
            onChange={e => setFiltroPeriodo(e.target.value)}
            size="small"
            sx={{ width: 200 }}
            InputProps={{ sx: { fontSize: 14 } }}
            InputLabelProps={{ sx: { fontSize: 14 } }}
          />
        </Paper>
        <Typography variant="body2" sx={{ minWidth: 120, textAlign: 'right', fontWeight: 500 }}>
          {turmasFiltradas.length} turma{turmasFiltradas.length === 1 ? '' : 's'}
        </Typography>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ height: 36 }}>
              <TableCell sx={{ py: 0.5, fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ py: 0.5, fontWeight: 600 }}>Nome</TableCell>
              <TableCell sx={{ py: 0.5, fontWeight: 600 }}>Período</TableCell>
              <TableCell sx={{ py: 0.5, fontWeight: 600 }}>Ano</TableCell>
              <TableCell align="center" sx={{ py: 0.5, fontWeight: 600 }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {turmasFiltradas.map(turma => (
              <TableRow key={turma.id} sx={{ height: 36 }}>
                <TableCell sx={{ py: 0.5 }}>{turma.id}</TableCell>
                <TableCell sx={{ py: 0.5, fontSize: 14 }}>{turma.nome}</TableCell>
                <TableCell sx={{ py: 0.5, fontSize: 14 }}>{turma.periodo}</TableCell>
                <TableCell sx={{ py: 0.5, fontSize: 14 }}>{turma.anoLetivo}</TableCell>
                <TableCell align="center" sx={{ py: 0.5 }}>
                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    <IconButton color="secondary" size="small" title="Editar" sx={{ p: 0.5 }} onClick={() => handleEdit(turma)}>
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

export default TurmaForm;

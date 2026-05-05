import React, { useEffect, useState } from 'react';
import {
  Box, TextField, Button, Typography, Paper, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Stack, Chip, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, MenuItem, FormControlLabel, Switch
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import API_URL from '../config';

interface Professor {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  cargo: string;
  siglaMateria?: string;
  nomeMateria?: string;
  ativo: boolean;
}

interface Cargo {
  id: number;
  valor: string;
  descricao: string;
}

const MATERIAS = [
  { sigla: 'MAT', nome: 'Matemática' },
  { sigla: 'POR', nome: 'Português' },
  { sigla: 'HIS', nome: 'História' },
  { sigla: 'GEO', nome: 'Geografia' },
  { sigla: 'CIE', nome: 'Ciências' },
  { sigla: 'EDF', nome: 'Educação Física' },
  { sigla: 'ART', nome: 'Artes' },
  { sigla: 'FIS', nome: 'Física' },
  { sigla: 'QUI', nome: 'Química' },
  { sigla: 'SOC', nome: 'Sociologia' },
];

const formVazio = { nome: '', email: '', telefone: '', cargo: '', siglaMateria: '', nomeMateria: '', ativo: true };

const ProfessorForm: React.FC = () => {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(formVazio);
  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroEmail, setFiltroEmail] = useState('');
  const [filtroTelefone, setFiltroTelefone] = useState('');
  const [filtroMateria, setFiltroMateria] = useState('');
  const [filtroCargo, setFiltroCargo] = useState('');

  const professoresFiltrados = professores.filter(p =>
    (!filtroNome     || p.nome.toLowerCase().includes(filtroNome.toLowerCase())) &&
    (!filtroEmail    || p.email.toLowerCase().includes(filtroEmail.toLowerCase())) &&
    (!filtroTelefone || (p.telefone || '').toLowerCase().includes(filtroTelefone.toLowerCase())) &&
    (!filtroMateria  || p.siglaMateria === filtroMateria || (p.nomeMateria || '').toLowerCase().includes(filtroMateria.toLowerCase())) &&
    (!filtroCargo    || p.cargo === filtroCargo)
  );

  const limparFiltros = () => { setFiltroNome(''); setFiltroEmail(''); setFiltroTelefone(''); setFiltroMateria(''); setFiltroCargo(''); };
  const temFiltro = filtroNome || filtroEmail || filtroTelefone || filtroMateria || filtroCargo;

  const carregar = () => {
    fetch(`${API_URL}/professores`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setProfessores(Array.isArray(data) ? data : []));
  };

  const carregarCargos = () => {
    fetch(`${API_URL}/cargos`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setCargos(Array.isArray(data) ? data : []));
  };

  useEffect(() => { carregar(); carregarCargos(); }, []);

  const handleSiglaChange = (sigla: string) => {
    const materia = MATERIAS.find(m => m.sigla === sigla);
    setForm(f => ({ ...f, siglaMateria: sigla, nomeMateria: materia?.nome || f.nomeMateria }));
  };

  const abrirNovo = () => {
    setEditId(null);
    setForm(formVazio);
    setErro('');
    setModalAberto(true);
  };

  const abrirEditar = (p: Professor) => {
    setEditId(p.id);
    setForm({ nome: p.nome, email: p.email, telefone: p.telefone || '', cargo: p.cargo || '', siglaMateria: p.siglaMateria || '', nomeMateria: p.nomeMateria || '', ativo: p.ativo });
    setErro('');
    setModalAberto(true);
  };

  const fecharModal = () => { setModalAberto(false); setErro(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    const url = editId === null ? `${API_URL}/professores` : `${API_URL}/professores/${editId}`;
    const method = editId === null ? 'POST' : 'PUT';
    const payload: Record<string, unknown> = { nome: form.nome, email: form.email, telefone: form.telefone || null, cargo: form.cargo, ativo: form.ativo };
    if (form.cargo === 'PROFESSOR') {
      payload.siglaMateria = form.siglaMateria;
      payload.nomeMateria = form.nomeMateria;
    } else {
      payload.siglaMateria = form.siglaMateria || null;
      payload.nomeMateria = form.nomeMateria || null;
    }
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async res => {
        const text = await res.text();
        if (res.status === 409) throw new Error('Email já cadastrado');
        if (res.status === 404) throw new Error('Funcionário não encontrado');
        if (!res.ok) throw new Error(text || 'Erro ao salvar');
        return text;
      })
      .then(() => {
        setSucesso(editId === null ? 'Funcionário cadastrado com sucesso!' : 'Funcionário atualizado com sucesso!');
        fecharModal();
        carregar();
      })
      .catch(err => setErro(err.message));
  };

  const handleDelete = (id: number) => {
    fetch(`${API_URL}/professores/${id}`, { method: 'DELETE' })
      .then(async res => {
        if (res.status === 404) throw new Error('Funcionário não encontrado');
        if (!res.ok) throw new Error('Erro ao excluir');
      })
      .then(() => { setSucesso('Funcionário excluído com sucesso!'); carregar(); })
      .catch(err => { setSucesso(''); setErro(err.message); })
      .finally(() => setConfirmDeleteId(null));
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 2 }}>
      {sucesso && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSucesso('')}>{sucesso}</Alert>}
      {erro && !modalAberto && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErro('')}>{erro}</Alert>}

      <Paper sx={{ p: 0, borderLeft: '3px solid #0072C3' }}>
        <Box sx={{ py: 1.5, px: 2, background: '#0072C3', color: '#fff', borderRadius: '3px 3px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Funcionários</Typography>
          <Button size="small" variant="contained" startIcon={<AddIcon />} onClick={abrirNovo}
            sx={{ bgcolor: '#fff', color: '#0072C3', fontWeight: 600, '&:hover': { bgcolor: '#e3f2fd' } }}>
            Novo Professor
          </Button>
        </Box>
        {/* Barra de filtros */}
        <Box sx={{ px: 2, py: 1.5, display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', bgcolor: '#f8fafc', borderBottom: '1px solid #d0e4f7' }}>
          <SearchIcon sx={{ color: '#0072C3', fontSize: 20, mt: 0.5 }} />
          <TextField placeholder="Nome" value={filtroNome} onChange={e => setFiltroNome(e.target.value)} size="small" sx={{ width: 160 }} />
          <TextField placeholder="Email" value={filtroEmail} onChange={e => setFiltroEmail(e.target.value)} size="small" sx={{ width: 180 }} />
          <TextField placeholder="Telefone" value={filtroTelefone} onChange={e => setFiltroTelefone(e.target.value)} size="small" sx={{ width: 130 }} />
          <TextField select label="Cargo" value={filtroCargo} onChange={e => setFiltroCargo(e.target.value)} size="small" sx={{ width: 200 }}>
            <MenuItem value="">Todos os cargos</MenuItem>
            {cargos.map(c => <MenuItem key={c.valor} value={c.valor}>{c.descricao}</MenuItem>)}
          </TextField>
          <TextField select label="Matéria" value={filtroMateria} onChange={e => setFiltroMateria(e.target.value)} size="small" sx={{ width: 150 }}>
            <MenuItem value="">Todas as matérias</MenuItem>
            {MATERIAS.map(m => <MenuItem key={m.sigla} value={m.sigla}>{m.sigla} — {m.nome}</MenuItem>)}
          </TextField>
          {temFiltro && (
            <Tooltip title="Limpar filtros">
              <IconButton size="small" onClick={limparFiltros} sx={{ color: '#888' }}><ClearIcon fontSize="small" /></IconButton>
            </Tooltip>
          )}
          <Typography variant="caption" sx={{ ml: 'auto', color: '#888' }}>
            {professoresFiltrados.length} de {professores.length} professor{professores.length !== 1 ? 'es' : ''}
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Telefone</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cargo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Sigla</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Matéria</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ativo</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {professores.length === 0 && (
                <TableRow><TableCell colSpan={9} align="center" sx={{ color: '#888', py: 3 }}>Nenhum cadastro encontrado</TableCell></TableRow>
              )}
              {professores.length > 0 && professoresFiltrados.length === 0 && (
                <TableRow><TableCell colSpan={9} align="center" sx={{ color: '#888', py: 3 }}>Nenhum resultado para os filtros aplicados</TableCell></TableRow>
              )}
              {professoresFiltrados.map(p => (
                <TableRow key={p.id} sx={{ height: 36 }}>
                  <TableCell sx={{ py: 0.5 }}>{p.id}</TableCell>
                  <TableCell sx={{ py: 0.5 }}>{p.nome}</TableCell>
                  <TableCell sx={{ py: 0.5, fontSize: 13 }}>{p.email}</TableCell>
                  <TableCell sx={{ py: 0.5, fontSize: 13 }}>{p.telefone || '-'}</TableCell>
                  <TableCell sx={{ py: 0.5 }}>
                    <Chip label={cargos.find(c => c.valor === p.cargo)?.descricao || p.cargo || '—'} size="small" sx={{ bgcolor: '#f0f7ff', color: '#0557a0', fontWeight: 500, fontSize: 11 }} />
                  </TableCell>
                  <TableCell sx={{ py: 0.5 }}>
                    {p.siglaMateria ? <Chip label={p.siglaMateria} size="small" sx={{ bgcolor: '#e3f2fd', color: '#0557a0', fontWeight: 600 }} /> : '-'}
                  </TableCell>
                  <TableCell sx={{ py: 0.5, fontSize: 13 }}>{p.nomeMateria || '-'}</TableCell>
                  <TableCell sx={{ py: 0.5 }}>
                    <Chip label={p.ativo ? 'Sim' : 'Não'} size="small" color={p.ativo ? 'success' : 'default'} />
                  </TableCell>
                  <TableCell align="center" sx={{ py: 0.5 }}>
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => abrirEditar(p)}><EditIcon fontSize="small" /></IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" color="error" onClick={() => setConfirmDeleteId(p.id)}><DeleteIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal cadastro/edição */}
      <Dialog open={modalAberto} onClose={fecharModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ borderBottom: '2px solid #e3f2fd', color: '#0072C3', fontWeight: 600 }}>
          {editId === null ? 'Novo Professor' : 'Editar Professor'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            {erro && <Alert severity="error" onClose={() => setErro('')}>{erro}</Alert>}
            <TextField label="Nome" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required size="small" fullWidth />
            <TextField label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required size="small" fullWidth />
            <TextField label="Telefone" value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} size="small" fullWidth />
            <TextField select label="Cargo" value={form.cargo} onChange={e => setForm(f => ({ ...f, cargo: e.target.value }))} required size="small" fullWidth>
              <MenuItem value="" disabled><em>Selecione o cargo</em></MenuItem>
              {cargos.map(c => <MenuItem key={c.valor} value={c.valor}>{c.descricao}</MenuItem>)}
            </TextField>
            <Box display="flex" gap={2}>
              <TextField select label="Sigla da Matéria" value={form.siglaMateria} onChange={e => handleSiglaChange(e.target.value)} required={form.cargo === 'PROFESSOR'} size="small" sx={{ width: 160 }}>
                <MenuItem value=""><em>—</em></MenuItem>
                {MATERIAS.map(m => <MenuItem key={m.sigla} value={m.sigla}>{m.sigla}</MenuItem>)}
              </TextField>
              <TextField label="Nome da Matéria" value={form.nomeMateria} onChange={e => setForm(f => ({ ...f, nomeMateria: e.target.value }))} required={form.cargo === 'PROFESSOR'} size="small" sx={{ flex: 1 }} />
            </Box>
            <FormControlLabel
              control={<Switch checked={form.ativo} onChange={e => setForm(f => ({ ...f, ativo: e.target.checked }))} color="primary" />}
              label="Ativo"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={fecharModal} variant="outlined" size="small">Cancelar</Button>
            <Button type="submit" variant="contained" size="small" sx={{ px: 3 }}>
              {editId === null ? 'Cadastrar' : 'Salvar'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Confirmação de exclusão */}
      <Dialog open={confirmDeleteId !== null} onClose={() => setConfirmDeleteId(null)} maxWidth="xs">
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>Deseja realmente excluir este professor? Esta ação não pode ser desfeita.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)} variant="outlined" size="small">Cancelar</Button>
          <Button onClick={() => handleDelete(confirmDeleteId!)} variant="contained" color="error" size="small">Excluir</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfessorForm;

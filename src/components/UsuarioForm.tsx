import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, TextField, Button, Typography, Paper, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Stack, Chip, Tooltip, Autocomplete, Dialog, DialogTitle,
  DialogContent, DialogActions, Switch, FormControlLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LockResetIcon from '@mui/icons-material/LockReset';
import API_URL from '../config';

interface Funcionario {
  id: number;
  nome: string;
  email: string;
  cargo: string;
}

const CARGOS: Record<string, string> = {
  PROFESSOR: 'Professor',
  VICE_DIRETOR: 'Vice-Diretor',
  DIRETOR: 'Diretor',
  COORDENADOR: 'Coordenador',
  ASSISTENTE_ADMINISTRATIVO: 'Assistente Administrativo',
  SECRETARIO: 'Secretário',
};

interface Usuario {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
  senhaTemporaria: boolean;
  tentativasLogin: number;
  criadoEm: string;
  ultimoLogin: string | null;
}

const UsuarioForm: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // form state
  const [funcSelecionado, setFuncSelecionado] = useState<Funcionario | null>(null);
  const [emailEdicao, setEmailEdicao] = useState('');
  const [senha, setSenha] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [senhaTemporaria, setSenhaTemporaria] = useState(false);

  const [sucesso, setSucesso] = useState('');
  const [erro, setErro] = useState('');

  // mapa email → funcionário para exibir nome/cargo na tabela
  const emailMap = useMemo(() => {
    const m = new Map<string, Funcionario>();
    funcionarios.forEach(f => m.set(f.email, f));
    return m;
  }, [funcionarios]);

  const carregarUsuarios = () => {
    fetch(`${API_URL}/usuarios`)
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => setUsuarios(Array.isArray(data) ? data : []))
      .catch(() => setUsuarios([]));
  };

  const carregarFuncionarios = () => {
    fetch(`${API_URL}/professores`)
      .then(res => { if (!res.ok) throw new Error(); return res.json(); })
      .then(data => setFuncionarios(Array.isArray(data) ? data : []))
      .catch(() => setFuncionarios([]));
  };

  useEffect(() => { carregarUsuarios(); carregarFuncionarios(); }, []);

  const abrirNovo = () => {
    setEditId(null);
    setFuncSelecionado(null);
    setEmailEdicao('');
    setSenha('');
    setAtivo(true);
    setSenhaTemporaria(false);
    setErro('');
    setModalOpen(true);
  };

  const abrirEditar = (u: Usuario) => {
    setEditId(u.id);
    setFuncSelecionado(emailMap.get(u.email) || null);
    setEmailEdicao(u.email);
    setSenha('');
    setAtivo(u.ativo);
    setSenhaTemporaria(u.senhaTemporaria);
    setErro('');
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    if (editId === null) {
      if (!funcSelecionado) return setErro('Selecione um funcionário');
      if (!senha) return setErro('Informe a senha inicial');
      fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: funcSelecionado.nome, email: funcSelecionado.email, senha, ativo, senhaTemporaria })
      })
        .then(async res => {
          const text = await res.text();
          if (res.status === 409) throw new Error('Este funcionário já possui acesso cadastrado');
          if (!res.ok) throw new Error(text || 'Erro ao criar acesso');
        })
        .then(() => {
          setSucesso('Acesso criado com sucesso!');
          setModalOpen(false);
          carregarUsuarios();
        })
        .catch(err => setErro(err.message));
    } else {
      fetch(`${API_URL}/usuarios/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: funcSelecionado?.nome || '', email: emailEdicao, ativo, senhaTemporaria, ...(senha ? { senha } : {}) })
      })
        .then(async res => {
          if (res.status === 404) throw new Error('Usuário não encontrado');
          if (!res.ok) throw new Error('Erro ao atualizar acesso');
          return res.json();
        })
        .then(() => {
          setSucesso('Acesso atualizado com sucesso!');
          setModalOpen(false);
          carregarUsuarios();
        })
        .catch(err => setErro(err.message));
    }
  };

  const handleResetar = (id: number) => {
    fetch(`${API_URL}/usuarios/resetar-senha/${id}`, { method: 'POST' })
      .then(async res => {
        const text = await res.text();
        if (!res.ok) throw new Error(text || 'Erro ao resetar senha');
        return text;
      })
      .then(msg => { setSucesso(msg || 'Senha resetada para temporária'); carregarUsuarios(); })
      .catch(err => setErro(err.message));
  };

  // apenas funcionários que ainda não têm acesso (para o autocomplete de criação)
  const emailsComAcesso = useMemo(() => new Set(usuarios.map(u => u.email)), [usuarios]);
  const funcionariosSemAcesso = funcionarios.filter(f => !emailsComAcesso.has(f.email));

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', mt: 2 }}>
      {sucesso && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSucesso('')}>{sucesso}</Alert>}
      {erro && !modalOpen && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErro('')}>{erro}</Alert>}

      <Paper sx={{ p: 0, borderLeft: '3px solid #0072C3' }}>
        <Box sx={{
          py: 1.5, px: 2, background: '#0072C3', color: '#fff',
          borderRadius: '3px 3px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Acessos ao Sistema</Typography>
          <Button
            variant="contained" size="small" onClick={abrirNovo}
            sx={{ bgcolor: '#fff', color: '#0072C3', '&:hover': { bgcolor: '#e3f2fd' }, fontWeight: 600 }}
          >
            + Novo Acesso
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cargo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ativo</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Senha Temp.</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tentativas</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Criado em</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {usuarios.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ color: '#888', py: 3 }}>
                    Nenhum acesso cadastrado
                  </TableCell>
                </TableRow>
              )}
              {usuarios.map(u => {
                const func = emailMap.get(u.email);
                return (
                  <TableRow key={u.id} sx={{ height: 36 }}>
                    <TableCell sx={{ py: 0.5, fontWeight: 500 }}>{u.nome || func?.nome || '—'}</TableCell>
                    <TableCell sx={{ py: 0.5, fontSize: 13 }}>{u.email}</TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      {func
                        ? <Chip label={CARGOS[func.cargo] || func.cargo} size="small" sx={{ bgcolor: '#f0f7ff', color: '#0557a0', fontSize: 11, fontWeight: 500 }} />
                        : <span style={{ color: '#bbb', fontSize: 12 }}>—</span>
                      }
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Chip label={u.ativo ? 'Sim' : 'Não'} size="small" color={u.ativo ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Chip label={u.senhaTemporaria ? 'Sim' : 'Não'} size="small" color={u.senhaTemporaria ? 'warning' : 'default'} />
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>{u.tentativasLogin}</TableCell>
                    <TableCell sx={{ py: 0.5, fontSize: 13 }}>
                      {u.criadoEm ? new Date(u.criadoEm).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 0.5 }}>
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title="Editar acesso">
                          <IconButton size="small" onClick={() => abrirEditar(u)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Resetar senha (define senha temporária)">
                          <IconButton size="small" color="warning" onClick={() => handleResetar(u.id)}>
                            <LockResetIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal criar / editar acesso */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ borderBottom: '2px solid #e3f2fd', pb: 1 }}>
          {editId === null ? 'Novo Acesso ao Sistema' : 'Editar Acesso'}
        </DialogTitle>
        <DialogContent>
          <Box
            component="form"
            id="usuario-form"
            onSubmit={handleSubmit}
            display="flex"
            flexDirection="column"
            gap={2}
            mt={2}
          >
            {erro && <Alert severity="error" onClose={() => setErro('')}>{erro}</Alert>}

            {editId === null ? (
              <Autocomplete
                options={funcionariosSemAcesso}
                getOptionLabel={f => `${f.nome} — ${CARGOS[f.cargo] || f.cargo}`}
                value={funcSelecionado}
                onChange={(_, v) => setFuncSelecionado(v)}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="Buscar funcionário"
                    required
                    size="small"
                    placeholder="Digite o nome para buscar..."
                    helperText={funcSelecionado ? `Email: ${funcSelecionado.email}` : ' '}
                  />
                )}
                noOptionsText="Nenhum funcionário sem acesso encontrado"
              />
            ) : (
              <TextField
                label="Funcionário"
                value={funcSelecionado ? `${funcSelecionado.nome} (${funcSelecionado.email})` : emailEdicao}
                size="small"
                fullWidth
                InputProps={{ readOnly: true }}
                disabled
              />
            )}

            <TextField
              label={editId ? 'Nova Senha (deixe em branco para manter)' : 'Senha Inicial'}
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required={editId === null}
              type="password"
              size="small"
              fullWidth
            />

            <Box display="flex" gap={3}>
              <FormControlLabel
                control={<Switch checked={ativo} onChange={e => setAtivo(e.target.checked)} color="primary" />}
                label="Ativo"
              />
              <FormControlLabel
                control={<Switch checked={senhaTemporaria} onChange={e => setSenhaTemporaria(e.target.checked)} color="warning" />}
                label="Senha Temporária"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setModalOpen(false)} variant="outlined" size="small">Cancelar</Button>
          <Button type="submit" form="usuario-form" variant="contained" size="small" sx={{ px: 3 }}>
            {editId === null ? 'Criar Acesso' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsuarioForm;

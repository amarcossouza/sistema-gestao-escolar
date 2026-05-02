import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

interface Usuario {
  id?: number;
  email: string;
  senha: string;
  ativo: boolean;
  tentativasLogin: number;
  senhaTemporaria: boolean;
}

const UsuarioForm: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [tentativasLogin, setTentativasLogin] = useState(0);
  const [senhaTemporaria, setSenhaTemporaria] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:8083/usuarios')
      .then(res => res.json())
      .then(data => setUsuarios(data));
  }, []);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    const usuario: Usuario = { email, senha, ativo, tentativasLogin, senhaTemporaria };
    if (editId === null) {
      fetch('http://localhost:8083/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
      })
        .then(res => res.json())
        .then(novo => {
          setUsuarios(usuarios => [...usuarios, novo]);
          limparForm();
        });
    } else {
      fetch(`http://localhost:8083/usuarios/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario)
      })
        .then(res => res.json())
        .then(atualizado => {
          setUsuarios(usuarios => usuarios.map(u => u.id === editId ? atualizado : u));
          limparForm();
        });
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditId(usuario.id!);
    setEmail(usuario.email);
    setSenha(usuario.senha);
    setAtivo(usuario.ativo);
    setTentativasLogin(usuario.tentativasLogin);
    setSenhaTemporaria(usuario.senhaTemporaria);
  };

  const limparForm = () => {
    setEditId(null);
    setEmail('');
    setSenha('');
    setAtivo(true);
    setTentativasLogin(0);
    setSenhaTemporaria(false);
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" mb={2}>Cadastro de Usuário</Typography>
        <Box component="form" display="flex" flexDirection="row" gap={2} alignItems="center" onSubmit={handleSubmit}>
          <TextField label="Email" value={email} onChange={e => setEmail(e.target.value)} required sx={{ width: 220 }} InputProps={{ sx: { fontSize: 14 } }} InputLabelProps={{ sx: { fontSize: 14 } }} />
          <TextField label="Senha" value={senha} onChange={e => setSenha(e.target.value)} required type="password" sx={{ width: 120 }} InputProps={{ sx: { fontSize: 14 } }} InputLabelProps={{ sx: { fontSize: 14 } }} />
          <TextField label="Tentativas" value={tentativasLogin} onChange={e => setTentativasLogin(Number(e.target.value))} type="number" sx={{ width: 80 }} InputProps={{ sx: { fontSize: 14 } }} InputLabelProps={{ sx: { fontSize: 14 } }} />
           <TextField label="Ativo" value={ativo ? 'Sim' : 'Não'} onClick={() => setAtivo(a => !a)} sx={{ width: 70 }} InputProps={{ sx: { fontSize: 14, cursor: 'pointer' }, readOnly: true }} InputLabelProps={{ sx: { fontSize: 14 } }} />
           <TextField label="Senha Temporária" value={senhaTemporaria ? 'Sim' : 'Não'} onClick={() => setSenhaTemporaria(s => !s)} sx={{ width: 110 }} InputProps={{ sx: { fontSize: 14, cursor: 'pointer' }, readOnly: true }} InputLabelProps={{ sx: { fontSize: 14 } }} />
          <Button variant="contained" color="primary" type="submit" sx={{ fontSize: 14, px: 2, minWidth: 90 }}>
            {editId === null ? 'Salvar' : 'Atualizar'}
          </Button>
          {editId !== null && (
            <Button variant="outlined" color="secondary" onClick={limparForm} sx={{ fontSize: 14, px: 2, minWidth: 90 }}>
              Cancelar
            </Button>
          )}
        </Box>
      </Paper>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ height: 36 }}>
              <TableCell sx={{ py: 0.5, fontWeight: 600 }}>ID</TableCell>
              <TableCell sx={{ py: 0.5, fontWeight: 600 }}>Email</TableCell>
              <TableCell sx={{ py: 0.5, fontWeight: 600 }}>Ativo</TableCell>
              <TableCell sx={{ py: 0.5, fontWeight: 600 }}>Tentativas</TableCell>
              <TableCell sx={{ py: 0.5, fontWeight: 600 }}>Senha Temporária</TableCell>
              <TableCell align="center" sx={{ py: 0.5, fontWeight: 600 }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usuarios.map(usuario => (
              <TableRow key={usuario.id} sx={{ height: 36 }}>
                <TableCell sx={{ py: 0.5 }}>{usuario.id}</TableCell>
                <TableCell sx={{ py: 0.5, fontSize: 14 }}>{usuario.email}</TableCell>
                <TableCell sx={{ py: 0.5, fontSize: 14 }}>{usuario.ativo ? 'Sim' : 'Não'}</TableCell>
                <TableCell sx={{ py: 0.5, fontSize: 14 }}>{usuario.tentativasLogin}</TableCell>
                <TableCell sx={{ py: 0.5, fontSize: 14 }}>{usuario.senhaTemporaria ? 'Sim' : 'Não'}</TableCell>
                <TableCell align="center" sx={{ py: 0.5 }}>
                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    <IconButton color="secondary" size="small" title="Editar" sx={{ p: 0.5 }} onClick={() => handleEdit(usuario)}>
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

export default UsuarioForm;

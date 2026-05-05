import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import API_URL from '../config';

const TrocarSenha: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { email?: string; obrigatorio?: boolean } | null;

  const [email, setEmail] = useState(state?.email || '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [senhaNova, setSenhaNova] = useState('');
  const [senhaConfirm, setSenhaConfirm] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(''); setSucesso('');
    if (senhaNova !== senhaConfirm) {
      setErro('As senhas não coincidem');
      return;
    }
    if (senhaNova.length < 4) {
      setErro('A nova senha deve ter pelo menos 4 caracteres');
      return;
    }
    setLoading(true);
    fetch(`${API_URL}/trocar-senha`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senhaAtual, senhaNova })
    })
      .then(async res => {
        const text = await res.text();
        if (res.status === 401) throw new Error(text || 'Senha atual incorreta');
        if (res.status === 404) throw new Error('Usuário não encontrado');
        if (!res.ok) throw new Error(text || 'Erro ao trocar senha');
        return text;
      })
      .then(() => {
        setSucesso('Senha alterada com sucesso!');
        setTimeout(() => navigate('/'), 1500);
      })
      .catch(err => setErro(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8f9fa' }}>
      <Paper sx={{ p: 4, minWidth: 340, maxWidth: 420, borderLeft: '3px solid #0072C3' }}>
        <Typography variant="h6" mb={1}>Trocar Senha</Typography>
        {state?.obrigatorio && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Sua senha é temporária. Defina uma nova senha para continuar.
          </Alert>
        )}
        {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
        {sucesso && <Alert severity="success" sx={{ mb: 2 }}>{sucesso}</Alert>}
        <Box component="form" display="flex" flexDirection="column" gap={2} onSubmit={handleSubmit}>
          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            size="small"
            disabled={!!state?.email}
          />
          <TextField
            label="Senha Atual"
            type="password"
            value={senhaAtual}
            onChange={e => setSenhaAtual(e.target.value)}
            required
            size="small"
            disabled={loading}
          />
          <TextField
            label="Nova Senha"
            type="password"
            value={senhaNova}
            onChange={e => setSenhaNova(e.target.value)}
            required
            size="small"
            disabled={loading}
          />
          <TextField
            label="Confirmar Nova Senha"
            type="password"
            value={senhaConfirm}
            onChange={e => setSenhaConfirm(e.target.value)}
            required
            size="small"
            disabled={loading}
          />
          <Box display="flex" gap={1} justifyContent="flex-end">
            {!state?.obrigatorio && (
              <Button variant="outlined" onClick={() => navigate(-1)} disabled={loading} size="small">
                Cancelar
              </Button>
            )}
            <Button type="submit" variant="contained" color="primary" disabled={loading} size="small" sx={{ px: 3 }}>
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Alterar Senha'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default TrocarSenha;

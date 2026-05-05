
import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import API_URL from '../config';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha: password })
    })
      .then(async res => {
        const text = await res.text();
        if (res.status === 403 && text.includes('SENHA_TEMPORARIA')) {
          login(email);
          navigate('/trocar-senha', { state: { email, obrigatorio: true } });
          return;
        }
        if (!res.ok) throw new Error(text || 'Erro ao realizar login');
        login(email);
        navigate('/');
      })
      .catch(err => setErro(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <Box sx={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff' }}>
      <Box sx={{ p: 4, minWidth: 320, boxShadow: 2, borderRadius: 2, bgcolor: '#fff' }}>
        <Typography variant="h5" mb={2} align="center">Login</Typography>
        {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="E-mail"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={loading}
          />
          <TextField
            label="Senha"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            disabled={loading}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Entrar'}
          </Button>
        </form>
      </Box>
    </Box>
  );
};

export default Login;

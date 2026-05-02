import React from 'react';
import { Typography, Paper } from '@mui/material';

const Home: React.FC = () => {
  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" mb={2}>Bem-vindo ao ERP Escola</Typography>
      <Typography>Selecione uma opção no menu lateral.</Typography>
    </Paper>
  );
};

export default Home;

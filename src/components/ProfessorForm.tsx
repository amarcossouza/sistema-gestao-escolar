import React from 'react';
import { Box, TextField, Button, Typography, Paper } from '@mui/material';

const ProfessorForm: React.FC = () => {
  return (
    <Paper sx={{ p: 3, maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Typography variant="h6" mb={2}>Cadastro de Professor</Typography>
      <Box component="form" display="flex" flexDirection="column" gap={2}>
        <TextField label="Nome do Professor" fullWidth required />
        <TextField label="Disciplina" fullWidth required />
        <Button variant="contained" color="primary" type="submit">Salvar</Button>
      </Box>
    </Paper>
  );
};

export default ProfessorForm;

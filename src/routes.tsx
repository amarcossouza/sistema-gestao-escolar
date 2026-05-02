import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import AlunoForm from './components/AlunoForm';
import ProfessorForm from './components/ProfessorForm';
import TurmaForm from './components/TurmaForm';
import Ocorrencias from './components/Ocorrencias';
import FrequenciaForm from './components/FrequenciaForm';
import FrequenciaAulas from './components/FrequenciaAulas';
import OcorrenciaForm from './components/OcorrenciaForm';
import UsuarioForm from './components/UsuarioForm';

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/alunos" element={<AlunoForm />} />
    <Route path="/professores" element={<ProfessorForm />} />
    <Route path="/turmas" element={<TurmaForm />} />
    <Route path="/ocorrencias" element={<Ocorrencias />} />
    <Route path="/frequencia" element={<FrequenciaForm />} />
    <Route path="/frequencia-aulas" element={<FrequenciaAulas />} />
    <Route path="/ocorrencia-form" element={<OcorrenciaForm />} />
    <Route path="/usuarios" element={<UsuarioForm />} />
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
);

export default AppRoutes;

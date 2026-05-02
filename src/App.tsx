
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './components/Login';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PageLayout from './components/PageLayout';
import AppRoutes from './routes';

const MainLayout: React.FC = () => {
  const { user } = useAuth();
  // Sidebar inicia aberto em desktop, fechado em mobile
  const getInitialSidebarState = () => window.innerWidth > 900;
  const [sidebarOpen, setSidebarOpen] = React.useState(getInitialSidebarState);
  React.useEffect(() => {
    // Ao redimensionar, não fecha o menu automaticamente
    // O menu só fecha/abre pelo hambúrguer
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  return (
    <PageLayout>
      <Header userName={user} onMenuClick={() => setSidebarOpen((open) => !open)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div style={{ flex: 1, padding: 24, overflow: 'auto', marginTop: 64 }}>
        <AppRoutes />
      </div>
    </PageLayout>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginFullScreen />} />
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};


const LoginFullScreen: React.FC = () => {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;
  // Login ocupa a tela toda, sem layout
  return (
    <div style={{ minHeight: '100vh', minWidth: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
      <Login />
    </div>
  );
};

export default App;

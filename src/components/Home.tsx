import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded';
import ClassRoundedIcon from '@mui/icons-material/ClassRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import API_URL from '../config';

interface Aluno {
  id: number;
  nome: string;
  sexo?: string;
  genero?: string;
  bolsaFamilia?: boolean;
  bolsa_familia?: boolean;
}

interface Turma {
  id: number;
  nome: string;
}

interface Ocorrencia {
  id: number;
  dataOcorrencia?: string;
}

interface Frequencia {
  aluno?: { id?: number };
  alunoId?: number;
  status?: string;
}

interface DashboardData {
  totalAlunos: number;
  totalTurmas: number;
  totalOcorrenciasMes: number;
  totalMeninos: number;
  totalMeninas: number;
  totalBolsaFamilia: number;
  totalFaltasMes: number;
  topFaltasBolsa: Array<{ aluno: string; faltas: number }>;
}

const getCurrentMonthRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const toYmd = (date: Date) => date.toISOString().slice(0, 10);
  return { start: toYmd(firstDay), end: toYmd(lastDay), month, year };
};

const normalizeGender = (value?: string): 'male' | 'female' | 'unknown' => {
  if (!value) return 'unknown';
  const normalized = value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (['m', 'masculino', 'menino', 'male'].includes(normalized)) return 'male';
  if (['f', 'feminino', 'menina', 'female'].includes(normalized)) return 'female';
  return 'unknown';
};

const hasBolsaFamilia = (aluno: Aluno): boolean => Boolean(aluno.bolsaFamilia ?? aluno.bolsa_familia);

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState<DashboardData>({
    totalAlunos: 0,
    totalTurmas: 0,
    totalOcorrenciasMes: 0,
    totalMeninos: 0,
    totalMeninas: 0,
    totalBolsaFamilia: 0,
    totalFaltasMes: 0,
    topFaltasBolsa: [],
  });

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setError('');

      try {
        const [alunosRes, turmasRes, ocorrenciasRes] = await Promise.all([
          fetch(`${API_URL}/alunos`),
          fetch(`${API_URL}/turmas`),
          fetch(`${API_URL}/ocorrencias`),
        ]);

        if (!alunosRes.ok || !turmasRes.ok || !ocorrenciasRes.ok) {
          throw new Error('Falha ao carregar dados principais do dashboard.');
        }

        const alunos = (await alunosRes.json()) as Aluno[];
        const turmas = (await turmasRes.json()) as Turma[];
        const ocorrencias = (await ocorrenciasRes.json()) as Ocorrencia[];
        const { start, end, month, year } = getCurrentMonthRange();

        const freqResults = await Promise.allSettled(
          turmas.map(async (turma) => {
            const response = await fetch(`${API_URL}/frequencias?turmaId=${turma.id}&dataInicio=${start}&dataFim=${end}`);
            if (!response.ok) return [] as Frequencia[];
            return (await response.json()) as Frequencia[];
          })
        );

        const frequencias = freqResults.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
        const faltasByAluno = new Map<number, number>();
        let totalFaltasMes = 0;

        frequencias.forEach((f) => {
          const alunoId = f.aluno?.id ?? f.alunoId;
          const status = (f.status ?? '').toUpperCase();
          if (!alunoId || status !== 'F') return;
          faltasByAluno.set(alunoId, (faltasByAluno.get(alunoId) ?? 0) + 1);
          totalFaltasMes += 1;
        });

        const totalMeninos = alunos.filter((a) => normalizeGender(a.sexo ?? a.genero) === 'male').length;
        const totalMeninas = alunos.filter((a) => normalizeGender(a.sexo ?? a.genero) === 'female').length;
        const alunosBolsa = alunos.filter(hasBolsaFamilia);

        const topFaltasBolsa = alunosBolsa
          .map((aluno) => ({ aluno: aluno.nome, faltas: faltasByAluno.get(aluno.id) ?? 0 }))
          .filter((item) => item.faltas > 0)
          .sort((a, b) => b.faltas - a.faltas)
          .slice(0, 5);

        const totalOcorrenciasMes = ocorrencias.filter((o) => {
          if (!o.dataOcorrencia) return false;
          const d = new Date(o.dataOcorrencia);
          return d.getMonth() === month && d.getFullYear() === year;
        }).length;

        if (!active) return;

        setDashboard({
          totalAlunos: alunos.length,
          totalTurmas: turmas.length,
          totalOcorrenciasMes,
          totalMeninos,
          totalMeninas,
          totalBolsaFamilia: alunosBolsa.length,
          totalFaltasMes,
          topFaltasBolsa,
        });
      } catch (err) {
        if (!active) return;
        const message = err instanceof Error ? err.message : 'Erro ao carregar dashboard.';
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  const title = useMemo(() => 'Dashboard Escolar', []);
  const genderTotal = dashboard.totalMeninos + dashboard.totalMeninas;
  const boysPct = genderTotal ? Math.round((dashboard.totalMeninos / genderTotal) * 100) : 0;
  const girlsPct = genderTotal ? Math.round((dashboard.totalMeninas / genderTotal) * 100) : 0;

  const summaryCards = [
    {
      label: 'Alunos Cadastrados',
      value: dashboard.totalAlunos,
      icon: <Groups2RoundedIcon />,
      gradient: 'linear-gradient(135deg, #0b6db5 0%, #2890dc 100%)',
    },
    {
      label: 'Turmas Ativas',
      value: dashboard.totalTurmas,
      icon: <ClassRoundedIcon />,
      gradient: 'linear-gradient(135deg, #275d95 0%, #3a7fbe 100%)',
    },
    {
      label: 'Ocorrências no Mês',
      value: dashboard.totalOcorrenciasMes,
      icon: <WarningAmberRoundedIcon />,
      gradient: 'linear-gradient(135deg, #6c7ea1 0%, #8ea4c7 100%)',
    },
    {
      label: 'Faltas no Mês',
      value: dashboard.totalFaltasMes,
      icon: <EventBusyRoundedIcon />,
      gradient: 'linear-gradient(135deg, #0f4e80 0%, #0b6db5 100%)',
    },
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 2 }}>
      <Typography variant="h5" sx={{ mb: 1, textAlign: 'left', fontWeight: 800 }}>
        {title}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
        <Chip label="Painel Gerencial" color="primary" variant="outlined" />
        <Chip label="Atualização: mês atual" variant="outlined" />
      </Stack>

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && <LinearProgress sx={{ mb: 2, borderRadius: 2, height: 6 }} />}

      <Grid container spacing={2}>
          {summaryCards.map((card) => (
            <Grid key={card.label} size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                sx={{
                  p: 2.8,
                  minHeight: 150,
                  textAlign: 'left',
                  color: '#fff !important',
                  background: `${card.gradient} !important`,
                  border: 'none !important',
                  boxShadow: '0 10px 18px rgba(9, 66, 110, 0.18) !important',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.92)', fontWeight: 500 }}>
                    {card.label}
                  </Typography>
                  <Box sx={{ opacity: 0.95, '& svg': { fontSize: 30 } }}>{card.icon}</Box>
                </Box>
                {loading ? (
                  <Skeleton variant="text" width={90} height={56} sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.3)' }} />
                ) : (
                  <Typography variant="h3" sx={{ fontWeight: 800, mt: 2 }}>
                    {card.value}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2.2, height: '100%', textAlign: 'left' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Perfil dos Alunos
              </Typography>
              <Box sx={{ mb: 1.5 }}>
                {loading ? (
                  <Skeleton variant="text" width="70%" />
                ) : (
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Meninos: <strong>{dashboard.totalMeninos}</strong> ({boysPct}%)
                  </Typography>
                )}
                <LinearProgress variant="determinate" value={loading ? 0 : boysPct} sx={{ height: 8, borderRadius: 8 }} />
              </Box>
              <Box sx={{ mb: 1.5 }}>
                {loading ? (
                  <Skeleton variant="text" width="70%" />
                ) : (
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    Meninas: <strong>{dashboard.totalMeninas}</strong> ({girlsPct}%)
                  </Typography>
                )}
                <LinearProgress
                  variant="determinate"
                  value={loading ? 0 : girlsPct}
                  sx={{
                    height: 8,
                    borderRadius: 8,
                    '& .MuiLinearProgress-bar': { backgroundColor: '#6b8fb8' },
                  }}
                />
              </Box>
              <Divider sx={{ my: 1.5 }} />
              {loading ? (
                <Skeleton variant="text" width="65%" />
              ) : (
                <Typography>
                  Alunos com Bolsa Família: <strong>{dashboard.totalBolsaFamilia}</strong>
                </Typography>
              )}
              {(dashboard.totalMeninos === 0 && dashboard.totalMeninas === 0) && (
                <Typography variant="body2" sx={{ color: 'var(--color-text-muted)', mt: 1 }}>
                  Sem dados de sexo/gênero no endpoint de alunos.
                </Typography>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 2.2, height: '100%', textAlign: 'left' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                Ranking de Faltas - Bolsa Família (Top 5)
              </Typography>
              {!loading && dashboard.topFaltasBolsa.length ? (
                <List dense sx={{ py: 0 }}>
                  {dashboard.topFaltasBolsa.map((item, idx) => (
                    <ListItem
                      key={`${item.aluno}-${idx}`}
                      disableGutters
                      sx={{
                        px: 1,
                        borderRadius: 1.5,
                        mb: 0.5,
                        backgroundColor: idx === 0 ? 'var(--color-primary-050)' : 'transparent',
                      }}
                    >
                      <ListItemText
                        primary={`${idx + 1}. ${item.aluno}`}
                        secondary={`${item.faltas} falta(s)`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : loading ? (
                <List dense sx={{ py: 0 }}>
                  {Array.from({ length: 4 }).map((_, idx) => (
                    <ListItem key={`skeleton-${idx}`} disableGutters sx={{ mb: 0.5 }}>
                      <ListItemText
                        primary={<Skeleton variant="text" width={`${70 - idx * 8}%`} />}
                        secondary={<Skeleton variant="text" width={`${35 - idx * 3}%`} />}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" sx={{ color: 'var(--color-text-muted)' }}>
                  Sem registros de faltas para alunos com Bolsa Família no mês atual (ou campo não disponível na API).
                </Typography>
              )}
            </Paper>
          </Grid>
      </Grid>
    </Box>
  );
};

export default Home;

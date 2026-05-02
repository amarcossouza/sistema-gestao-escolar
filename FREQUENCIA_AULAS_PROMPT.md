# FORMULÁRIO DE FREQUÊNCIA DE AULAS - PROMPT COMPLETO

## ⚠️ IMPORTANTE
Quando volta do PLAN MODE, use este prompt EXATO para criar `FrequenciaAulas.tsx`

---

## OBJETIVO FINAL
Criar componente React `FrequenciaAulas.tsx` que implemente um formulário completo de controle de frequência de aulas com interação, salvamento em tempo real via API e interface visual intuitiva.

---

## PASSO 1 — FILTROS (Topo da Tela)

### Estrutura dos Filtros
```
[Período] [Turma] [Mês] [Ano]
```

### Período
- **Type:** Select
- **Options:** Manhã, Tarde, Noite
- **Default:** "Manha"
- **Localização:** Primeiro (xs={12} sm={3})

### Turma
- **Type:** Select
- **Source:** GET http://localhost:8080/turmas
- **Default:** "" (vazio - "Selecione")
- **Localização:** Segundo (xs={12} sm={3})

### Mês
- **Type:** Select
- **Options:** Janeiro, Fevereiro, Março, Abril, Maio, Junho, Julho, Agosto, Setembro, Outubro, Novembro, Dezembro
- **Default:** `currentDate.getMonth() + 1` (mês vigente)
- **Localização:** Terceiro (xs={12} sm={3})

### Ano
- **Type:** Select
- **Options:** 2025, 2026, 2027, 2028, 2029, 2030
- **Default:** `currentDate.getFullYear()` (ano vigente)
- **Localização:** Quarto (xs={12} sm={3})

### Ao selecionar Mês/Ano
- Calcular automaticamente:
  - `dataInicio = new Date(ano, mes-1, 1).toISOString().split('T')[0]` → yyyy-MM-dd
  - `dataFim = new Date(ano, mes, 0).toISOString().split('T')[0]` → yyyy-MM-dd

---

## PASSO 2 — CÁLCULO DOS DIAS

### Identificar Dias do Mês
- `getDiasDoMes(): number => new Date(ano, mes, 0).getDate()`
- Retorna: 28, 29, 30 ou 31

### Identificar Dia da Semana
- `getDiaDaSemana(dia: number): string`
- Array: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
- **IMPORTANTE:** Sábado e Domingo DEVEM aparecer (não ocultar)

---

## PASSO 3 — ESTRUTURA DA TABELA

### Colunas (ordem exata)
1. **Nº** → `idx + 1` (número sequencial do aluno, minWidth: 50)
2. **Nome** → `aluno.nome` (minWidth: 150)
3. **Faltas** → `contarFaltas(alunoId)` (minWidth: 50, textAlign: center, cor: #d32f2f)
4. **Dias 1 até Último** → Colunas compactas para cada dia (width: 30, padding: 4px 2px)

### Cabeçalho dos Dias
```
┌─────────┐
│ ☐      │  ← Checkbox (width: 12, height: 12)
│ 5      │  ← Número do dia (fontSize: 8, fontWeight: bold)
│ Qua    │  ← Dia da semana (fontSize: 7, color: #666)
└─────────┘
```

---

## PASSO 4 — BLOQUEIO (CADEADO) ✅ IMPLEMENTADO

### Estado Inicial
- **Todas as células bloqueadas**
- **Mostrar:** ícone 🔒 (LockIcon do Material-UI)
- **Aparência:** `opacity: 0.6, border: '1px solid #e0e0e0'`
- **Fundo:** `backgroundColor: '#fafafa'`

### Ao Marcar Checkbox de um Dia
1. **Desbloquear TODA a coluna** daquele dia
2. **Remover cadeado** (mostrar "C" ou "F")
3. **Preencher automaticamente com "C"** (presente)
4. **Mudar fundo:** `backgroundColor: '#e3f2fd'` (azul claro)
5. **Adicionar borda:** `border: '1px solid #2196f3'`

### Função
```typescript
const toggleDia = (dia: number) => {
  const novosDias = new Set(diasDesbloqueados);
  if (novosDias.has(dia)) {
    novosDias.delete(dia);
  } else {
    novosDias.add(dia);
    // Preencher com "C" automaticamente
    setFrequencias(prev => {
      const novo = { ...prev };
      alunos.forEach(aluno => {
        if (!novo[aluno.id]) novo[aluno.id] = {};
        if (novo[aluno.id][dia] === undefined) novo[aluno.id][dia] = 'C';
      });
      return novo;
    });
  }
  setDiasDesbloqueados(novosDias);
};
```

---

## PASSO 5 — INTERAÇÃO NAS CÉLULAS ✅ IMPLEMENTADO

### Para Células Desbloqueadas
- **Clique alterna:**
  - "C" (presente, verde)
  - "F" (falta, vermelho)
  
### Regra de Toggle
- Se valor === 'C' → mudar para 'F'
- Se valor === 'F' → mudar para 'C'

### Visual
- **Bloqueada:** `cursor: 'not-allowed', opacity: 0.6, backgroundColor: '#fafafa'`
- **Desbloqueada C:** `cursor: 'pointer', opacity: 1, backgroundColor: '#c8e6c9' (verde claro), color: '#2e7d32' (verde escuro)`
- **Desbloqueada F:** `cursor: 'pointer', opacity: 1, backgroundColor: '#ffcdd2' (vermelho claro), color: '#c62828' (vermelho escuro)`

---

## PASSO 6 — CARREGAMENTO DE DADOS ✅ IMPLEMENTADO

### useEffect 1 - Carregar Turmas
```typescript
useEffect(() => {
  fetch('http://localhost:8080/turmas')
    .then(r => r.json())
    .then(setTurmas)
    .catch(e => console.error('Erro turmas:', e));
}, []);
```

### useEffect 2 - Carregar Alunos e Frequências
**Acionado quando:** `turmaId`, `mes`, ou `ano` mudam

```typescript
useEffect(() => {
  if (!turmaId) {
    setAlunos([]);
    setFrequencias({});
    return;
  }

  (async () => {
    try {
      // 1. Buscar alunos
      const resAlunos = await fetch(`http://localhost:8080/alunos?turmaId=${turmaId}`);
      const dataAlunos = await resAlunos.json();
      setAlunos(dataAlunos);

      // 2. Inicializar frequências com todos "C"
      const freqInicial = {};
      const diasMes = getDiasDoMes();
      dataAlunos.forEach(aluno => {
        freqInicial[aluno.id] = {};
        for (let i = 1; i <= diasMes; i++) {
          freqInicial[aluno.id][i] = 'C';
        }
      });

      // 3. Buscar faltas (apenas status "F" são retornadas)
      const dataInicio = getDataInicio();
      const dataFim = getDataFim();
      const resFreq = await fetch(
        `http://localhost:8080/frequencias?turmaId=${turmaId}&dataInicio=${dataInicio}&dataFim=${dataFim}`
      );
      const dataFreq = await resFreq.json();

      // 4. Sobrescrever com faltas retornadas
      dataFreq.forEach(freq => {
        if (freqInicial[freq.alunoId]) {
          freqInicial[freq.alunoId][freq.dia] = freq.status;
        }
      });

      setFrequencias(freqInicial);
      setDiasDesbloqueados(new Set());
    } catch (error) {
      console.error('Erro:', error);
    }
  })();
}, [turmaId, mes, ano]);
```

---

## PASSO 7 — TOTAL DE FALTAS ✅ IMPLEMENTADO

### Função `contarFaltas`
```typescript
const contarFaltas = (alunoId: number): number => {
  return Object.values(frequencias[alunoId] || {}).filter(f => f === 'F').length;
};
```

### Exibição
- Coluna "Faltas"
- `fontWeight: 'bold'`
- `color: '#d32f2f'` (vermelho)
- `textAlign: 'center'`

---

## PASSO 8 — AÇÃO AO CLICAR EM C/F ⭐ CRITICAL

### INSTANTANEAMENTE (Síncrono)
1. Mudar o valor no estado: `C → F` ou `F → C`
2. Mudar a cor na tela IMEDIATAMENTE
3. **NÃO ESPERAR** resposta do servidor

### EM PARALELO (Assíncrono - sem await)
1. Construir data do dia clicado: `new Date(ano, mes-1, dia).toISOString().split('T')[0]`
2. Chamar `POST http://localhost:8080/frequencias`
3. Body exato:
```json
{
  "alunoId": <número>,
  "turmaId": <número>,
  "data": "yyyy-MM-dd",
  "status": "C" ou "F"
}
```

### Função
```typescript
const toggleFrequencia = (alunoId: number, dia: number) => {
  if (!diasDesbloqueados.has(dia)) return;

  // PASSO 1: Mudar instantaneamente no estado
  const novoStatus = frequencias[alunoId][dia] === 'C' ? 'F' : 'C';
  setFrequencias(prev => ({
    ...prev,
    [alunoId]: {
      ...prev[alunoId],
      [dia]: novoStatus
    }
  }));

  // PASSO 2: Chamar endpoint em paralelo (sem await, sem então)
  const dataClicada = new Date(ano, mes - 1, dia).toISOString().split('T')[0];
  const payload = {
    alunoId: alunoId,
    turmaId: turmaId,
    data: dataClicada,
    status: novoStatus
  };

  fetch('http://localhost:8080/frequencias', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  }).catch(e => console.error('Erro salvar:', e));
};
```

---

## PASSO 9 — UX/VISUAL ✅ IMPLEMENTADO

### Cores
- **"C" (Presente):** `backgroundColor: '#c8e6c9', color: '#2e7d32'`
- **"F" (Falta):** `backgroundColor: '#ffcdd2', color: '#c62828'`

### Cadeado
- **Bloqueado:** `<LockIcon sx={{ fontSize: 10 }} />`
- **Desbloqueado:** Mostrar "C" ou "F"

### Tamanhos
- **Dias (width):** 30px
- **Padding:** 4px 2px
- **Font:** 8px para números, 7px para dias da semana, 10px para C/F
- **Checkbox:** width: 12, height: 12

### Container
- `width: '100%'`
- `padding: '20px'`
- `overflowX: 'auto'` na TableContainer (permite scroll se necessário)

---

## PASSO 10 — TECNOLOGIA ✅ IMPLEMENTADO

- **Framework:** Rea

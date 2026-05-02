# FLUXO COMPLETO: Seleção de Turma no Frontend

## 📋 Resumo Rápido
Quando você **seleciona uma turma**, o frontend faz **exatamente 1 chamada HTTP** para o backend.

---

## 🔄 FLUXO DETALHADO

### PASSO 1: CARREGAMENTO INICIAL DO COMPONENTE
**Local:** `useEffect()` linha 108-127
**Disparado:** Uma vez ao montar o componente

```
1️⃣ ENDPOINT ACIONADO: GET /turmas
   - Traz TODAS as turmas de TODOS os períodos
   - Armazenado em: todasTurmas (estado)
   
Exemplo de resposta:
[
  { id: 1, nome: "5X", periodo: "Manha", anoLetivo: 2026 },
  { id: 2, nome: "5Y", periodo: "Manha", anoLetivo: 2026 },
  { id: 3, nome: "6A", periodo: "Tarde", anoLetivo: 2026 },
  ...
]
```

---

### PASSO 2: VOCÊ SELECIONA UM PERÍODO (Ex: "Manhã")
**Local:** Dropdown "Período"
**Ação:** `onChange={e => setSelectedPeriodo(e.target.value)}`

```
2️⃣ NENHUM ENDPOINT ACIONADO!
   - Apenas filtra as turmas em MEMÓRIA
   - todasTurmas.filter(t => t.periodo === "Manha")
   - Resultado armazenado em: turmasFiltradas
   
useEffect dispara (linha 130-148) porque selectedPeriodo mudou
→ PROCESSAMENTO LOCAL (sem backend)
```

---

### PASSO 3: VOCÊ SELECIONA UMA TURMA (Ex: "5X")
**Local:** Dropdown "Turma"
**Ação:** `onChange={e => setSelectedTurma(e.target.value)}`

```
3️⃣ ENDPOINT ACIONADO: GET /turmas/{id}/dados-completos?mes=5&ano=2026
   
   Parâmetros:
   - turmaId: 1 (ID da turma 5X)
   - mes: 5 (maio)
   - ano: 2026 (ano selecionado)
   
   Resposta contém:
   {
     "alunos": [...],           // Lista de alunos da turma
     "frequencias": [...],      // Frequências do período (maio/2026)
     "ocorrenciasCount": {...}, // Contagem de ocorrências por aluno
     "chamadasConfirmadas": [...] // Dias já abertos da turma
   }

useEffect dispara (linha 151-252) porque selectedTurma mudou
→ Carrega dados do backend
→ Processa tudo em MEMÓRIA
→ Atualiza estado (alunos, frequenciaGrid, unlockedDays)
→ Renderiza a tabela
```

---

## 📊 RESUMO DE ENDPOINTS

| Evento | Endpoint | Vezes | Quando |
|--------|----------|-------|--------|
| Montar componente | `GET /turmas` | 1x | Uma única vez |
| Selecionar período | - | 0x | Nenhum endpoint (filtro local) |
| Selecionar turma | `GET /turmas/{id}/dados-completos` | 1x | A cada turma selecionada |
| Mudar mês/ano | `GET /turmas/{id}/dados-completos` | 1x | A cada mudança de mês/ano |
| Marcar dia como aberto | `POST /chamada-confirmada` | 1x | Por dia marcado |
| Alterar frequência (C/F) | `POST /frequencias` | 1x | Por célula alterada |

---

## 🎯 FLUXO VISUAL

```
┌─────────────────────────────────────────────────────────┐
│ COMPONENTE MONTA                                        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
         ┌───────────────────┐
         │ GET /turmas       │ ◄─── ENDPOINT 1
         │ (1x no início)    │
         └────────┬──────────┘
                  │
                  ▼ (Armazena em todasTurmas)
    
    ┌──────────────────────────────────┐
    │ VOCÊ SELECIONA PERÍODO "Manhã"   │
    └────────┬─────────────────────────┘
             │
             ▼ (Filtra todasTurmas em MEMÓRIA)
             ├─ Turma 5X ✓
             ├─ Turma 5Y ✓
             └─ (Turma 6A não aparece)
             
             ❌ NENHUM ENDPOINT
    
    ┌──────────────────────────────────┐
    │ VOCÊ SELECIONA TURMA "5X"        │
    └────────┬─────────────────────────┘
             │
             ▼
    ┌─────────────────────────────────────────────┐
    │ GET /turmas/1/dados-completos?mes=5&ano=... │ ◄─── ENDPOINT 2
    │ (A CADA TURMA/MÊS/ANO SELECIONADOS)         │
    └────────┬────────────────────────────────────┘
             │
             ▼ (Resposta JSON com tudo)
    
    ┌─────────────────────────────────┐
    │ PROCESSAR DADOS EM MEMÓRIA      │
    │ - Montar grid de frequências    │
    │ - Preencher com dados salvos    │
    │ - Marcar dias desbloqueados     │
    │ ❌ NENHUM ENDPOINT AQUI         │
    └────────┬────────────────────────┘
             │
             ▼ (Atualizar estado de uma vez)
    
    ┌─────────────────────────────────┐
    │ RENDERIZAR TABELA               │
    │ ✓ Alunos aparecem               │
    │ ✓ Frequências preenchidas       │
    │ ✓ Dias desbloqueados marcados   │
    └─────────────────────────────────┘
```

---

## 🔧 PERFORMANCE BREAKDOWN

**Quando você seleciona uma turma:**

1. **Requisição para backend:** ~300ms (rede)
2. **Processamento em memória:** ~50ms (montar grid, preencher dados)
3. **Atualizar estado React:** ~10ms
4. **Render da tabela:** ~200ms (desenhar HTML)

**TOTAL:** ~560ms

### O que NÃO acontece mais (otimizações aplicadas):
- ❌ Múltiplos renderizadores cascata
- ❌ Requisições repetidas para o mesmo endpoint
- ❌ Processamento do grid em etapas separadas

---

## 📌 IMPORTANTE

**NÃO há chamadas recursivas ou loops infinitos:**
- Cada `useEffect` depende de dependências específicas: `[selectedTurma, selectedMes, selectedAno]`
- Só acionam quando ESSAS variáveis mudam
- Não criam novos estados que disparam novos effects

---

## ✅ CHECKLIST DO FLUXO

- [x] Componente monta → GET /turmas (1x)
- [x] Seleciona período → Filtra em memória (0x endpoint)
- [x] Seleciona turma → GET /turmas/{id}/dados-completos (1x)
- [x] Dados retornam → Processa em memória (0x endpoint)
- [x] Estado atualiza → Renderiza tabela (0x endpoint)
- [x] Usuário altera frequência → POST /frequencias (1x por célula)
- [x] Usuário marca dia → POST /chamada-confirmada (1x por dia)

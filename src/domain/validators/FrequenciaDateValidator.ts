/**
 * DOMAIN LAYER - Validadores de Data para Frequência
 * 
 * Responsabilidade: Encapsular regras de negócio relacionadas a datas permitidas
 * para marcar frequência (sábados/domingos e dias futuros)
 * 
 * Padrão SOLID:
 * - S (Single Responsibility): Cada função valida um aspecto específico
 * - O (Open/Closed): Fácil adicionar novas validações sem modificar existentes
 * - L (Liskov Substitution): Todas retornam boolean
 * - I (Interface Segregation): Funções pequenas e focadas
 * - D (Dependency Inversion): Não depende de implementações concretas
 */

/**
 * Valida se um dia é fim de semana (sábado ou domingo)
 * 
 * @param dia - Dia do mês (1-31)
 * @param ano - Ano (ex: 2026)
 * @param mes - Mês (1-12)
 * @returns true se é sábado ou domingo, false caso contrário
 */
export const isWeekend = (dia: number, ano: number, mes: number): boolean => {
  const date = new Date(ano, mes - 1, dia);
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // 0 = domingo, 6 = sábado
};

/**
 * Valida se um dia é futuro (maior que hoje)
 * 
 * @param dia - Dia do mês (1-31)
 * @param ano - Ano (ex: 2026)
 * @param mes - Mês (1-12)
 * @returns true se a data é no futuro, false caso contrário
 */
export const isFutureDate = (dia: number, ano: number, mes: number): boolean => {
  const date = new Date(ano, mes - 1, dia);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to midnight
  return date > today;
};

/**
 * Valida se um dia é passado (menor que hoje)
 * 
 * @param dia - Dia do mês (1-31)
 * @param ano - Ano (ex: 2026)
 * @param mes - Mês (1-12)
 * @returns true se a data é no passado, false caso contrário
 */
export const isPastDate = (dia: number, ano: number, mes: number): boolean => {
  const date = new Date(ano, mes - 1, dia);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

/**
 * Valida se um dia é hoje
 * 
 * @param dia - Dia do mês (1-31)
 * @param ano - Ano (ex: 2026)
 * @param mes - Mês (1-12)
 * @returns true se a data é hoje, false caso contrário
 */
export const isToday = (dia: number, ano: number, mes: number): boolean => {
  const date = new Date(ano, mes - 1, dia);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date.getTime() === today.getTime();
};

/**
 * Regra de Negócio Principal: Verifica se um dia pode ter seu checkbox marcado
 * Um dia pode ser marcado se:
 * - NÃO é um fim de semana (sábado ou domingo)
 * - NÃO é uma data futura (deve ser hoje ou no passado)
 * 
 * @param dia - Dia do mês (1-31)
 * @param ano - Ano (ex: 2026)
 * @param mes - Mês (1-12)
 * @returns true se o dia pode ser marcado, false caso contrário
 */
export const canMarkDay = (dia: number, ano: number, mes: number): boolean => {
  return !isWeekend(dia, ano, mes) && !isFutureDate(dia, ano, mes);
};

/**
 * Obtém a razão pela qual um dia não pode ser marcado
 * Usado para exibir mensagens descritivas ao usuário
 * 
 * @param dia - Dia do mês (1-31)
 * @param ano - Ano (ex: 2026)
 * @param mes - Mês (1-12)
 * @returns String descrevendo por que o dia não pode ser marcado, ou string vazia se pode
 */
export const getDisabledReason = (dia: number, ano: number, mes: number): string => {
  if (isFutureDate(dia, ano, mes)) {
    return 'Dia futuro - não pode marcar';
  }
  if (isWeekend(dia, ano, mes)) {
    return 'Fim de semana - não pode marcar';
  }
  return '';
};

/**
 * Obtém o tipo de desabilitação (para estilizar diferente)
 * 
 * @param dia - Dia do mês (1-31)
 * @param ano - Ano (ex: 2026)
 * @param mes - Mês (1-12)
 * @returns Tipo: 'future' | 'weekend' | '' (habilitado)
 */
export const getDisabledType = (
  dia: number,
  ano: number,
  mes: number
): 'future' | 'weekend' | '' => {
  if (isFutureDate(dia, ano, mes)) {
    return 'future';
  }
  if (isWeekend(dia, ano, mes)) {
    return 'weekend';
  }
  return '';
};

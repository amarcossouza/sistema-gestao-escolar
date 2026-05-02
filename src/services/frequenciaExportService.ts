/**
 * Serviço para exportar relatórios de frequência
 */

export interface FrequenciaExportRequest {
  turmaId: number;
  mes: number;
  ano: number;
}

/**
 * Gera e faz download de um relatório PDF de frequência
 * 
 * @param request Contém turmaId, mes e ano
 * @returns Promise<Blob> com o arquivo PDF
 */
export async function exportarFrequenciaPdf(
  request: FrequenciaExportRequest
): Promise<Blob> {
  try {
    const response = await fetch('http://localhost:8083/relatorios/frequencia/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Erro ao gerar relatório: ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Erro ao exportar frequência:', error);
    throw error;
  }
}

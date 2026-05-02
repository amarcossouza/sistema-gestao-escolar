/**
 * Utilitários para download de arquivos
 */

/**
 * Faz download de um blob (arquivo) do navegador
 * 
 * @param blob O arquivo como Blob
 * @param filename Nome do arquivo para download
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Faz download de um PDF específico
 * 
 * @param pdfBlob O arquivo PDF como Blob
 * @param filename Nome do arquivo para download
 */
export function downloadPdf(pdfBlob: Blob, filename: string): void {
  downloadBlob(pdfBlob, filename);
}

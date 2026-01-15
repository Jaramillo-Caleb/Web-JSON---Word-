
/**
 * Generador de Word con estilo de examen de bajo consumo de tinta.
 */
export const downloadAsWord = (title: string, sections: { heading: string, body: string }[], isAnswerKey: boolean = false) => {
  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${title}</title>
    <style>
      body { font-family: 'Arial', sans-serif; line-height: 1.5; color: #000; font-size: 10pt; }
      h1 { text-align: center; font-size: 16pt; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 5pt; margin-bottom: 20pt; }
      h2 { font-size: 12pt; margin-top: 20pt; font-weight: bold; border-bottom: 0.5px solid #ccc; padding-bottom: 2pt; }
      .header-fields { margin-bottom: 25pt; font-size: 9pt; }
      .question-text { font-size: 10pt; font-weight: normal; margin-top: 15pt; margin-bottom: 5pt; }
      .option { font-size: 10pt; margin-left: 25pt; margin-bottom: 5pt; display: block; }
      .option-letter { font-weight: bold; margin-right: 5pt; }
      .spacer { height: 15pt; }
      .ref-text { text-align: center; font-size: 9pt; color: #666; margin-top: -15pt; margin-bottom: 20pt; }
    </style>
    </head><body>
  `;
  
  const footer = `</body></html>`;

  let content = `<h1>${title}</h1>`;
  
  if (!isAnswerKey) {
    content += `
      <div class="header-fields">
        <p>Estudiante: __________________________________________________</p>
        <p>Grado: ____________________________ &nbsp;&nbsp;&nbsp; Fecha: ___/___/___</p>
      </div>
    `;
  } else {
    content += `<p class="ref-text">Documento de Referencia para el Examen correspondiente</p>`;
  }

  sections.forEach(s => {
    content += `<h2>${s.heading}</h2>`;
    
    const lines = s.body.split('\n');
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        content += `<div class="spacer"></div>`;
        return;
      }

      // Detectar si es una opción (ej: A. Opción)
      const optionMatch = trimmedLine.match(/^([A-Z])[\.\)]\s*(.*)/);

      if (optionMatch) {
        const letter = optionMatch[1];
        const text = optionMatch[2];
        content += `<div class='option'><span class='option-letter'>${letter})</span> ${text}</div>`;
      } else {
        content += `<p class='question-text' style="${isAnswerKey ? 'font-style: italic; color: #333;' : ''}">${trimmedLine}</p>`;
      }
    });
  });

  const source = header + content + footer;
  const blob = new Blob(['\ufeff', source], {
    type: 'application/msword'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.replace(/\s+/g, '_')}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

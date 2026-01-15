
import { GoogleGenAI, Type } from "@google/genai";

export class AIService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async analyzeJson(jsonString: string) {
    const prompt = `
      Actúa como un experto en diseño de exámenes académicos y formularios impresos.
      Analiza el siguiente JSON y conviértelo en un examen profesional de bajo consumo de tinta.
      
      REGLAS DE FORMATO ESTRICTAS PARA EL CUESTIONARIO:
      1. Cada pregunta debe ir numerada.
      2. FORMATO DE OPCIONES: Usa letras mayúsculas seguidas de un punto y un espacio.
         Ejemplo:
         1. ¿Cuál es el paradigma arquitectónico principal?
         A. Arquitectura Nativa de la Nube
         B. Computación en el Borde
         C. Arquitectura Monolítica
         D. Arquitectura Sin Servidor

      3. ESPACIADO OBLIGATORIO: Debe haber una línea en blanco completa entre el final de las opciones de una pregunta y el inicio de la siguiente pregunta.
      
      REGLAS PARA LA HOJA DE RESPUESTAS:
      1. Genera una sección llamada "HOJA DE RESPUESTAS".
      2. Para cada pregunta, indica el número y la respuesta correcta.
      3. CRÍTICO: NO uses corchetes "[]" ni casillas en la hoja de respuestas. 
         Ejemplo correcto: "1. Computación en el Borde (Edge Computing)".
      
      JSON DATA:
      ${jsonString}
    `;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedTitle: { type: Type.STRING },
            sections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  heading: { type: Type.STRING },
                  body: { type: Type.STRING, description: "Contenido con preguntas y opciones (A. B. C. D.) separadas por saltos de línea." }
                },
                required: ["heading", "body"]
              }
            }
          },
          required: ["suggestedTitle", "sections"]
        }
      }
    });

    try {
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Error parsing AI response", e);
      return null;
    }
  }
}

export const aiService = new AIService();

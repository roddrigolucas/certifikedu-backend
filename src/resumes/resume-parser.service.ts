import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
const pdfParse = require('pdf-parse');

@Injectable()
export class ResumeParserService {
  private ai: GoogleGenerativeAI;

  constructor(private readonly config: ConfigService) {
    this.ai = new GoogleGenerativeAI(this.config.getOrThrow('GEMINI_API_KEY'));
  }

  async parsePdf(fileBuffer: Buffer) {
    try {
      const pdfData = await pdfParse(fileBuffer);
      const text = pdfData.text;

      if (!text || text.trim().length === 0) {
        throw new Error('Nenhum texto encontrado no arquivo PDF.');
      }

      const prompt = `
Você é um assistente especialista em RH e recrutamento. 
Vou te passar o texto extraído de um currículo. Seu trabalho é extrair as informações e retorná-las EXATAMENTE em formato JSON estruturado, sem markdown e sem textos adicionais.

O JSON deve seguir esta interface TypeScript:
{
  "title": "string (Cargo atual ou principal. Ex: Desenvolvedor Frontend)",
  "description": "string (Resumo profissional sobre o candidato)",
  "experiences": [
    {
      "title": "string (Cargo)",
      "description": "string (O que a pessoa fazia)",
      "startYear": "number",
      "startMonth": "number (1-12)",
      "endYear": "number | null (se for trabalho atual, null)",
      "endMonth": "number | null",
      "employmentType": "FULL_TIME | PART_TIME | FREELANCE | INTERNSHIP | CONTRACT | TRAINEE",
      "workModel": "REMOTE | ONSITE | HYBRID",
      "companyName": "string",
      "companyLocation": "string | null"
    }
  ],
  "educations": [
    {
      "title": "string (Nome do curso/graduação)",
      "description": "string (Detalhes do curso)",
      "startYear": "number",
      "startMonth": "number (1-12)",
      "endYear": "number | null",
      "endMonth": "number | null",
      "institutionName": "string",
      "institutionLocation": "string | null"
    }
  ],
  "languages": [
    {
      "language": "string (Ex: Inglês, Espanhol)",
      "level": "BASIC | INTERMEDIATE | ADVANCED | FLUENT | NATIVE"
    }
  ]
}

Regras:
1. Retorne APENAS o JSON válido.
2. Infira o employmentType e workModel o melhor possível; se não for possível inferir, use FULL_TIME e ONSITE como padrão.
3. Se não houver endYear/endMonth, é porque é o trabalho atual (retorne null).
4. Limpe o texto para que não quebre o JSON.

Currículo:
"""
${text.substring(0, 30000)}
"""
`;

      const model = this.ai.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });

      const response = await model.generateContent(prompt);
      const resultText = response.response.text();
      
      // Limpar blocos de markdown e espaços em branco ao redor
      let cleanText = resultText.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.substring(7);
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.substring(3);
      }
      if (cleanText.endsWith('```')) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
      }
      cleanText = cleanText.trim();

      const parsedJson = JSON.parse(cleanText);

      return parsedJson;

    } catch (error) {
      console.error('Error parsing resume PDF with Gemini:', error);
      throw new InternalServerErrorException('Erro ao processar o currículo com Inteligência Artificial.');
    }
  }
}

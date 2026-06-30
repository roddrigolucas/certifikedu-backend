import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { IPdiStepInfo } from './interfaces/pdi.interface';

@Injectable()
export class PdiAiService {
  private readonly logger = new Logger(PdiAiService.name);
  private ai: GoogleGenAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      this.logger.warn('GEMINI_API_KEY ensures the AI functions properly. Missing key!');
    }
  }

  async generatePdiNodes(
    title: string,
    goals: string,
    skills: string,
    previousEducation: string,
    dailyTime: string,
    userCertificates: any[],
  ): Promise<IPdiStepInfo[]> {
    if (!this.ai) {
      const apiKey = this.configService.get<string>('GEMINI_API_KEY');
      if (!apiKey) throw new InternalServerErrorException('GEMINI_API_KEY is not configured');
      this.ai = new GoogleGenAI({ apiKey });
    }

    // Extrair histórico do usuário para o prompt
    const certificatesText = userCertificates && userCertificates.length > 0
      ? userCertificates.map(c => `- ${c.name} (${c.habilidades?.map(h => h.habilidade.habilidade).join(', ')})`).join('\n')
      : 'Nenhum certificado prévio.';

    const prompt = `Você é um especialista em carreira e desenvolvimento pessoal.
Sua tarefa é gerar um Plano de Desenvolvimento Individual (PDI) extremamente prático e estruturado para o usuário.

**Informações do Usuário**:
- Objetivo Principal (O que deseja alcançar): ${goals}
- Tópicos de Interesse/Habilidades a desenvolver: ${skills}
- Nível de Experiência/Educação Prévia: ${previousEducation}
- Tempo Diário Dedicado: ${dailyTime}
- Título/Foco do PDI: ${title}

**Histórico de Certificados e Habilidades já adquiridas pelo usuário**:
${certificatesText}

Com base nestas informações, crie um plano passo-a-passo (roadmap) realista contendo entre 3 a 5 etapas lógicas para que o usuário atinja seus objetivos. Para cada etapa, inclua exatamente a seguinte estrutura e preencha OBRIGATORIAMENTE em Português do Brasil:

\`\`\`json
[
  {
    "description": {
      "stepObjective": "Objetivo curto e claro desta etapa (ex: Dominar sintaxe do Python)",
      "completeDescriptionOfWhatToDo": "Uma descrição detalhada e acionável do que o usuário deve fazer na prática nesta etapa semanalmente, considerando o tempo diário de ${dailyTime}."
    },
    "abilities": [
      { "habilidade": "Nome de Habilidade 1" },
      { "habilidade": "Nome de Habilidade 2" }
    ],
    "books": {
      "title": "Título de um Livro Recomendado",
      "authorName": "Nome do Autor",
      "description": "Por que de ler este livro e como ele ajuda nesta etapa"
    }
  }
]
\`\`\`

A saída deve ser SOMENTE um JSON Array válido, rigorosamente neste formato, sem explicações extras e sem formatação markdown envolvendo o JSON.`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        }
      });

      const textResponse = response.text || '[]';
      const steps: IPdiStepInfo[] = JSON.parse(textResponse);
      return steps;
    } catch (error) {
      this.logger.error('Failed to generate PDI from Gemini AI', error);
      throw new InternalServerErrorException('Falha ao gerar o PDI com Inteligência Artificial. Verifique as credenciais ou tente novamente.');
    }
  }
}

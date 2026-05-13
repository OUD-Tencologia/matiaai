export type LlmProvider = 'openai' | 'anthropic' | 'gemini';
export type LlmIaType = 'gpt' | 'claude' | 'gemini';

export interface LlmConfigModel {
  id: string; 
  provider: LlmProvider;
  ia: LlmIaType;
  ia_model: string;
  api_key: string;
  nome: string;
  ativo: boolean;
  padrao: boolean;
  max_tokens: number;
  temperatura: number;
  limite_custo: number;
  created_at?: string;
  updated_at?: string;

  // Propriedades visuais montadas pelo Frontend
  logoClass?: string;
  logoText?: string;
  custoPorToken?: string;
  usoMes?: string;
  custoAcumulado?: string;
}
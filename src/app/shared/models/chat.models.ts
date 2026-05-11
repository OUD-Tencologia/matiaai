
// A fonte da lei que a IA encontrou
export interface ChatSource {
  titulo: string;
  numero_norma: string;
  artigo?: string | null;
  url_oficial: string;
  trecho: string;
  ano_norma?: number;
}

// A resposta crua que vem do seu Backend Node
export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
  interaction_id: string;
}

// O modelo que vai alimentar o HTML do seu chat
export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  createdAt?: Date;
}
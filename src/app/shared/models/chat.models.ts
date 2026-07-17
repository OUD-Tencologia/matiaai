// 1. A fonte da lei (RAG ou MCP)
export interface ChatSource {
  titulo: string;
  numero_norma: string;
  artigo?: string | null;
  url_oficial: string;
  trecho: string;
  ano_norma?: number;
  source_type?: 'rag' | 'mcp'; // Adicionado para sabermos se veio do banco ou do agente externo
  score?: number | null;
}

// 2. A resposta completa do Backend (DTO)
export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
  interaction_id: string;
  conversation_id: string; //Para manter o histórico no Angular
  confidence?: number;
  risk_level?: string;
  usage?: any;
  pdf_url?: string | null;
}

// 3. O que o Angular exibe na tela (Bolhas de Chat)
export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  createdAt?: Date;
  interaction_id?: string;
  pdf_url?: string | null;
}

// 4. O que o Angular envia para o Backend
export interface AskQuestionDTO {
  question: string;
  conversation_id?: string; // Se for nulo, o backend cria uma conversa nova
  response_style?: 'objetiva' | 'equilibrada' | 'detalhada';
}
// 1. Conversa resumida (listagem)
export interface Conversation {
  id: string;
  user_id: string;
  company_id: string | null;
  title: string;
  is_favorite: boolean;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

// 2. Mensagem salva no banco
export interface ConversationMessage {
  id: string;
  conversations_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: any | null;
  created_at: string;
}

// 3. Wrapper padrão do successResponse do backend
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// 4. Dados paginados de conversas
export interface ConversationListData {
  data: Conversation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 5. Dados paginados de mensagens
export interface ConversationMessagesData {
  conversation: Conversation;
  messages: ConversationMessage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 6. Tipos completos de resposta
export type ConversationListResponse = ApiResponse<ConversationListData>;
export type ConversationMessagesResponse = ApiResponse<ConversationMessagesData>;
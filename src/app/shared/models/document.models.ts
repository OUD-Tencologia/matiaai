// 1. Resposta do upload de documento
export interface UploadDocumentResponse {
  document_id: string;       // ID interno do banco
  rag_document_id: string;   // UUID do RAG
  filename: string;
  status: string;
  chunks_created: number;
  conversation_id: string;   // Conversa vinculada (nova ou existente)
  usage: {
    embedding: {
      total_tokens: number;
    };
  };
  cost: {
    total: {
      brl: number;
      usd: number;
    };
  };
}

// 2. Fonte de um trecho do documento
export interface DocumentSource {
  document_id: string;
  chunk_id?: string;
  filename: string;
  page_start?: number;
  page_end?: number;
  trecho: string;
  score: number;
}

// 3. Resposta do ask sobre documento
export interface AskDocumentResponse {
  answer: string;
  conversation_id: string;
  sources: DocumentSource[];
  confidence: number;
  validation_status: string;
  risk_level: string;
  usage: {
    llm: {
      total_tokens: number;
      input_tokens: number;
      output_tokens: number;
    };
    embedding: {
      total_tokens: number;
    };
  };
  cost: {
    total: {
      brl: number;
      usd: number;
    };
    exchange_rate: {
      usd_brl: number;
    };
  };
}

// 4. DTO enviado para o ask de documento
export interface AskDocumentDTO {
  question: string;
  conversation_id: string;
  response_style?: 'objetiva' | 'equilibrada' | 'detalhada' | 'didatica';
}

// 5. Documento exibido na tela (anexo na conversa)
export interface DocumentAttachment {
  document_id: string;
  rag_document_id: string;
  filename: string;
  status: 'enviando' | 'processando' | 'completo' | 'erro';
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ChatResponse, AskQuestionDTO } from '../../shared/models/chat.models';

@Injectable({
  providedIn: 'root',
})
export class ChatService {

  // URL base por variável de ambiente
  private readonly BASE_URL = `${environment.apiUrl}/api`;

  // Injectamos o HttpClient
  private http = inject(HttpClient);

  /**
   * Envia uma pergunta para o Matia Legal AI (RAG Jurídico)
   * @param question Texto da pergunta
   * @param conversationId Opcional: ID da conversa atual para manter o contexto
   * @param style Opcional: Estilo da resposta
   */
  ask(
    question: string,
    conversationId?: string,
    style: 'objetiva' | 'equilibrada' | 'detalhada' = 'equilibrada'
  ): Observable<ChatResponse> {

    // Montamos o payload seguindo o nosso DTO do Backend
    const payload: AskQuestionDTO = {
      question: question,
      conversation_id: conversationId,
      response_style: style
    };

    return this.http.post<ChatResponse>(`${this.BASE_URL}/matia/ask`, payload);
  }

  /**
   * Envia um áudio para processamento (Gemini Multimodal)
   */
  sendAudio(formData: FormData): Observable<any> {
    return this.http.post(`${this.BASE_URL}/chat/audio`, formData);
  }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import {
  UploadDocumentResponse,
  AskDocumentResponse,
  AskDocumentDTO,
} from '../../shared/models/document.models';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {

  private readonly BASE_URL = `${environment.apiUrl}/api`;
  private http = inject(HttpClient);

  /**
   * Faz upload de um documento para o RAG
   * O arquivo é enviado como multipart/form-data
   * @param file Arquivo selecionado pelo usuário
   * @param conversationId Opcional: vincula a uma conversa existente
   */
  upload(file: File, conversationId?: string): Observable<UploadDocumentResponse> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    // conversation_id vai na querystring
    let url = `${this.BASE_URL}/documents/upload`;
    if (conversationId) {
      url += `?conversation_id=${conversationId}`;
    }

    return this.http.post<UploadDocumentResponse>(url, formData);
  }

  /**
   * Faz uma pergunta sobre os documentos de uma conversa
   * @param question Pergunta do usuário
   * @param conversationId UUID da conversa com documentos
   * @param style Estilo de resposta da IA
   */
  ask(
    question: string,
    conversationId: string,
    style: 'objetiva' | 'equilibrada' | 'detalhada' | 'didatica' = 'equilibrada'
  ): Observable<AskDocumentResponse> {
    const payload: AskDocumentDTO = {
      question,
      conversation_id: conversationId,
      response_style: style,
    };

    return this.http.post<AskDocumentResponse>(`${this.BASE_URL}/documents/ask`, payload);
  }
}
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ChatResponse } from '../../shared/models/chat.models';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
 
  // 1. Apontamos a URL apenas para a raiz da sua API
  private readonly BASE_URL = `${environment.apiUrl}/api`;
  private http = inject(HttpClient);

  
   //Rota tradicional de texto (integração RAG/Python)
  ask(question: string): Observable<ChatResponse> {
    const payload = {
      question: question
    };
    // 2. Completamos o caminho aqui
    return this.http.post<ChatResponse>(`${this.BASE_URL}/matia/ask`, payload);
  }
  
  
  // Nova rota de áudio (Gemini Node)
  sendAudio(formData: FormData): Observable<any> {
    // 3. Completamos o caminho para a rota de áudio que criamos hoje no Fastify
    return this.http.post(`${this.BASE_URL}/chat/audio`, formData);
  }
  
}
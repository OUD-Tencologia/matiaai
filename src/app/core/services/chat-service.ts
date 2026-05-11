import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { ChatResponse } from '../../shared/models/chat.models';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
 
  private readonly API_URL = `${environment.apiUrl}/api/matia/ask`;
  private http = inject(HttpClient);

  ask(question: string): Observable<ChatResponse> {
    // O payload inicial mais simples que o Node já aceita
    const payload = {
      question: question
    };

    return this.http.post<ChatResponse>(this.API_URL, payload);
  }
  
}

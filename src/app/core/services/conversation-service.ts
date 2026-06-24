import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import {
  ConversationListResponse,
  ConversationMessagesResponse,
} from '../../shared/models/conversation.models';

@Injectable({
  providedIn: 'root',
})
export class ConversationService {

  private readonly BASE_URL = `${environment.apiUrl}/api`;
  private http = inject(HttpClient);

  listMyConversations(page: number = 1, limit: number = 20): Observable<ConversationListResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ConversationListResponse>(`${this.BASE_URL}/conversations/me`, { params });
  }

  getMessages(conversationId: string, page: number = 1, limit: number = 50): Observable<ConversationMessagesResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<ConversationMessagesResponse>(
      `${this.BASE_URL}/conversations/${conversationId}/messages`,
      { params }
    );
  }
}
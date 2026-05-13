import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LlmConfigModel } from '../../shared/models/LlmConfig.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LlmConfigService {

  // private apiUrl = 'http://localhost:3002/api/llm-config';
  private apiUrl = `${environment.apiUrl}/api/llm-config`;
 
  //Injecção de dependência
  private http = inject(HttpClient);

  listarModelos(): Observable<{ success: boolean, data: LlmConfigModel[] }> {
    return this.http.get<{ success: boolean, data: LlmConfigModel[] }>(this.apiUrl);
  }

  criarModelo(payload: Partial<LlmConfigModel>): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  atualizarModelo(id: string, payload: Partial<LlmConfigModel>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, payload);
  }

  excluirModelo(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
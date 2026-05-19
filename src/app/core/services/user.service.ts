import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { 
  UserProfile,
  UserProfileUpdate, 
  PasswordChangeRequest, 
  ActivityHistory 
} from '../../shared/models/user.models';
import { ApiResponse } from '../../shared/models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  // Base URL do backend
  private readonly API_URL = `${environment.apiUrl}/api/profile`;

  
  //Busca os dados completos do usuário logado
 getProfile(): Observable<UserProfile> {
  return this.http.get<UserProfile>(`${this.API_URL}/me`);
}

  
  //Atualiza informações de contato e nome
  updateProfile(data: UserProfileUpdate): Observable<ApiResponse> {
    // Isso vai gerar: http://localhost:3002/api/profile/me
    return this.http.put<ApiResponse>(`${this.API_URL}/me`, data);
}

  
  //Troca a senha do usuário
  changePassword(data: PasswordChangeRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.API_URL}/password`, data);
  }

  
  // Atualiza as regras de acesso (RBAC) do usuário no banco
  updatePermissions(permissoes: any): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.API_URL}/permissions`, { permissoes });
  }

  
  //Busca as últimas ações para a timeline do perfil
  getActivityHistory(): Observable<ActivityHistory[]> {
    return this.http.get<ActivityHistory[]>(`${this.API_URL}/activities`);
  }
}
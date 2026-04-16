import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { ProfileData, CreateProfilePayload} from '../../shared/models/profile.model';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {

  // Injetamos o HttpClient
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/api/profile`;
  
  // Busca todos os perfis da empresa atual (o backend filtra pelo token)
  getProfiles(): Observable<ProfileData[]> {
    return this.http.get<ProfileData[]>(this.API);
  }

  // Cria um novo perfil
  createProfile(data: CreateProfilePayload): Observable<ProfileData> {
    return this.http.post<ProfileData>(this.API, data);
  }

  // Atualiza um perfil existente
  updateProfile(id: string, data: Partial<CreateProfilePayload>): Observable<ProfileData> {
    return this.http.put<ProfileData>(`${this.API}/${id}`, data);
  }

  // Exclui um perfil
  deleteProfile(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}

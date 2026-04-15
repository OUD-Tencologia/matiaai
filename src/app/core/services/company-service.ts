import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
// Import de modelos
import { RegisterCompanyRequest, RegisterCompanyResponse, CompanyData } from '../../shared/models/company.models';



@Injectable({
  providedIn: 'root',
})
export class CompanyService {
// Injetando o HttpClient
  private http = inject(HttpClient);

  // URL da API
  private readonly API = `${environment.apiUrl}/api/companies`;

  registerCompany(payload: RegisterCompanyRequest): Observable<RegisterCompanyResponse> {
    return this.http.post<RegisterCompanyResponse>(this.API, payload);
  }

  getCompanies(): Observable<CompanyData[]> {
    return this.http.get<CompanyData[]>(this.API);
  }
 
  updateCompany(id: string, payload: Partial<CompanyData>): Observable<CompanyData> {
    return this.http.put<CompanyData>(`${this.API}/${id}`, payload);
  }

  deleteCompany(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
  
}

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { MessageService } from 'primeng/api';
import { environment } from '../../../environments/environment';
import { 
  LoginRequest, 
  LoginResponse,
  ChangePasswordRequest, 
  AuthResponse, 
  Setup2FAResponse,
   ApiResponse,
   ResetPasswordRequest } from '../../shared/models/auth.models';
import { UserPayload } from '../../shared/models/user.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private messageService = inject(MessageService);

  private readonly API_URL = `${environment.apiUrl}/api/auth`;

  // Signals de estado
  currentUser = signal<UserPayload | null>(null);
  isAuthenticated = signal<boolean>(false);

  // 🔥 Novo Signal para guardar o token temporário do 2FA
  // Não salvamos isso no LocalStorage por segurança!
  preAuthToken = signal<string | null>(null);

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const token = localStorage.getItem('matia_token');
    const userStr = localStorage.getItem('matia_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as UserPayload;
        this.currentUser.set(user);
        this.isAuthenticated.set(true);
      } catch (error) {
        this.logout();
      }
    }
  }

  // Rota que o Interceptor chama silenciosamente
  refreshToken(): Observable<LoginResponse> {
    // Passamos o objeto de opções com { withCredentials: true }
    // Isso avisa o navegador: "Pegue o cookie httpOnly de refresh e mande junto!"
    return this.http.post<LoginResponse>(
      `${this.API_URL}/refresh`, 
      {}, // Não mandamos nada no body, a mágica está no cookie
      { withCredentials: true } 
    ).pipe(
      tap((response) => {
        // Quando voltar com sucesso, atualizamos apenas o Access Token normal
        if (response.token) {
          localStorage.setItem('matia_token', response.token);
          // O backend já terá renovado o Cookie do Refresh Token automaticamente
        }
      })
    );
  }


  // 1. Mude o retorno para Observable<AuthResponse>
  login(credentials: LoginRequest): Observable<AuthResponse> {
    // 2. Mude o post para <AuthResponse>
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, credentials).pipe(
      tap((response) => {
        // Cenário A: Verificamos se a propriedade exclusiva do 2FA existe no objeto
        if ('requires_2fa' in response) {
          this.preAuthToken.set(response.preAuthToken);
          this.messageService.add({
            severity: 'info',
            summary: '2FA Necessário',
            detail: 'Por favor, insira o código do seu autenticador.'
          });
          this.router.navigate(['/login-2fa']);
        }
        // Cenário B: Se não caiu no IF acima, o TS agora entende que é um LoginResponse
        // Usamos 'token' in response para garantir a tipagem no else if
        else if ('token' in response) {
          this.finalizeLogin(response);
        }
      })
    );
  }

  // Adicione este método no seu AuthService
  updateCurrentUser(user: UserPayload) {
    // 1. Atualiza o LocalStorage para que o F5 não perca a alteração
    localStorage.setItem('matia_user', JSON.stringify(user));

    // 2. Atualiza o Signal para que o Header mude NA HORA
    this.currentUser.set(user);
  }

  /**
   * FASE 2: Validação do código TOTP
   */
  login2FA(token2fa: string): Observable<LoginResponse> {
    const preToken = this.preAuthToken();

    return this.http.post<LoginResponse>(`${this.API_URL}/login-2fa`, {
      preAuthToken: preToken,
      token2fa: token2fa
    }).pipe(
      tap((response) => {
        if (response.token && response.user) {
          this.finalizeLogin(response);
          this.preAuthToken.set(null); // Limpa o token temporário
        }
      })
    );
  }

  /**
   * Centraliza a gravação dos dados após sucesso total
   */
  private finalizeLogin(response: LoginResponse) {
    localStorage.setItem('matia_token', response.token);
    localStorage.setItem('matia_user', JSON.stringify(response.user));

    this.currentUser.set(response.user);
    this.isAuthenticated.set(true);
  }

  // ==========================================
  // RECUPERAÇÃO E ALTERAÇÃO DE SENHA
  // ==========================================

   // 1. Esqueci minha senha (Público)
  
  forgotPassword(email: string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_URL}/forgot-password`, { email });
  }

  /**
   * 2. Redefinir Senha (Público - via link do e-mail)
   * Recebe o token da URL e a nova senha definida pelo usuário.
   */
  resetPassword(data: ResetPasswordRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_URL}/reset-password`, data);
  }

  /**
   * 3. Alterar Senha (Privado - Usuário Logado)
   * Exige a senha atual para confirmar a troca pela nova.
   */
  changePassword(data: ChangePasswordRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_URL}/change-password`, data);
  }

  // Adicione este método no seu AuthService
  changeFirstAccessPassword(data: ChangePasswordRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.API_URL}/first-access`, data);
  }

  logout(): void {
    localStorage.clear();
    sessionStorage.clear();

    // Reseta os Signals para o estado inicial absoluto
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.preAuthToken.set(null);

    this.messageService.add({
      severity: 'info',
      summary: 'Sessão Encerrada',
      detail: 'Você saiu com segurança.',
      life: 3000
    });

    // Navega para o login
    this.router.navigate(['/login']).then(() => {
      //Recarregar a página garante que TODAS as variáveis 
      // de todos os componentes e services sejam destruídas da memória.
      window.location.reload();
    });
  }

  // 1. Pede o QR Code e garante que a resposta terá o formato Setup2FAResponse
  get2FASetup(): Observable<Setup2FAResponse> {
    // Passamos um objeto vazio porque o backend identifica o user pelo Bearer Token no Header
    return this.http.post<Setup2FAResponse>(`${this.API_URL}/setup-2fa`, {});
  }
  /**
   * 2. Ativa definitivamente o 2FA (Confirmação)
   * No Postman: POST http://localhost:3002/api/auth/confirm-2fa { "token": "062880" }
   */
  enable2FA(token: string): Observable<ApiResponse> {
    // Garante que o campo enviado se chama 'token' conforme seu teste no Postman
    return this.http.post<ApiResponse>(`${this.API_URL}/confirm-2fa`, { token });
  }

  /**
   * 3. Desativa a proteção 2FA
   * No Postman: POST http://localhost:3002/api/auth/disable-2fa { "token": "062880" }
   */
  disable2FA(token: string): Observable<ApiResponse> {
    // Seguindo a mesma lógica da ativação, enviamos o código para validar a remoção
    return this.http.post<ApiResponse>(`${this.API_URL}/disable-2fa`, { token });
  }

  // Retorna o objeto do usuário atual (ou null se não estiver logado)
  getUser(): UserPayload | null {
    return this.currentUser();
  }

  // Retorna se o usuário está logado
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  getToken(): string | null {
    return localStorage.getItem('matia_token');
  }
}
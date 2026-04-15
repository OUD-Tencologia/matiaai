import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../../core/services/auth.service';
import { MessageService } from 'primeng/api';
import { LoginRequest, AuthResponse } from '../../../../shared/models/auth.models'; // Importamos AuthResponse
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ButtonModule, InputTextModule, RippleModule, ReactiveFormsModule, PasswordModule, ToastModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  showPassword = false;

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    profile_password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const credentials = this.loginForm.value as LoginRequest;

    this.authService.login(credentials).subscribe({
      // Usamos o tipo genérico AuthResponse para aceitar ambas as respostas
      next: (response: AuthResponse) => {
        this.isLoading.set(false);
        // Deixamos a inteligência de saber "pra onde ir" no Componente,
        // mas baseada na resposta que o Service repassa.

        // Cenário 1: O usuário TEM 2FA ativado
        if ('requires_2fa' in response) {
          // O AuthService já salvou o preAuthToken. O MessageService avisa.
          // Só mandamos ele pra tela do código.
          this.router.navigate(['/login-two-factor']); 
        } 
        
        // Cenário 2: O usuário NÃO TEM 2FA ativado (Entrada Direta)
        else if ('token' in response) {
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Bem-vindo!', 
            detail: 'Login realizado com sucesso.',
            life: 3000
          });
          this.router.navigate(['/matia/chat']); 
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(error.error?.message || 'Erro ao tentar fazer login. Verifique suas credenciais.');
        console.error('Erro no login:', error);
      }
    });
  }
}
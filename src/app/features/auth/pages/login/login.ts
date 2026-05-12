import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // Import simplificado
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';

import { AuthService } from '../../../../core/services/auth.service';
import { LoginRequest, AuthResponse } from '../../../../shared/models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ButtonModule,
    RouterModule,
    InputTextModule,
    RippleModule,
    ReactiveFormsModule,
    PasswordModule,
    ToastModule
  ],
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
      next: (response: AuthResponse) => {
        this.isLoading.set(false);

        // Cenário 1: O usuário TEM 2FA ativado
        if ('requires_2fa' in response) {
          this.messageService.add({
            severity: 'info',
            summary: '2FA Necessário',
            detail: 'Por favor, insira o código do seu autenticador.',
            life: 3000
          });

          // Usando UrlTree para navegação programática
          const tree = this.router.createUrlTree(['/login-two-factor']);
          this.router.navigateByUrl(tree);
        }

        // Cenário 2: O usuário NÃO TEM 2FA ativado (Entrada Direta)
        else if ('token' in response) {
          this.messageService.add({
            severity: 'success',
            summary: 'Bem-vindo!',
            detail: 'Login realizado com sucesso.',
            life: 3000
          });

          // Criamos a árvore e navegamos substituindo a URL atual no histórico
          const tree = this.router.createUrlTree(['/matia/chat']);
          this.router.navigateByUrl(tree, { replaceUrl: true });
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error.error?.message || 'Erro ao tentar fazer login. Verifique suas credenciais.'
        );
        console.error('Erro no login:', error);
      }
    });
  }
}
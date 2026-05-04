import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-first-access',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PasswordModule,
    ButtonModule,
    CardModule,
    ToastModule
  ],
  templateUrl: './first-access.html',
  styleUrls: ['./first-access.scss']
})
export class FirstAccess {
  senhaAtual: string = '';
  novaSenha: string = '';
  confirmarSenha: string = '';

  isLoading: boolean = false;

  // 🌟 Injetando os serviços
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);

  onSubmit() {
    // 1. Validações do Front-end
    if (!this.senhaAtual || !this.novaSenha || !this.confirmarSenha) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'Preencha todos os campos.' });
      return;
    }

    if (this.novaSenha !== this.confirmarSenha) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'A nova senha e a confirmação não coincidem.' });
      return;
    }

    if (this.novaSenha.length < 6) {
      this.messageService.add({ severity: 'warn', summary: 'Atenção', detail: 'A senha deve ter no mínimo 6 caracteres.' });
      return;
    }

    // Passou pelas validações, liga o loading do botão
    this.isLoading = true;

    // 2. Chama a API
    this.authService.changeFirstAccessPassword({
      currentPassword: this.senhaAtual,
      newPassword: this.novaSenha
    }).subscribe({
      next: (response) => {
        this.isLoading = false;

        // Mostra o aviso de sucesso (usando a mensagem que veio do Fastify)
        this.messageService.add({ severity: 'success', summary: 'Sucesso!', detail: response.message });

        // 3. 🌟 O PULO DO GATO: Atualizar o estado do Front-end
        // Atualizamos o Signal para que o Guard libere o acesso ao resto do sistema
        const currentUser = this.authService.getUser();
        if (currentUser) {
          this.authService.updateCurrentUser({ ...currentUser, primeiro_acesso: false });
        }

        // 4. Redireciona o usuário para o sistema
        this.router.navigate(['/matia/chat']);
      },
      error: (err) => {
        this.isLoading = false;
        
        // Pega a mensagem de erro formatada que mandamos do backend
        const errorMessage = err.error?.message || 'Ocorreu um erro ao tentar alterar a senha.';
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: errorMessage });
      }
    });
  }
}

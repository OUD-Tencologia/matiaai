import { Component, inject, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { AuthService } from '../../core/services/auth.service';

interface ConsultaRecente {
  id: number;
  titulo: string;
  tempo: string;
  favorito: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, InputTextModule, SkeletonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  @Output() close = new EventEmitter<void>();

  private authService = inject(AuthService)

  recentes: ConsultaRecente[] = [
    { id: 1, titulo: 'Lei 14.129/2021 - Governo Digital', tempo: '2h atrás', favorito: false },
    { id: 2, titulo: 'Recurso Especial - Direito Tributário', tempo: '1 dia atrás', favorito: true },
    { id: 3, titulo: 'Petição Inicial - Ação de Cobrança', tempo: '2 dias atrás', favorito: false },
  ];

  favoritos: ConsultaRecente[] = [
    { id: 1, titulo: 'Recurso Especial - Direito Tributário', tempo: '1 dia atrás', favorito: true },
    { id: 2, titulo: 'Parecer Jurídico - Licitação', tempo: '3 dias atrás', favorito: true },
  ];

  onNavigate() {
  this.close.emit();
}

isAdmin(): boolean {
  return this.authService.currentUser()?.role === 'SUPER-ADMIN';
}

hasAdminAccess(): boolean {
  const role = this.authService.currentUser()?.role;
  return role === 'SUPER-ADMIN' || role === 'ADMIN';
}

  logout() {
    this.authService.logout();
  }
}

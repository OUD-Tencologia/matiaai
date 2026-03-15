import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  area: string;
  status: string;
  acesso: string;
}

interface Permissao {
  label: string;
  ativo: boolean;
}

@Component({
  selector: 'app-usuarios',
  imports: [FormsModule, ButtonModule, InputTextModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios {

  searchTerm = '';
  perfilFilter = '';
  statusFilter = '';
  selectedId: number | null = null;
  selectedUser: Usuario | null = null;
  modalAberto = false;

  perfilBadge: Record<string, string> = {
    'Administrador':   'badge-admin',
    'Gestor':          'badge-gestor',
    'Assessor Jurídico': 'badge-assessor',
    'Visualizador':    'badge-viewer',
  };

  permissoes: Permissao[] = [
    { label: 'Consultar leis',  ativo: true  },
    { label: 'Chat com IA',     ativo: true  },
    { label: 'Exportar PDF',    ativo: true  },
    { label: 'Gerir usuários',  ativo: false },
    { label: 'Config. sistema', ativo: false },
    { label: 'Ver dashboard',   ativo: true  },
  ];

  usuarios: Usuario[] = [
    { id: 1, nome: 'Francisco Naifa',  email: 'francisco@matia.mt.gov.br', perfil: 'Administrador',    area: 'Todas',         status: 'ativo',   acesso: 'Hoje, 14h22'  },
    { id: 2, nome: 'Roberta Vilela',  email: 'roberta@matia.mt.gov.br', perfil: 'Gestor',           area: 'Tributário',    status: 'ativo',   acesso: 'Hoje, 11h05'  },
    { id: 3, nome: 'Aislan Carvalho',    email: 'carlos@matia.mt.gov.br',    perfil: 'Assessor Jurídico',area: 'Civil',         status: 'ativo',   acesso: 'Ontem, 16h48' },
    { id: 4, nome: 'Jonathas Silva',   email: 'jonathas@matia.mt.gov.br',   perfil: 'Assessor Jurídico',area: 'Administrativo',status: 'ativo',   acesso: 'Ontem, 09h30' },
    { id: 5, nome: 'Evandro Santos',     email: 'evandro@matia.mt.gov.br',   perfil: 'Visualizador',     area: 'Penal',         status: 'inativo', acesso: '22/06, 15h12' },
    { id: 6, nome: 'Renan Silva',   email: 'renan@matia.mt.gov.br',  perfil: 'Gestor',           area: 'Trabalhista',   status: 'ativo',   acesso: '21/06, 10h00' },
  ];

  filteredUsers: Usuario[] = [...this.usuarios];

  aplicarFiltros() {
    this.filteredUsers = this.usuarios.filter(u => {
      const matchSearch = !this.searchTerm ||
        u.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchPerfil = !this.perfilFilter || u.perfil === this.perfilFilter;
      const matchStatus = !this.statusFilter || u.status === this.statusFilter;
      return matchSearch && matchPerfil && matchStatus;
    });
  }

  iniciais(nome: string): string {
    return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  selecionarUsuario(u: Usuario) {
    this.selectedId = u.id;
    this.selectedUser = { ...u };
  }

  abrirModal() { this.modalAberto = true; }
  fecharModal() { this.modalAberto = false; }

  fecharModalFora(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.fecharModal();
    }
  }
}

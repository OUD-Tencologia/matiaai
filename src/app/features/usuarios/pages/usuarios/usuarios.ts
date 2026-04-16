import { Component, OnInit, computed, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProfileService } from '../../../../core/services/profile-service';
import { ProfileData, CreateProfilePayload } from '../../../../shared/models/profile.model';



@Component({
  selector: 'app-usuarios',
  imports: [CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    InputMaskModule,
    ToastModule,
    ConfirmDialogModule],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios {
  //Injetamos as dependências do service e messageService
  private _profileService = inject(ProfileService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);


  // Gerenciamento de Estado (Signals)
  perfis = signal<ProfileData[]>([]);
  filteredUsers = signal<ProfileData[]>([]);
  selectedUser = signal<ProfileData | null>(null);
  modalAberto = signal(false);
  loading = signal(false);

  // Computed Properties
  selectedId = computed(() => this.selectedUser()?.id || null);

  // Filtros de Tela
  searchTerm = '';
  perfilFilter = '';
  statusFilter = '';

  // Modelo de Criação
  novoProfile: CreateProfilePayload = this.gerarPerfilVazio();

  ngOnInit() {
    this.carregarPerfis();
  }

  // ==========================================
  // CHAMADAS À API (CRUD)
  // ==========================================

  carregarPerfis() {
    this.loading.set(true);
    this._profileService.getProfiles().subscribe({
      next: (res: any) => {
        // Blindagem igual a que fizemos na empresa
        const dados = Array.isArray(res) ? res : (res.data || res.profiles || []);
        this.perfis.set(dados);
        this.aplicarFiltros();
        this.loading.set(false);
      },
      error: () => {
        this.mostrarMensagem('error', 'Erro', 'Falha ao buscar usuários do servidor.');
        this.loading.set(false);
      }
    });
  }

  salvarCadastro() {
    // 1. Validação Básica
    if (!this.novoProfile.nome || !this.novoProfile.email || !this.novoProfile.profile_password) {
      this.mostrarMensagem('error', 'Campos Obrigatórios', 'Preencha o Nome, E-mail e Senha.');
      return;
    }

    // 2. Formatação da Data (De DD/MM/AAAA para YYYY-MM-DD)
    let dataFormatada = this.novoProfile.data_nascimento;
    if (dataFormatada && dataFormatada.includes('/')) {
      const partes = dataFormatada.split('/');
      // Garante que tem 3 partes (dia, mes, ano) antes de inverter
      if (partes.length === 3) {
        dataFormatada = `${partes[2]}-${partes[1]}-${partes[0]}`;
      }
    }

    // 3. Montar o Payload Limpo apenas com os campos obrigatórios
    const payload: any = {
      nome: this.novoProfile.nome,
      email: this.novoProfile.email,
      cpf: this.novoProfile.cpf,
      telefone: this.novoProfile.telefone,
      data_nascimento: dataFormatada, // 👈 Enviando a data invertida pro banco!
      profile_password: this.novoProfile.profile_password,
      role: this.novoProfile.role || 'USER',
      status: this.novoProfile.status || 'ativo'
    };

    // 4. Só envia os campos opcionais se o usuário tiver digitado algo neles (Evita o Erro 400)
    if (this.novoProfile.area_juridica && this.novoProfile.area_juridica.trim() !== '') {
      payload.area_juridica = this.novoProfile.area_juridica;
    }
    if (this.novoProfile.avatar_url && this.novoProfile.avatar_url.trim() !== '') {
      payload.avatar_url = this.novoProfile.avatar_url;
    }

    // 5. Envia para o Backend
    this._profileService.createProfile(payload).subscribe({
      next: () => {
        this.mostrarMensagem('success', 'Sucesso', 'Usuário criado com sucesso!');
        this.fecharModal();
        this.carregarPerfis();
      },
      error: (err) => {
        console.error('Erro detalhado do Backend:', err);
        this.mostrarMensagem('error', 'Erro no Cadastro', 'Verifique os dados ou se o e-mail/CPF já existe.');
      }
    });
  }

  salvarEdicao() {
    const usuarioAtual = this.selectedUser();
    if (!usuarioAtual) return;

    // Removemos os campos que não devem ir no PUT (como ID, empresa_id, etc)
    // Ajuste o payload de atualização de acordo com as regras do seu Fastify
    const payloadUpdate = {
      nome: usuarioAtual.nome,
      email: usuarioAtual.email,
      cpf: usuarioAtual.cpf,
      telefone: usuarioAtual.telefone,
      data_nascimento: usuarioAtual.data_nascimento,
      role: usuarioAtual.role,
      area_juridica: usuarioAtual.area_juridica,
      status: usuarioAtual.status,
      avatar_url: usuarioAtual.avatar_url
    };

    this._profileService.updateProfile(usuarioAtual.id, payloadUpdate).subscribe({
      next: () => {
        this.mostrarMensagem('success', 'Atualizado', 'Dados do usuário salvos com sucesso!');
        this.carregarPerfis();
      },
      error: () => this.mostrarMensagem('error', 'Erro', 'Falha ao atualizar o usuário.')
    });
  }

  excluir(id: string) {
    if (!id) return;

    this.confirmationService.confirm({
      header: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja remover este usuário? O acesso dele ao sistema será revogado imediatamente.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, Remover',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this._profileService.deleteProfile(id).subscribe({
          next: () => {
            this.mostrarMensagem('success', 'Excluído', 'Usuário removido com sucesso.');
            this.carregarPerfis();
            this.selectedUser.set(null); // Limpa o painel lateral
          },
          error: () => this.mostrarMensagem('error', 'Erro', 'Não foi possível remover o usuário.')
        });
      }
    });
  }

  // ==========================================
  // CONTROLE DE INTERFACE E UTILITÁRIOS
  // ==========================================

  aplicarFiltros() {
    let lista = this.perfis();
    if (!Array.isArray(lista)) return;

    if (this.searchTerm) {
      const termo = this.searchTerm.toLowerCase();
      lista = lista.filter(u =>
        u.nome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo)
      );
    }
    if (this.perfilFilter) {
      lista = lista.filter(u => u.role === this.perfilFilter);
    }
    if (this.statusFilter) {
      lista = lista.filter(u => u.status === this.statusFilter);
    }

    this.filteredUsers.set(lista);
  }

  selecionarUsuario(usuario: ProfileData) {
    // Clonamos o objeto para evitar que a edição "ao vivo" altere a lista 
    // antes de clicar em salvar
    this.selectedUser.set({ ...usuario });
  }

  alternarStatus() {
    const user = this.selectedUser();
    if (user) {
      const novoStatus = user.status === 'ativo' ? 'inativo' : 'ativo';
      this.selectedUser.set({ ...user, status: novoStatus });
    }
  }

  abrirModal() {
    this.novoProfile = this.gerarPerfilVazio();
    this.modalAberto.set(true);
  }

  fecharModal() {
    this.modalAberto.set(false);
  }

  fecharModalFora(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.fecharModal();
    }
  }

  iniciais(nome?: string): string {
    if (!nome) return 'US';
    const partes = nome.trim().split(' ');
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  private gerarPerfilVazio(): CreateProfilePayload {
    return {
      nome: '',
      email: '',
      cpf: '',
      telefone: '',
      data_nascimento: '',
      profile_password: '',
      role: 'USER',
      area_juridica: '',
      status: 'ativo',
      avatar_url: ''
    };
  }

  private mostrarMensagem(severidade: string, sumario: string, detalhe: string) {
    this.messageService.add({ severity: severidade, summary: sumario, detail: detalhe });
  }
}
import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Imports
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { InputMaskModule } from 'primeng/inputmask';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

// Services e Models
import { CompanyService } from '../../../../../core/services/company-service';
import { CompanyData, RegisterCompanyRequest, RegisterCompanyResponse, AdminData } from '../../../../../shared/models/company.models';

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    PasswordModule,
    InputMaskModule,
    ConfirmDialogModule,
    ToastModule
    
  ],
  providers: [MessageService], // Necessário para os Toasts (alertas) funcionarem
  templateUrl: './empresas.html',
  styleUrl: './empresas.scss',
})
export class EmpresasComponent implements OnInit {

  // Injeção de Dependências
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private _companyService = inject(CompanyService);
  
  // Signals principais da listagem
  empresas = signal<CompanyData[]>([]);
  filteredEmpresas = signal<CompanyData[]>([]);
  selectedEmpresa = signal<CompanyData | null>(null);
  
  // Signals de Filtro e UI
  searchTerm = signal('');
  statusFilter = signal<'todas' | 'ativas' | 'inativas'>('todas');
  loading = signal(true);
  modalAberto = signal(false);
  editando = signal(false); // Substituiu o modalMode para facilitar o bind no HTML
  
  // Objetos do Formulário
  novaEmpresa: Partial<CompanyData> = {};
  novoAdmin: Partial<AdminData> = {};
  
  // Computed: Estatísticas dinâmicas
  stats = computed(() => {
    const lista = this.empresas();
    return {
      total: lista.length,
      ativas: lista.filter(e => e.active).length,
      inativas: lista.filter(e => !e.active).length,
      trial: lista.filter(e => e.plano === 'trial').length
    };
  });

  ngOnInit() {
    this.carregarEmpresas();
  }

  // ==========================================
  // INTEGRAÇÃO COM A API (MÉTODOS REAIS)
  // ==========================================

  carregarEmpresas() {
    this.loading.set(true);
    
    this._companyService.getCompanies().subscribe({
      next: (resposta: any) => {
        // 🔥 O truque: Se a resposta for um array, usa direto. 
        // Se for objeto, procura dentro de 'data' ou 'empresas' (ajuste se seu backend usar outro nome).
        const dados = Array.isArray(resposta) ? resposta : (resposta.data || resposta.empresas || []);
        
        this.empresas.set(dados);
        this.aplicarFiltros();
        this.loading.set(false);
      },
      error: (err) => {
        this.mostrarMensagem('error', 'Erro', 'Falha ao buscar empresas do servidor.');
        this.loading.set(false);
      }
    });
  }

  salvarCadastro() {
    // ==========================================
    // ✏️ MODO EDIÇÃO (PUT)
    // ==========================================
    if (this.editando()) {
      const idEmpresa = this.novaEmpresa.id;
      if (!idEmpresa) return;

      // O Schema de Update do Fastify só aceita estes 5 campos. 
      // Se mandar CNPJ ou Code, o additionalProperties: false vai bloquear.
      const payloadUpdate = {
        name: this.novaEmpresa.name,
        email: this.novaEmpresa.email,
        phone: this.novaEmpresa.phone,
        plano: this.novaEmpresa.plano,
        active: this.novaEmpresa.active
      };
      
      this._companyService.updateCompany(idEmpresa, payloadUpdate).subscribe({
        next: () => {
          this.mostrarMensagem('success', 'Sucesso', 'Empresa atualizada com sucesso!');
          this.fecharModal();
          this.carregarEmpresas();
        },
        error: () => this.mostrarMensagem('error', 'Erro', 'Falha ao atualizar a empresa.')
      });
      return;
    }

    // ==========================================
    // ➕ MODO CRIAÇÃO (POST)
    // ==========================================
    
    // 1. Validação básica de campos obrigatórios (evita bater no Fastify à toa)
    if (!this.novaEmpresa.name || !this.novaEmpresa.cnpj || !this.novoAdmin.nome || !this.novoAdmin.profile_password) {
      this.mostrarMensagem('error', 'Campos Incompletos', 'Preencha todos os campos obrigatórios da Empresa e do Administrador.');
      return;
    }

    // 2. Monta o Payload exatamente com a assinatura que o Fastify exige
    // O operador || '' garante que, se algo estiver vazio, envia string vazia em vez de undefined
    const payload: RegisterCompanyRequest = {
      company: {
        name: this.novaEmpresa.name || '',
        code: this.novaEmpresa.code || '',
        cnpj: this.novaEmpresa.cnpj || '',
        email: this.novaEmpresa.email || '',
        phone: this.novaEmpresa.phone || '',
        plano: (this.novaEmpresa.plano as any) || 'trial',
        active: this.novaEmpresa.active ?? true
      },
      admin: {
        nome: this.novoAdmin.nome || '',
        email: this.novoAdmin.email || '',
        cpf: this.novoAdmin.cpf || '',
        telefone: this.novoAdmin.telefone || '',
        data_nascimento: this.novoAdmin.data_nascimento || '',
        profile_password: this.novoAdmin.profile_password || ''
      }
    };

    this._companyService.registerCompany(payload).subscribe({
      next: () => {
        this.mostrarMensagem('success', 'Sucesso', 'Empresa e Administrador cadastrados!');
        this.fecharModal();
        this.carregarEmpresas();
      },
      error: (err) => {
        console.error('Erro detalhado do Fastify:', err);
        this.mostrarMensagem('error', 'Erro no Cadastro', 'Verifique os dados e tente novamente.');
      }
    });
  }

  excluir(id?: string) {
    if (!id) return;

    this.confirmationService.confirm({
      header: 'Confirmar Exclusão',
      message: 'Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita e todos os usuários vinculados perderão o acesso.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger', // Deixa o botão de confirmar vermelho
      rejectButtonStyleClass: 'p-button-text',   // Deixa o botão de cancelar discreto
      accept: () => {
        this._companyService.deleteCompany(id).subscribe({
          next: () => {
            this.mostrarMensagem('success', 'Excluído', 'Empresa removida com sucesso.');
            this.carregarEmpresas();
            this.selectedEmpresa.set(null);
          },
          error: () => this.mostrarMensagem('error', 'Erro', 'Não foi possível excluir a empresa.')
        });
      }
    });
  }

  toggleStatus(empresa: any, event: Event) {
    event.stopPropagation();
    const novoStatus = !empresa.active;
    
    this._companyService.updateCompany(empresa.id, { active: novoStatus }).subscribe({
      next: () => {
        empresa.active = novoStatus;
        this.mostrarMensagem('success', 'Atualizado', `Status alterado para ${novoStatus ? 'Ativo' : 'Inativo'}.`);
        this.carregarEmpresas(); // Força a re-renderização dos Signals
      },
      error: () => this.mostrarMensagem('error', 'Erro', 'Falha ao mudar o status da empresa.')
    });
  }

  // ==========================================
  // CONTROLES DE INTERFACE E FILTROS
  // ==========================================

  aplicarFiltros() {
    let resultado = this.empresas();
    
    // Filtro de busca (usando os campos em inglês da API)
    const termo = this.searchTerm().toLowerCase();
    if (termo) {
      resultado = resultado.filter(e => 
        e.name?.toLowerCase().includes(termo) ||
        e.code?.toLowerCase().includes(termo) ||
        e.cnpj?.includes(termo)
      );
    }
    
    // Filtro de status
    if (this.statusFilter() === 'ativas') {
      resultado = resultado.filter(e => e.active);
    } else if (this.statusFilter() === 'inativas') {
      resultado = resultado.filter(e => !e.active);
    }
    
    this.filteredEmpresas.set(resultado);
  }

  selecionarEmpresa(empresa: CompanyData) {
    this.selectedEmpresa.set(empresa);
  }

  abrirModalNovo() {
    this.editando.set(false);
    this.novaEmpresa = { active: true, plano: 'trial' };
    this.novoAdmin = {}; // Zera os dados do admin
    this.modalAberto.set(true);
  }

  editarEmpresa(empresa: CompanyData, event: Event) {
    event.stopPropagation();
    this.editando.set(true);
    this.novaEmpresa = { ...empresa }; // Clona os dados para não editar direto na lista antes de salvar
    this.modalAberto.set(true);
  }

  fecharModal() {
    this.modalAberto.set(false);
  }

  mostrarMensagem(tipo: string, titulo: string, detalhe: string) {
    this.messageService.add({ severity: tipo, summary: titulo, detail: detalhe });
  }

  // ==========================================
  // HELPERS DE FORMATAÇÃO VISUAL
  // ==========================================

  formatarPlano(plano: string): string {
    const map: Record<string, string> = {
      trial: 'Trial',
      basico: 'Básico',
      profissional: 'Profissional',
      enterprise: 'Enterprise'
    };
    return map[plano] || plano;
  }

  getIniciais(nome: string): string {
    if (!nome) return '';
    return nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getPlanoClass(plano: string): string {
    return `badge-plano-${plano}`;
  }

  calcularDiasRestantes(validade: string): number {
    if (!validade) return 0;
    const [dia, mes, ano] = validade.split('/').map(Number);
    const dataValidade = new Date(ano, mes - 1, dia);
    const diff = dataValidade.getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }
}
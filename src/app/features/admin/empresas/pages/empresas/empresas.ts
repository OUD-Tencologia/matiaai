import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG Imports
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { InputMaskModule } from 'primeng/inputmask';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

// Services e Models
import { CompanyService } from '../../../../../core/services/company-service';
import { CompanyData, RegisterCompanyRequest, AdminData } from '../../../../../shared/models/company.models';

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
  // 🌟 Garante que os serviços de alerta e confirmação funcionem
  providers: [MessageService, ConfirmationService], 
  templateUrl: './empresas.html',
  styleUrl: './empresas.scss',
})
export class EmpresasComponent implements OnInit {
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private _companyService = inject(CompanyService);
  
  empresas = signal<CompanyData[]>([]);
  filteredEmpresas = signal<CompanyData[]>([]);
  selectedEmpresa = signal<CompanyData | null>(null);
  
  searchTerm = signal('');
  statusFilter = signal<'todas' | 'ativas' | 'inativas'>('todas');
  loading = signal(true);
  modalAberto = signal(false);
  editando = signal(false);
  
  novaEmpresa: Partial<CompanyData> = {};
  novoAdmin: Partial<AdminData> = {};
  
  // 📊 Estatísticas para os cards do topo (Casando com seu HTML)
  stats = computed(() => {
    const lista = this.empresas();
    return {
      total: lista.length,
      ativas: lista.filter(e => e.active).length,
      inativas: lista.filter(e => !e.active).length,
      trial: lista.filter(e => e.plano === 'trial').length,
      // Se quiser usar o total de usuários em algum lugar:
      totalUsuarios: lista.reduce((acc, curr) => acc + (Number(curr.usuarios_count) || 0), 0)
    };
  });

  ngOnInit() {
    this.carregarEmpresas();
  }

  // --- MÉTODOS DE FORMATAÇÃO (BATENDO COM SEU HTML) ---

  formatarPlano(plano?: string): string {
    const nomes: Record<string, string> = {
      trial: 'Trial (30 dias)',
      basico: 'Básico',
      profissional: 'Profissional',
      enterprise: 'Enterprise'
    };
    return plano ? nomes[plano] || plano : 'Não definido';
  }

  getPlanoClass(plano?: string): string {
    // 🎨 Retorna 'badge-trial', 'badge-basico' etc, conforme seu SCSS
    return plano ? `badge-${plano}` : 'badge-default';
  }

 
getIniciais(nome?: string): string {
  if (!nome) return '??';
  return nome
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

  // --- LÓGICA DE NEGÓCIO ---

  carregarEmpresas() {
    this.loading.set(true);
    this._companyService.getCompanies().subscribe({
      next: (res: any) => {
        const dados = Array.isArray(res) ? res : (res.data || []);
        this.empresas.set(dados);
        this.aplicarFiltros();
        this.loading.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao carregar empresas' });
        this.loading.set(false);
      }
    });
  }

  aplicarFiltros() {
    let lista = this.empresas();
    const termo = this.searchTerm().toLowerCase();
    
    if (termo) {
      lista = lista.filter(e => 
        e.name?.toLowerCase().includes(termo) || 
        e.code?.toLowerCase().includes(termo) || 
        e.cnpj?.includes(termo)
      );
    }
    
    if (this.statusFilter() === 'ativas') lista = lista.filter(e => e.active);
    if (this.statusFilter() === 'inativas') lista = lista.filter(e => !e.active);
    
    this.filteredEmpresas.set(lista);
  }

  selecionarEmpresa(empresa: CompanyData) {
    this.selectedEmpresa.set(empresa);
  }

  abrirModalNovo() {
    this.editando.set(false);
    this.novaEmpresa = { active: true, plano: 'trial' };
    this.novoAdmin = {};
    this.modalAberto.set(true);
  }

  editarEmpresa(empresa: CompanyData, event: Event) {
    event.stopPropagation();
    this.editando.set(true);
    this.novaEmpresa = { ...empresa };
    this.modalAberto.set(true);
  }

  fecharModal() {
    this.modalAberto.set(false);
  }

  toggleStatus(empresa: CompanyData, event: Event) {
    event.stopPropagation();
    const novoStatus = !empresa.active;
    this._companyService.updateCompany(empresa.id!, { active: novoStatus }).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Status atualizado com sucesso!' });
        this.carregarEmpresas();
      }
    });
  }

  excluir(id?: string) {
    if (!id) return;
    this.confirmationService.confirm({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir a empresa <strong>${this.selectedEmpresa()?.name}</strong>? Todos os dados serão perdidos.`,
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      
      acceptButtonStyleClass: 'p-button-danger', 
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      
      accept: () => {
        this._companyService.deleteCompany(id).subscribe({
          next: () => {
            // Mensagem de sucesso atualizada!
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Sucesso!', 
              detail: 'Empresa excluída com sucesso!' 
            });
            
            this.carregarEmpresas();
            this.selectedEmpresa.set(null);
          },
          error: (err) => {
            // Adicionado o Toast de erro para quando algo der errado no backend
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Erro', 
              detail: 'Não foi possível excluir a empresa' 
            });
          }
        });
      }
    });
  }

  salvarCadastro() {
    if (this.editando()) {
      // Atualização
      this._companyService.updateCompany(this.novaEmpresa.id!, this.novaEmpresa).subscribe({
        next: () => { 
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Empresa atualizada com sucesso!' });
          this.fecharModal(); 
          this.carregarEmpresas(); 
        }
      });
    } else {
      // ➕ Criação
      const payload: RegisterCompanyRequest = {
        company: { ...this.novaEmpresa as CompanyData },
        admin: { 
          ...this.novoAdmin as AdminData, 
          // O seu HTML usa type="date", que já vem no formato YYYY-MM-DD. 
          // Não precisa formatar se for input date puro.
          data_nascimento: this.novoAdmin.data_nascimento || '' 
        }
      };
      this._companyService.registerCompany(payload).subscribe({
        next: () => { 
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Empresa cadastrada com sucesso!' });
          this.fecharModal(); 
          this.carregarEmpresas(); 
        }
      });
    }
  }

  // Helper opcional se o seu input de data mudar para texto
  private formatarDataParaBanco(dataBr: string): string {
    if (!dataBr || !dataBr.includes('/')) return dataBr;
    const [dia, mes, ano] = dataBr.split('/');
    return `${ano}-${mes}-${dia}`;
  }
}
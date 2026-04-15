import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { NonNullableFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompanyService } from '../../../../../core/services/company-service';
// PrimeNG Imports (Adicione conforme seu uso)
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { InputMaskModule } from 'primeng/inputmask';

interface Empresa {
  id: string;
  nome: string;
  codigo: string;
  cnpj: string;
  responsavel: string;
  email: string;
  telefone: string;
  ativa: boolean;
  dataCadastro: string;
  usuariosCount: number;
  consultasMes: number;
  custoMes: number;
  plano: 'trial' | 'basico' | 'profissional' | 'enterprise';
  validade: string;
}

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
    ReactiveFormsModule,
  ],
  templateUrl: './empresas.html',
  styleUrl: './empresas.scss',
})
export class Empresas implements OnInit {

  //injection dependencies
  private router = inject(Router);
  private messageService = inject(MessageService);
  private _companyService = inject(CompanyService);
  private fb = inject(NonNullableFormBuilder);
  // Signals
  empresas = signal<Empresa[]>([]);
  filteredEmpresas = signal<Empresa[]>([]);
  selectedEmpresa = signal<Empresa | null>(null);
  searchTerm = signal('');
  statusFilter = signal<'todas' | 'ativas' | 'inativas'>('todas');
  
  // UI States
  loading = signal(true);
  modalAberto = signal(false);
  modalMode: 'criar' | 'editar' = 'criar';
  
  // Form
  empresaForm: Partial<Empresa> = {};
  
  // Stats
  stats = computed(() => {
    const lista = this.empresas();
    return {
      total: lista.length,
      ativas: lista.filter(e => e.ativa).length,
      inativas: lista.filter(e => !e.ativa).length,
      trial: lista.filter(e => e.plano === 'trial').length
    };
  });

  ngOnInit() {
    this.carregarEmpresas();
  }

  carregarEmpresas() {
    this.loading.set(true);
    
    // TODO: Substituir por chamada real à API
    setTimeout(() => {
      const mock: Empresa[] = [
        {
          id: '1',
          nome: 'Tribunal de Justiça de MT',
          codigo: 'TJMT',
          cnpj: '03.456.789/0001-23',
          responsavel: 'Dr. Carlos Mendes',
          email: 'admin@tjmt.jus.br',
          telefone: '(65) 3613-5000',
          ativa: true,
          dataCadastro: '15/01/2025',
          usuariosCount: 45,
          consultasMes: 1250,
          custoMes: 2450.00,
          plano: 'enterprise',
          validade: '15/01/2026'
        },
        {
          id: '2',
          nome: 'Procuradoria Geral do Estado',
          codigo: 'PGE-MT',
          cnpj: '04.567.890/0001-34',
          responsavel: 'Dra. Ana Paula Silva',
          email: 'contato@pge.mt.gov.br',
          telefone: '(65) 3613-8000',
          ativa: true,
          dataCadastro: '20/02/2025',
          usuariosCount: 28,
          consultasMes: 890,
          custoMes: 1200.00,
          plano: 'profissional',
          validade: '20/02/2026'
        },
        {
          id: '3',
          nome: 'Advocacia Oliveira & Associados',
          codigo: 'OLIVEIRA-ADV',
          cnpj: '12.345.678/0001-90',
          responsavel: 'Dr. Roberto Oliveira',
          email: 'roberto@oliveiraadv.com.br',
          telefone: '(65) 99999-1111',
          ativa: false,
          dataCadastro: '10/03/2025',
          usuariosCount: 5,
          consultasMes: 0,
          custoMes: 0,
          plano: 'basico',
          validade: '10/03/2026'
        },
        {
          id: '4',
          nome: 'Defensoria Pública',
          codigo: 'DEF-MT',
          cnpj: '05.678.901/0001-45',
          responsavel: 'Dra. Maria Santos',
          email: 'defensoria@def.mt.gov.br',
          telefone: '(65) 3613-9000',
          ativa: true,
          dataCadastro: '05/01/2025',
          usuariosCount: 32,
          consultasMes: 567,
          custoMes: 890.50,
          plano: 'profissional',
          validade: '05/01/2026'
        }
      ];
      
      this.empresas.set(mock);
      this.aplicarFiltros();
      this.loading.set(false);
    }, 800);
  }

  aplicarFiltros() {
    let resultado = this.empresas();
    
    // Filtro de busca
    const termo = this.searchTerm().toLowerCase();
    if (termo) {
      resultado = resultado.filter(e => 
        e.nome.toLowerCase().includes(termo) ||
        e.codigo.toLowerCase().includes(termo) ||
        e.responsavel.toLowerCase().includes(termo) ||
        e.cnpj.includes(termo)
      );
    }
    
    // Filtro de status
    if (this.statusFilter() === 'ativas') {
      resultado = resultado.filter(e => e.ativa);
    } else if (this.statusFilter() === 'inativas') {
      resultado = resultado.filter(e => !e.ativa);
    }
    
    this.filteredEmpresas.set(resultado);
  }

  selecionarEmpresa(empresa: Empresa) {
    this.selectedEmpresa.set(empresa);
  }

  novaEmpresa() {
    this.modalMode = 'criar';
    this.empresaForm = {
      ativa: true,
      plano: 'trial'
    };
    this.modalAberto.set(true);
  }

  editarEmpresa(empresa: Empresa, event: Event) {
    event.stopPropagation();
    this.modalMode = 'editar';
    this.empresaForm = { ...empresa };
    this.modalAberto.set(true);
  }

  fecharModal() {
    this.modalAberto.set(false);
    this.empresaForm = {};
  }

  salvarEmpresa() {
    // TODO: Implementar chamada API
    console.log('Salvando:', this.empresaForm);
    this.fecharModal();
    this.carregarEmpresas();
  }

  toggleStatus(empresa: Empresa, event: Event) {
    event.stopPropagation();
    empresa.ativa = !empresa.ativa;
    // TODO: Chamar API para atualizar status
  }

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
  return nome
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

  getPlanoClass(plano: string): string {
    return `badge-plano-${plano}`;
  }

  calcularDiasRestantes(validade: string): number {
    const [dia, mes, ano] = validade.split('/').map(Number);
    const dataValidade = new Date(ano, mes - 1, dia);
    const hoje = new Date();
    const diff = dataValidade.getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  }
}
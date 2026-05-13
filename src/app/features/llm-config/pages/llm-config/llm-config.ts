import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api'; 

import { LlmConfigService } from '../../../../core/services/llm-config.service';
import { LlmConfigModel, LlmProvider } from '../../../../shared/models/LlmConfig.model';

@Component({
  selector: 'app-llm-config',
  imports: [FormsModule, ButtonModule, InputTextModule, SkeletonModule, ToastModule], 
  providers: [MessageService], // ✅ Adicionado para o Toast funcionar corretamente
  templateUrl: './llm-config.html',
  styleUrl: './llm-config.scss',
})
export class LlmConfig implements OnInit {
  isLoading = true;
  modelos: LlmConfigModel[] = []; 
  
  selectedId: string | null = null;
  selectedModelo: LlmConfigModel | null = null; 

  showApiKey = false;
  connectionStatus = 'idle';
  connectionMsg = '○ Conexão não testada'; // ✅ Adicionado de volta
  isSaving = false;

  costCards = [
    { icon: '💰', iconClass: 'icon-gold',  label: 'Custo Total (mês)',  value: 'R$ 0,00' },
    { icon: '⚡', iconClass: 'icon-green', label: 'Tokens Consumidos',  value: '0'      },
    { icon: '🔗', iconClass: 'icon-blue',  label: 'Modelos Ativos',     value: '0 / 0'  },
  ];

  // Injeção de Dependência
  llmService = inject(LlmConfigService);
  messageService = inject(MessageService);

  ngOnInit(): void {
    this.carregarModelos();
  }

  carregarModelos() {
    this.isLoading = true;
    this.llmService.listarModelos().subscribe({
      next: (res) => {
        this.modelos = res.data.map(m => this.aplicarEstilosVisuais(m));
        
        const ativos = this.modelos.filter(m => m.ativo).length;
        this.costCards[2].value = `${ativos} / ${this.modelos.length}`;
        
        const modeloPadrao = this.modelos.find(m => m.padrao) || this.modelos[0];
        if (modeloPadrao) {
          this.selecionarModelo(modeloPadrao);
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erro ao buscar modelos LLM', err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Erro', 
          detail: 'Falha ao carregar as IAs do servidor.' 
        });
        this.isLoading = false;
      }
    });
  }

  private aplicarEstilosVisuais(modelo: LlmConfigModel): LlmConfigModel {
    const estilos: Record<LlmProvider, { logoClass: string, logoText: string }> = {
      'openai': { logoClass: 'logo-openai', logoText: 'GPT' },
      'anthropic': { logoClass: 'logo-anthropic', logoText: 'Cl' },
      'gemini': { logoClass: 'logo-google', logoText: 'G' }
    };

    const estilo = estilos[modelo.provider] || { logoClass: 'logo-default', logoText: 'IA' };
    
    return {
      ...modelo,
      logoClass: estilo.logoClass,
      logoText: estilo.logoText,
      custoPorToken: '—', 
      usoMes: '—',
      custoAcumulado: '—'
    };
  }

  // ✅ Adicionado de volta para o slider de temperatura funcionar
  get tempLabel(): string {
    const v = this.selectedModelo?.temperatura ?? 0;
    if (v <= 0.3) return 'Conservador';
    if (v <= 0.7) return 'Balanceado';
    if (v <= 1.2) return 'Criativo';
    return 'Muito Criativo';
  }

  selecionarModelo(m: LlmConfigModel) {
    this.selectedId = m.id;
    this.selectedModelo = { ...m }; 
    this.connectionStatus = m.api_key ? 'ok' : 'idle';
    this.connectionMsg = m.api_key ? '✅ Conexão verificada com sucesso' : '○ Conexão não testada';
    this.showApiKey = false;
  }

  salvarChave() {
    if (!this.selectedModelo || !this.selectedId) return;

    this.isSaving = true;
    
    // ✅ Agora enviamos o objeto completo (this.selectedModelo) 
    // para salvar também tokens, temperatura, padrão e ativo.
    this.llmService.atualizarModelo(this.selectedId, this.selectedModelo).subscribe({
      next: () => {
        this.connectionStatus = 'ok';
        this.connectionMsg = '✅ Configurações salvas com sucesso';
        this.isSaving = false;
        
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Sucesso!', 
          detail: `Configurações do ${this.selectedModelo?.nome} salvas com sucesso.` 
        });
        
        // Atualiza a lista lateral com os novos dados
        const index = this.modelos.findIndex(m => m.id === this.selectedId);
        if (index !== -1) {
          this.modelos[index] = { ...this.modelos[index], ...this.selectedModelo };
        }
      },
      error: (err) => {
        console.error('Erro ao salvar', err);
        this.connectionStatus = 'error';
        this.connectionMsg = '❌ Erro ao salvar configurações';
        this.isSaving = false;

        this.messageService.add({ 
          severity: 'error', 
          summary: 'Falha', 
          detail: 'Ocorreu um erro ao tentar salvar no servidor.' 
        });
      }
    });
  }

  testarConexao() {
    if (!this.selectedModelo?.api_key) {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Atenção', 
        detail: 'Por favor, insira uma chave antes de testar.' 
      });
      this.connectionStatus = 'error';
      this.connectionMsg = '❌ Insira uma chave válida';
      return;
    }

    this.connectionStatus = 'idle';
    this.connectionMsg = '⏳ Salvando e testando conexão...';
    
    this.messageService.add({ 
      severity: 'info', 
      summary: 'Testando', 
      detail: 'Validando conexão com o provedor...' 
    });
    
    this.salvarChave(); 
  }

  // ✅ Adicionado de volta para o botão superior direito não quebrar
  novoModelo() {
    this.messageService.add({ 
      severity: 'info', 
      summary: 'Em breve', 
      detail: 'Modal de criação de modelo será aberto aqui.' 
    });
  }
}
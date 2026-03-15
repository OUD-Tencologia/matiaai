import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

interface Modelo {
  id: number;
  nome: string;
  provider: string;
  logoClass: string;
  logoText: string;
  padrao: boolean;
  ativo: boolean;
  custoPorToken: string;
  usoMes: string;
  custoAcumulado: string;
  apiKey: string;
  limiteCusto: number;
  maxTokens: number;
  temperatura: number;
}

@Component({
  selector: 'app-llm-config',
  imports: [FormsModule, ButtonModule, InputTextModule],
  templateUrl: './llm-config.html',
  styleUrl: './llm-config.scss',
})
export class LlmConfig {

  selectedId: number | null = 1;
  showApiKey = false;
  connectionStatus = 'ok';
  connectionMsg = '✅ Conexão verificada com sucesso';

  costCards = [
    { icon: '💰', iconClass: 'icon-gold',  label: 'Custo Total (mês)',  value: 'R$ 318,40' },
    { icon: '⚡', iconClass: 'icon-green', label: 'Tokens Consumidos',  value: '4,2M'      },
    { icon: '🔗', iconClass: 'icon-blue',  label: 'Modelos Ativos',     value: '3 / 4'     },
  ];

  modelos: Modelo[] = [
    {
      id: 1, nome: 'GPT-4o', provider: 'OpenAI',
      logoClass: 'logo-openai', logoText: 'GPT',
      padrao: true, ativo: true,
      custoPorToken: 'R$ 0,027', usoMes: '2,1M tokens', custoAcumulado: 'R$ 186,20',
      apiKey: 'sk-proj-••••••••••••••••', limiteCusto: 250, maxTokens: 4096, temperatura: 0.3
    },
    {
      id: 2, nome: 'Claude Sonnet 4', provider: 'Anthropic',
      logoClass: 'logo-anthropic', logoText: 'Cl',
      padrao: false, ativo: true,
      custoPorToken: 'R$ 0,018', usoMes: '1,4M tokens', custoAcumulado: 'R$ 84,60',
      apiKey: 'sk-ant-••••••••••••••••', limiteCusto: 200, maxTokens: 8192, temperatura: 0.5
    },
    {
      id: 3, nome: 'Gemini 1.5 Pro', provider: 'Google',
      logoClass: 'logo-google', logoText: 'G',
      padrao: false, ativo: true,
      custoPorToken: 'R$ 0,022', usoMes: '700K tokens', custoAcumulado: 'R$ 47,60',
      apiKey: 'AIza••••••••••••••••••••', limiteCusto: 150, maxTokens: 16384, temperatura: 0.7
    },
    {
      id: 4, nome: 'Mistral Large', provider: 'Mistral AI',
      logoClass: 'logo-mistral', logoText: 'Mi',
      padrao: false, ativo: false,
      custoPorToken: 'R$ 0,014', usoMes: '—', custoAcumulado: 'R$ 0,00',
      apiKey: '', limiteCusto: 100, maxTokens: 4096, temperatura: 0.3
    },
  ];

  selectedModelo: Modelo | null = this.modelos[0];

  get tempLabel(): string {
    const v = this.selectedModelo?.temperatura ?? 0;
    if (v <= 0.3) return 'Conservador';
    if (v <= 0.7) return 'Balanceado';
    if (v <= 1.2) return 'Criativo';
    return 'Muito Criativo';
  }

  selecionarModelo(m: Modelo) {
    this.selectedId = m.id;
    this.selectedModelo = { ...m };
    this.connectionStatus = m.apiKey ? 'ok' : 'idle';
    this.connectionMsg = m.apiKey ? '✅ Conexão verificada com sucesso' : '○ Conexão não testada';
    this.showApiKey = false;
  }

  testarConexao() {
    this.connectionStatus = 'idle';
    this.connectionMsg = '⏳ Testando conexão...';
    setTimeout(() => {
      const ok = Math.random() > 0.2;
      this.connectionStatus = ok ? 'ok' : 'error';
      this.connectionMsg = ok
        ? '✅ Conexão verificada com sucesso'
        : '❌ Falha na conexão — verifique a chave de API';
    }, 1800);
  }

  novoModelo() {
    // TODO: abrir modal de novo modelo
  }
}

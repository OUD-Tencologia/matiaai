import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Importe o serviço e os modelos que criamos
import { ChatService } from '../../../../core/services/chat-service';
import { ChatSource, ChatResponse } from '../../../../shared/models/chat.models';

interface ConsultaItem {
  id: number;
  titulo: string;
}

// Atualizamos a interface para receber as fontes (leis) da Matia
interface Mensagem {
  id: number;
  tipo: 'user' | 'ai';
  texto: string;
  sources?: ChatSource[];
}

@Component({
  selector: 'app-chat',
  imports: [FormsModule, ButtonModule, InputTextModule,
    SkeletonModule, TooltipModule, ProgressSpinnerModule],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class Chat implements OnInit {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  // Injeção do serviço real
  private chatService = inject(ChatService);

  loading = true;
  chatIniciado = false;
  enviando = false;
  pergunta = '';
  mensagens: Mensagem[] = [];

  recentes: ConsultaItem[] = [];
  frequentes: ConsultaItem[] = [];
  recomendados: ConsultaItem[] = [];

  // Variáveis para o microfone
  isRecording = false;
  private recognition: any;

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    this.loading = true;
    // Isso aqui podemos manter como mock por enquanto, 
    // até termos a rota de histórico real no backend
    setTimeout(() => {
      this.recentes = [
        { id: 1, titulo: 'Lei 14.129/2021 - Governo Digital' },
        { id: 2, titulo: 'Recurso Especial - Direito Tributário' },
        { id: 3, titulo: 'Petição Inicial - Ação de Cobrança' },
      ];
      this.frequentes = [
        { id: 1, titulo: 'Consulta Lei Geral de Proteção de Dados' },
        { id: 2, titulo: 'Modelos de contratos comerciais' },
        { id: 3, titulo: 'Jurisprudência STF e STJ' },
      ];
      this.recomendados = [
        { id: 1, titulo: 'Nova Lei 14.230/2021 - Improbidade' },
        { id: 2, titulo: 'Marco Legal das Startups' },
        { id: 3, titulo: 'Reforma do CPC - Atualizações' },
      ];
      this.loading = false;
    }, 800);
  }

  iniciarConsulta(titulo: string) {
    this.pergunta = titulo;
    this.enviarPergunta();
  }

  novaConversa() {
    this.chatIniciado = false;
    this.mensagens = [];
    this.pergunta = '';
  }

  enviarPergunta() {
    if (!this.pergunta.trim() || this.enviando) return;

    const texto = this.pergunta.trim();
    this.chatIniciado = true;
    this.enviando = true; // Trava o input e mostra o spinner

    // 1. Adiciona a pergunta do usuário na tela
    this.mensagens.push({ id: Date.now(), tipo: 'user', texto });
    this.pergunta = '';
    this.scrollParaBaixo();

    // 2. Chama a API real da Matia pelo serviço
    this.chatService.ask(texto).subscribe({
      next: (response: ChatResponse) => {
        // 3. Adiciona a resposta da IA junto com as fontes
        this.mensagens.push({
          id: Date.now(),
          tipo: 'ai',
          texto: response.answer,
          sources: response.sources
        });
        this.enviando = false;
        this.scrollParaBaixo();
      },
      error: (err) => {
        console.error('Erro ao consultar a API Matia:', err);
        // Tratamento de erro elegante para o usuário não ficar travado
        this.mensagens.push({
          id: Date.now(),
          tipo: 'ai',
          texto: 'Desculpe, ocorreu um erro ao consultar a base jurídica. Por favor, tente novamente.'
        });
        this.enviando = false;
        this.scrollParaBaixo();
      }
    });
  }

  private scrollParaBaixo() {
    setTimeout(() => {
      if (this.messagesContainer) {
        const el = this.messagesContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
  }

// Máquina de reconhecimento de voz
toggleGravacao() {
 if (this.isRecording) {
    this.recognition?.stop();
    return;
  }

  // Tenta pegar a API padrão OU a versão do Chrome/Edge/Safari
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    alert('Seu navegador não suporta reconhecimento de voz. Tente usar o Google Chrome ou Edge.');
    return;
  }

  this.recognition = new SpeechRecognition();
  this.recognition.lang = 'pt-BR'; // Português
  this.recognition.interimResults = false; // Pega só a frase final concluída
  this.recognition.maxAlternatives = 1;

  this.recognition.onstart = () => {
    this.isRecording = true;
  };

  this.recognition.onresult = (event: any) => {
    const transcricao = event.results[0][0].transcript;
    // Adiciona o que foi falado no input, com um espaço se já houver texto
    this.pergunta += (this.pergunta.length > 0 ? ' ' : '') + transcricao;
  };

  this.recognition.onerror = (event: any) => {
    console.error('Erro no microfone:', event.error);
    this.isRecording = false;
  };

  this.recognition.onend = () => {
    this.isRecording = false;
  };

  this.recognition.start();
}
}
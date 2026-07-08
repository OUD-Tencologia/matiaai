import { Component, OnInit, ViewChild, ElementRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BadgeModule } from 'primeng/badge';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ChatService } from '../../../../core/services/chat-service';
import { DocumentService } from '../../../../core/services/document-service';
import { ConversationService } from '../../../../core/services/conversation-service';
import { AudioRecordingService } from '../../../../core/services/audio-recording-service';
import { MarkdownPipe } from '../../../../shared/pipes/markdown-pipe';

import { ChatMessage, ChatResponse } from '../../../../shared/models/chat.models';
import { DocumentAttachment } from '../../../../shared/models/document.models';
import { Conversation } from '../../../../shared/models/conversation.models';

interface ConsultaItem {
  id: number;
  titulo: string;
  conversationId?: string;
}

const SAUDACOES = ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'hey', 'hello', 'hi', 'tudo bem', 'tudo bom'];

const RESPOSTAS_PADRAO: Record<string, string> = {
  'bom dia': 'Bom dia! 😊 Sou a **MATIA**, sua assessora jurídica virtual especializada em legislação do Mato Grosso. Como posso ajudar você hoje?',
  'boa tarde': 'Boa tarde! 😊 Sou a **MATIA**, sua assessora jurídica virtual. Estou aqui para ajudar com suas dúvidas jurídicas. O que precisa?',
  'boa noite': 'Boa noite! 😊 Sou a **MATIA**, sua assessora jurídica virtual. Mesmo à noite, estou aqui para ajudar. O que precisa?',
  'default': 'Olá! 😊 Sou a **MATIA**, sua assessora jurídica virtual especializada em legislação do Mato Grosso e normas federais. Estou aqui para ajudar com:\n\n- Consultas sobre leis estaduais e federais\n- Esclarecimentos sobre normas vigentes\n- Interpretação de dispositivos legais\n- Pesquisa por área jurídica ou tema específico\n\n**Como posso ajudar você hoje?**',
};

const MENSAGENS_ESPERA = [
  'Consultando a base jurídica...',
  'Analisando a legislação...',
  'Buscando normas relevantes...',
  'Processando sua pergunta...',
  'Verificando a legislação vigente...',
];

@Component({
  selector: 'app-chat',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SkeletonModule,
    TooltipModule,
    ProgressSpinnerModule,
    BadgeModule,
    ToastModule,
    MarkdownPipe,
  ],
  providers: [MessageService],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class Chat implements OnInit {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private chatService = inject(ChatService);
  private documentService = inject(DocumentService);
  private conversationService = inject(ConversationService);
  private messageService = inject(MessageService);
  public audioService = inject(AudioRecordingService);

  loading = true;
  chatIniciado = false;
  enviando = false;
  pergunta = '';
  mensagens: ChatMessage[] = [];
  mensagemEspera = signal<string>(MENSAGENS_ESPERA[0]);
  private intervaloEspera: any;

  currentConversationId = signal<string | null>(null);
  sidebarAberta = signal<boolean>(false);
  conversas: Conversation[] = [];
  carregandoConversas = false;
  documentosAnexados = signal<DocumentAttachment[]>([]);
  uploadEmAndamento = signal<boolean>(false);
  isDragOver = signal<boolean>(false);

  recentes: ConsultaItem[] = [];

  ngOnInit() {
    this.carregarDados();

    // Previne o browser de abrir arquivos arrastados
  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop', (e) => e.preventDefault());
  }

  carregarDados() {
    this.loading = true;
    this.conversationService.listMyConversations(1, 5).subscribe({
      next: (res) => {
        const lista = res.data?.data || [];
        this.conversas = lista;
        this.recentes = lista.map((c: Conversation, i: number) => ({
          id: i + 1,
          titulo: c.title,
          conversationId: c.id,
        }));
        this.loading = false;
      },
      error: () => {
        this.recentes = [];
        this.loading = false;
      }
    });
  }

  toggleSidebar() {
    this.sidebarAberta.update(v => !v);
    if (this.sidebarAberta() && this.conversas.length === 0) {
      this.carregarConversas();
    }
  }

  carregarConversas() {
    this.carregandoConversas = true;
    this.conversationService.listMyConversations().subscribe({
      next: (res) => {
        this.conversas = res.data?.data || [];
        this.carregandoConversas = false;
      },
      error: () => {
        this.carregandoConversas = false;
      }
    });
  }

  abrirConversa(conversa: Conversation) {
    this.carregandoConversas = true;
    this.conversationService.getMessages(conversa.id).subscribe({
      next: (res) => {
        this.chatIniciado = true;
        this.currentConversationId.set(conversa.id);
        this.documentosAnexados.set([]);
        const mensagens = res.data?.messages || [];
        this.mensagens = mensagens.map((m: any) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
          createdAt: new Date(m.created_at),
        }));
        this.carregandoConversas = false;
        this.sidebarAberta.set(false);
        this.scrollParaBaixo();
      },
      error: () => {
        this.carregandoConversas = false;
      }
    });
  }

  iniciarConsulta(item: ConsultaItem) {
    if (item.conversationId) {
      const conversa = this.conversas.find(c => c.id === item.conversationId);
      if (conversa) {
        this.abrirConversa(conversa);
        return;
      }
    }
    this.pergunta = item.titulo;
    this.enviarPergunta();
  }

  novaConversa() {
    this.chatIniciado = false;
    this.mensagens = [];
    this.pergunta = '';
    this.currentConversationId.set(null);
    this.documentosAnexados.set([]);
  }

  // ── DRAG AND DROP ──────────────────────────────────
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = event.dataTransfer?.files;
    if (!files?.length) return;

    const file = files[0];
    this.processarArquivo(file);
  }

  abrirSeletorArquivo() {
    this.fileInput.nativeElement.click();
  }

  onArquivoSelecionado(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    input.value = '';
    this.processarArquivo(file);
  }

  private processarArquivo(file: File) {
    const tiposPermitidos = ['application/pdf', 'text/plain', 'image/png', 'image/jpeg'];
    const tamanhoMaximo = 20 * 1024 * 1024; // 20MB

    if (!tiposPermitidos.includes(file.type)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Formato inválido',
        detail: 'Apenas arquivos PDF, TXT, PNG e JPG são suportados.',
        life: 4000,
      });
      return;
    }

    if (file.size > tamanhoMaximo) {
      this.messageService.add({
        severity: 'error',
        summary: 'Arquivo muito grande',
        detail: 'O arquivo deve ter no máximo 20MB.',
        life: 4000,
      });
      return;
    }

    const attachment: DocumentAttachment = {
      document_id: '',
      rag_document_id: '',
      filename: file.name,
      status: 'enviando',
    };

    this.documentosAnexados.update(docs => [...docs, attachment]);
    this.uploadEmAndamento.set(true);

    const conversationId = this.currentConversationId() || undefined;

    this.documentService.upload(file, conversationId).subscribe({
      next: (res) => {
        const data = (res as any).data || res;
        this.documentosAnexados.update(docs =>
          docs.map(d =>
            d.filename === file.name && d.status === 'enviando'
              ? {
                  document_id: data.document_id,
                  rag_document_id: data.rag_document_id,
                  filename: data.filename,
                  status: 'completo' as const,
                }
              : d
          )
        );

        if (!this.currentConversationId()) {
          this.currentConversationId.set(data.conversation_id);
        }

        this.uploadEmAndamento.set(false);
        this.chatIniciado = true;

        this.messageService.add({
          severity: 'success',
          summary: 'Documento enviado',
          detail: `"${file.name}" foi indexado com sucesso!`,
          life: 3000,
        });
      },
      error: () => {
        this.documentosAnexados.update(docs =>
          docs.map(d =>
            d.filename === file.name && d.status === 'enviando'
              ? { ...d, status: 'erro' as const }
              : d
          )
        );
        this.uploadEmAndamento.set(false);

        this.messageService.add({
          severity: 'error',
          summary: 'Erro no upload',
          detail: `Não foi possível enviar "${file.name}". Tente novamente.`,
          life: 5000,
        });
      }
    });
  }

  removerDocumento(doc: DocumentAttachment) {
    this.documentosAnexados.update(docs => docs.filter(d => d.document_id !== doc.document_id));
  }

  get temDocumentosCompletos(): boolean {
    return this.documentosAnexados().some(d => d.status === 'completo');
  }

  // ── RESPOSTAS PADRÃO ───────────────────────────────
  private ehSaudacao(texto: string): boolean {
    const normalizado = texto.toLowerCase().trim();
    return SAUDACOES.some(s => normalizado === s || normalizado.startsWith(s + ' ') || normalizado.startsWith(s + '!'));
  }

  private obterRespostaPadrao(texto: string): string {
    const normalizado = texto.toLowerCase().trim();
    for (const [chave, resposta] of Object.entries(RESPOSTAS_PADRAO)) {
      if (normalizado.includes(chave)) return resposta;
    }
    return RESPOSTAS_PADRAO['default'];
  }

  // ── MENSAGENS DE ESPERA ROTATIVAS ──────────────────
  private iniciarMensagensEspera() {
    let i = 0;
    this.mensagemEspera.set(MENSAGENS_ESPERA[0]);
    this.intervaloEspera = setInterval(() => {
      i = (i + 1) % MENSAGENS_ESPERA.length;
      this.mensagemEspera.set(MENSAGENS_ESPERA[i]);
    }, 2000);
  }

  private pararMensagensEspera() {
    if (this.intervaloEspera) {
      clearInterval(this.intervaloEspera);
      this.intervaloEspera = null;
    }
  }

  // ── ENVIAR PERGUNTA ────────────────────────────────
  enviarPergunta() {
    if (!this.pergunta.trim() || this.enviando || this.uploadEmAndamento()) return;

    const texto = this.pergunta.trim();
    this.chatIniciado = true;
    this.enviando = true;

    this.mensagens.push({ role: 'user', content: texto, createdAt: new Date() });
    this.pergunta = '';
    this.scrollParaBaixo();

    // Verifica se é saudação
    if (this.ehSaudacao(texto) && !this.temDocumentosCompletos) {
      setTimeout(() => {
        this.mensagens.push({
          role: 'assistant',
          content: this.obterRespostaPadrao(texto),
          createdAt: new Date()
        });
        this.enviando = false;
        this.scrollParaBaixo();
      }, 600);
      return;
    }

    this.iniciarMensagensEspera();

    if (this.temDocumentosCompletos && this.currentConversationId()) {
      this.documentService.ask(texto, this.currentConversationId()!).subscribe({
        next: (res) => {
          const data = (res as any).data || res;
          if (data.conversation_id) this.currentConversationId.set(data.conversation_id);
          this.mensagens.push({ role: 'assistant', content: data.answer, createdAt: new Date() });
          this.pararMensagensEspera();
          this.enviando = false;
          this.scrollParaBaixo();
        },
        error: () => {
          this.mensagens.push({
            role: 'assistant',
            content: 'Desculpe, tive um problema ao consultar o documento. Pode tentar novamente?',
            createdAt: new Date()
          });
          this.pararMensagensEspera();
          this.enviando = false;
          this.scrollParaBaixo();
          this.messageService.add({
            severity: 'error',
            summary: 'Erro na consulta',
            detail: 'Não foi possível processar sua pergunta sobre o documento.',
            life: 4000,
          });
        }
      });
    } else {
      this.chatService.ask(texto, this.currentConversationId() || undefined).subscribe({
        next: (response: ChatResponse) => {
          if (response.conversation_id) this.currentConversationId.set(response.conversation_id);
          this.mensagens.push({
            role: 'assistant',
            content: response.answer,
            sources: response.sources,
            interaction_id: response.interaction_id,
            createdAt: new Date()
          });
          this.pararMensagensEspera();
          this.enviando = false;
          this.scrollParaBaixo();
        },
        error: () => {
          this.mensagens.push({
            role: 'assistant',
            content: 'Desculpe, tive um problema técnico ao acessar a base jurídica. Pode repetir?',
            createdAt: new Date()
          });
          this.pararMensagensEspera();
          this.enviando = false;
          this.scrollParaBaixo();
          this.messageService.add({
            severity: 'error',
            summary: 'Erro na consulta',
            detail: 'Não foi possível acessar a base jurídica. Tente novamente.',
            life: 4000,
          });
        }
      });
    }
  }

  async toggleRecording() {
    if (this.audioService.isRecording()) {
      const audioBlob = await this.audioService.stopRecording();
      this.enviarAudio(audioBlob);
    } else {
      await this.audioService.startRecording();
    }
  }

  enviarAudio(blob: Blob) {
    this.enviando = true;
    this.chatIniciado = true;

    const formData = new FormData();
    formData.append('file', blob, 'audio-juridico.webm');
    if (this.currentConversationId()) {
      formData.append('conversations_id', this.currentConversationId()!);
    }

    this.chatService.sendAudio(formData).subscribe({
      next: (res) => {
        if (res.transcription) this.mensagens.push({ role: 'user', content: res.transcription });
        this.mensagens.push({ role: 'assistant', content: res.answer, sources: res.sources });
        this.enviando = false;
        this.scrollParaBaixo();
      },
      error: () => { this.enviando = false; }
    });
  }

  private scrollParaBaixo() {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 50);
  }

  formatarData(data: string): string {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  }
}
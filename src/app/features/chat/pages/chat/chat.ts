import { Component, OnInit, ViewChild, ElementRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { BadgeModule } from 'primeng/badge';

import { ChatService } from '../../../../core/services/chat-service';
import { DocumentService } from '../../../../core/services/document-service';
import { ConversationService } from '../../../../core/services/conversation-service';
import { AudioRecordingService } from '../../../../core/services/audio-recording-service';

import { ChatMessage, ChatResponse } from '../../../../shared/models/chat.models';
import { DocumentAttachment } from '../../../../shared/models/document.models';
import { Conversation } from '../../../../shared/models/conversation.models';

interface ConsultaItem {
  id: number;
  titulo: string;
  conversationId?: string;
}

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
  ],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class Chat implements OnInit {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private chatService = inject(ChatService);
  private documentService = inject(DocumentService);
  private conversationService = inject(ConversationService);
  public audioService = inject(AudioRecordingService);

  loading = true;
  chatIniciado = false;
  enviando = false;
  pergunta = '';
  mensagens: ChatMessage[] = [];

  currentConversationId = signal<string | null>(null);
  sidebarAberta = signal<boolean>(false);
  conversas: Conversation[] = [];
  carregandoConversas = false;
  documentosAnexados = signal<DocumentAttachment[]>([]);
  uploadEmAndamento = signal<boolean>(false);

  recentes: ConsultaItem[] = [];

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    this.loading = true;
    this.conversationService.listMyConversations(1, 5).subscribe({
      next: (res) => {
        // res.data contém { data: Conversation[], total, page, limit, totalPages }
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

        // res.data contém { conversation, messages, total, page... }
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

  abrirSeletorArquivo() {
    this.fileInput.nativeElement.click();
  }

  onArquivoSelecionado(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    input.value = '';

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
        // res.data contém o UploadDocumentResponse
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
      }
    });
  }

  removerDocumento(doc: DocumentAttachment) {
    this.documentosAnexados.update(docs => docs.filter(d => d.document_id !== doc.document_id));
  }

  get temDocumentosCompletos(): boolean {
    return this.documentosAnexados().some(d => d.status === 'completo');
  }

  enviarPergunta() {
    if (!this.pergunta.trim() || this.enviando || this.uploadEmAndamento()) return;

    const texto = this.pergunta.trim();
    this.chatIniciado = true;
    this.enviando = true;

    this.mensagens.push({ role: 'user', content: texto, createdAt: new Date() });
    this.pergunta = '';
    this.scrollParaBaixo();

    if (this.temDocumentosCompletos && this.currentConversationId()) {
      this.documentService.ask(texto, this.currentConversationId()!).subscribe({
        next: (res) => {
          const data = (res as any).data || res;
          if (data.conversation_id) this.currentConversationId.set(data.conversation_id);
          this.mensagens.push({ role: 'assistant', content: data.answer, createdAt: new Date() });
          this.enviando = false;
          this.scrollParaBaixo();
        },
        error: () => {
          this.mensagens.push({ role: 'assistant', content: 'Desculpe, tive um problema ao consultar o documento. Pode tentar novamente?', createdAt: new Date() });
          this.enviando = false;
          this.scrollParaBaixo();
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
          this.enviando = false;
          this.scrollParaBaixo();
        },
        error: () => {
          this.mensagens.push({ role: 'assistant', content: 'Desculpe, tive um problema técnico ao acessar a base jurídica. Pode repetir?', createdAt: new Date() });
          this.enviando = false;
          this.scrollParaBaixo();
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
import { Component, OnInit, ViewChild, ElementRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CommonModule } from '@angular/common';

import { ChatService } from '../../../../core/services/chat-service';
import { ChatMessage, ChatResponse } from '../../../../shared/models/chat.models';
import { AudioRecordingService } from '../../../../core/services/audio-recording-service';

interface ConsultaItem {
  id: number;
  titulo: string;
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
    ProgressSpinnerModule
  ],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class Chat implements OnInit {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  // Injetamos as dependências 
  private chatService = inject(ChatService);
  public audioService = inject(AudioRecordingService);

  loading = true;
  chatIniciado = false;
  enviando = false;
  pergunta = '';
  
  // Usamos agora o modelo oficial para as bolhas de chat
  mensagens: ChatMessage[] = [];

  // Controle de estado com Signals
  currentConversationId = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  recentes: ConsultaItem[] = [];
  frequentes: ConsultaItem[] = [];
  recomendados: ConsultaItem[] = [];

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    this.loading = true;
    setTimeout(() => {
      this.recentes = [
        { id: 1, titulo: 'Lei 14.129/2021 - Governo Digital' },
        { id: 2, titulo: 'Recurso Especial - Direito Tributário' },
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
    this.currentConversationId.set(null); // Limpa o ID para começar uma do zero no banco
  }

  enviarPergunta() {
    if (!this.pergunta.trim() || this.enviando) return;

    const texto = this.pergunta.trim();
    this.chatIniciado = true;
    this.enviando = true;

    // 1. Adiciona a bolha do usuário
    this.mensagens.push({ 
      role: 'user', 
      content: texto, 
      createdAt: new Date() 
    });
    
    this.pergunta = '';
    this.scrollParaBaixo();

    // 2. Chama a API enviando o ID da conversa atual (se houver)
    this.chatService.ask(texto, this.currentConversationId() || undefined).subscribe({
      next: (response: ChatResponse) => {
        
        // 3. Guarda o ID da conversa para as próximas perguntas
        if (response.conversation_id) {
          this.currentConversationId.set(response.conversation_id);
        }

        // 4. Adiciona a bolha da Matia com as fontes
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
      error: (err) => {
        console.error('Erro na Matia:', err);
        this.mensagens.push({
          role: 'assistant',
          content: 'Desculpe, Francisco. Tive um problema técnico ao acessar a base jurídica. Pode repetir?',
          createdAt: new Date()
        });
        this.enviando = false;
        this.scrollParaBaixo();
      }
    });
  }

  private scrollParaBaixo() {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 50);
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
        // Se o áudio transcreveu e respondeu, adicionamos as duas bolhas
        if(res.transcription) {
          this.mensagens.push({ role: 'user', content: res.transcription });
        }
        this.mensagens.push({ 
          role: 'assistant', 
          content: res.answer,
          sources: res.sources 
        });
        this.enviando = false;
        this.scrollParaBaixo();
      },
      error: () => this.enviando = false
    });
  }
}
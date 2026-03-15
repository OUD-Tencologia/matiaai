import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

interface ConsultaItem {
  id: number;
  titulo: string;
}

interface Mensagem {
  id: number;
  tipo: 'user' | 'ai';
  texto: string;
}

@Component({
  selector: 'app-chat',
  imports: [FormsModule, ButtonModule, InputTextModule, TooltipModule, ProgressSpinnerModule],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
})
export class Chat implements OnInit {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  loading = true;
  chatIniciado = false;
  enviando = false;
  pergunta = '';
  mensagens: Mensagem[] = [];

  recentes: ConsultaItem[] = [];
  frequentes: ConsultaItem[] = [];
  recomendados: ConsultaItem[] = [];

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    this.loading = true;
    // TODO: substituir pelo serviço real
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
    this.enviando = true;

    this.mensagens.push({ id: Date.now(), tipo: 'user', texto });
    this.pergunta = '';
    this.scrollParaBaixo();

    // TODO: substituir pela chamada real à API de IA
    setTimeout(() => {
      this.mensagens.push({
        id: Date.now(),
        tipo: 'ai',
        texto: `Analisando sua consulta sobre "${texto}"... Em breve integraremos com a API.`
      });
      this.enviando = false;
      this.scrollParaBaixo();
    }, 1000);
  }

  private scrollParaBaixo() {
    setTimeout(() => {
      if (this.messagesContainer) {
        const el = this.messagesContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 50);
  }
}
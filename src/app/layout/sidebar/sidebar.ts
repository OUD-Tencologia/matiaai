import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';

interface ConsultaRecente {
  id: number;
  titulo: string;
  tempo: string;
  favorito: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule, InputTextModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {

  recentes: ConsultaRecente[] = [
    { id: 1, titulo: 'Lei 14.129/2021 - Governo Digital', tempo: '2h atrás', favorito: false },
    { id: 2, titulo: 'Recurso Especial - Direito Tributário', tempo: '1 dia atrás', favorito: true },
    { id: 3, titulo: 'Petição Inicial - Ação de Cobrança', tempo: '2 dias atrás', favorito: false },
  ];

  favoritos: ConsultaRecente[] = [
    { id: 1, titulo: 'Recurso Especial - Direito Tributário', tempo: '1 dia atrás', favorito: true },
    { id: 2, titulo: 'Parecer Jurídico - Licitação', tempo: '3 dias atrás', favorito: true },
  ];
}

import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface Resultado {
  id: number;
  titulo: string;
  numero: string;
  area: string;
  areaNome: string;
  status: string;
  data: string;
  orgao: string;
  resumo: string;
  link: string;
  expandido: boolean;
}

interface Historico {
  id: number;
  titulo: string;
  termo: string;
  tempo: string;
}

interface Fonte {
  nome: string;
  url: string;
  cor: string;
}

@Component({
  selector: 'app-consulta-juridica',
  imports: [FormsModule, ButtonModule, InputTextModule],
  templateUrl: './consulta-juridica.html',
  styleUrl: './consulta-juridica.scss',
})
export class ConsultaJuridica {

  constructor(private sanitizer: DomSanitizer) {}

  searchTerm = '';
  termoBuscado = '';
  filtroAtivo = 'todas';
  loading = false;
  buscaRealizada = false;
  resultados: Resultado[] = [];

  filtros = [
    { label: 'Todas',          value: 'todas'         },
    { label: 'Tributário',     value: 'tributario'    },
    { label: 'Trabalhista',    value: 'trabalhista'   },
    { label: 'Civil',          value: 'civil'         },
    { label: 'Administrativo', value: 'administrativo'},
    { label: 'Penal',          value: 'penal'         },
  ];

  historico: Historico[] = [
    { id: 1, titulo: 'Lei 14.129/2021 — Governo Digital',     termo: 'Lei 14.129/2021',     tempo: 'Hoje, 14h22'    },
    { id: 2, titulo: 'LGPD — Proteção de Dados',              termo: 'LGPD proteção dados', tempo: 'Hoje, 11h05'    },
    { id: 3, titulo: 'Lei 14.133/2021 — Licitações',          termo: 'Lei 14.133 licitação', tempo: 'Ontem, 16h48'  },
    { id: 4, titulo: 'Lei 14.230/2021 — Improbidade',         termo: 'improbidade 14230',   tempo: 'Ontem, 09h30'   },
    { id: 5, titulo: 'Código Tributário MT',                   termo: 'código tributário MT', tempo: '22/06, 15h12'  },
  ];

  fontes: Fonte[] = [
    { nome: 'Legislação Federal',        url: 'https://legislacao.presidencia.gov.br', cor: '#c9a227' },
    { nome: 'SEFAZ/MT — Legislação',     url: 'https://www.sefaz.mt.gov.br',          cor: '#10b981' },
    { nome: 'Leis Estaduais MT',         url: 'https://www.leisestaduais.com.br/mt',  cor: '#3b82f6' },
    { nome: 'STJ — Jurisprudência',      url: 'https://www.stj.jus.br',               cor: '#8b5cf6' },
    { nome: 'STF — Jurisprudência',      url: 'https://portal.stf.jus.br',            cor: '#f87171' },
  ];

  private mockResultados: Resultado[] = [
    {
      id: 1, titulo: 'Lei Nº 14.129, de 29 de março de 2021',
      numero: 'Lei 14.129/2021', area: 'administrativo', areaNome: 'Administrativo',
      status: 'vigente', data: '29/03/2021', orgao: 'Presidência da República',
      resumo: 'Dispõe sobre princípios, regras e instrumentos para o Governo Digital e para o aumento da eficiência pública, e dá outras providências. Estabelece diretrizes para a transformação digital dos serviços públicos, incluindo a prestação de serviços por meios digitais, a abertura de dados governamentais e a participação social por meio digital.',
      link: 'https://legislacao.presidencia.gov.br', expandido: false
    },
    {
      id: 2, titulo: 'Lei Geral de Proteção de Dados Pessoais — LGPD',
      numero: 'Lei 13.709/2018', area: 'tributario', areaNome: 'Tributário',
      status: 'vigente', data: '14/08/2018', orgao: 'Presidência da República',
      resumo: 'Dispõe sobre o tratamento de dados pessoais, inclusive nos meios digitais, por pessoa natural ou por pessoa jurídica de direito público ou privado, com o objetivo de proteger os direitos fundamentais de liberdade e de privacidade e o livre desenvolvimento da personalidade da pessoa natural.',
      link: 'https://legislacao.presidencia.gov.br', expandido: false
    },
    {
      id: 3, titulo: 'Lei de Licitações e Contratos Administrativos',
      numero: 'Lei 14.133/2021', area: 'administrativo', areaNome: 'Administrativo',
      status: 'vigente', data: '01/04/2021', orgao: 'Presidência da República',
      resumo: 'Estabelece normas gerais de licitação e contratação para as Administrações Públicas diretas, autárquicas e fundacionais da União, dos Estados, do Distrito Federal e dos Municípios. Revoga as Leis nº 8.666/1993, nº 10.520/2002 e artigos da Lei nº 12.462/2011.',
      link: 'https://legislacao.presidencia.gov.br', expandido: false
    },
    {
      id: 4, titulo: 'Lei de Improbidade Administrativa',
      numero: 'Lei 14.230/2021', area: 'administrativo', areaNome: 'Administrativo',
      status: 'vigente', data: '25/10/2021', orgao: 'Presidência da República',
      resumo: 'Altera a Lei nº 8.429, de 2 de junho de 1992, que dispõe sobre improbidade administrativa. Traz mudanças significativas no regime de responsabilização por atos de improbidade, incluindo a necessidade de dolo específico para configuração do ato ímprobo.',
      link: 'https://legislacao.presidencia.gov.br', expandido: false
    },
    {
      id: 5, titulo: 'Código Tributário do Estado de Mato Grosso',
      numero: 'Lei 7.098/1998 — MT', area: 'tributario', areaNome: 'Tributário',
      status: 'vigente', data: '30/12/1998', orgao: 'Assembleia Legislativa de MT',
      resumo: 'Consolida as normas referentes ao Sistema Tributário Estadual. Regulamenta o ICMS, IPVA, ITCD e demais tributos estaduais, bem como os procedimentos fiscais e administrativos aplicáveis no âmbito do Estado de Mato Grosso.',
      link: 'https://www.sefaz.mt.gov.br', expandido: false
    },
  ];

  buscar() {
    if (!this.searchTerm.trim()) return;
    this.loading = true;
    this.buscaRealizada = false;
    this.termoBuscado = this.searchTerm;

    // TODO: substituir pela chamada real à API
    setTimeout(() => {
      let res = [...this.mockResultados];
      if (this.filtroAtivo !== 'todas') {
        res = res.filter(r => r.area === this.filtroAtivo);
      }
      this.resultados = res.map(r => ({ ...r, expandido: false }));
      this.loading = false;
      this.buscaRealizada = true;
    }, 1200);
  }

  limparBusca() {
    this.searchTerm = '';
    this.termoBuscado = '';
    this.buscaRealizada = false;
    this.resultados = [];
  }

  preencherBusca(termo: string) {
    this.searchTerm = termo;
    this.buscar();
  }

  destacar(texto: string): SafeHtml {
    if (!this.termoBuscado) return texto;
    const regex = new RegExp(`(${this.termoBuscado.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const highlighted = texto.replace(regex, '<mark>$1</mark>');
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  }
}

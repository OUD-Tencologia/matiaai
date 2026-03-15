import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

interface Permissao {
  label: string;
  ativo: boolean;
}

interface AreaJuridica {
  nome: string;
  cor: string;
  ativo: boolean;
  permissoes: Permissao[];
}

interface Atividade {
  id: number;
  tipo: string;
  icone: string;
  titulo: string;
  detalhe: string;
  tempo: string;
}

@Component({
  selector: 'app-perfil',
  imports: [ButtonModule, InputTextModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil {

  // Senha
  showAtual = false;
  showNova = false;
  showConfirm = false;
  forca = 0;
  forcaLabel = '—';
  forcaClasse = '';
  forcaCor = '';

  // Toast
  toastVisible = false;
  toastMsg = '';

  // RBAC
  areas: AreaJuridica[] = [
    {
      nome: 'Tributário', cor: '#c9a227', ativo: true,
      permissoes: [
        { label: 'Consultar leis', ativo: true },
        { label: 'Chat com IA', ativo: true },
        { label: 'Exportar PDF', ativo: true },
        { label: 'Editar dados', ativo: false },
      ]
    },
    {
      nome: 'Trabalhista', cor: '#10b981', ativo: true,
      permissoes: [
        { label: 'Consultar leis', ativo: true },
        { label: 'Chat com IA', ativo: true },
        { label: 'Exportar PDF', ativo: false },
        { label: 'Editar dados', ativo: false },
      ]
    },
    {
      nome: 'Civil', cor: '#8b5cf6', ativo: true,
      permissoes: [
        { label: 'Consultar leis', ativo: true },
        { label: 'Chat com IA', ativo: false },
        { label: 'Exportar PDF', ativo: false },
        { label: 'Editar dados', ativo: false },
      ]
    },
    {
      nome: 'Administrativo', cor: '#3b82f6', ativo: true,
      permissoes: [
        { label: 'Consultar leis', ativo: true },
        { label: 'Chat com IA', ativo: true },
        { label: 'Exportar PDF', ativo: true },
        { label: 'Editar dados', ativo: true },
      ]
    },
    {
      nome: 'Penal', cor: '#f87171', ativo: false,
      permissoes: [
        { label: 'Consultar leis', ativo: false },
        { label: 'Chat com IA', ativo: false },
        { label: 'Exportar PDF', ativo: false },
        { label: 'Editar dados', ativo: false },
      ]
    },
  ];

  // Histórico
  atividades: Atividade[] = [
    { id: 1, tipo: 'consulta', icone: '⚖️', titulo: 'Consulta realizada', detalhe: 'Lei 14.129/2021 — Governo Digital', tempo: 'Hoje, 14h22' },
    { id: 2, tipo: 'login', icone: '✅', titulo: 'Login efetuado', detalhe: 'IP: 187.XX.XX.12 — Cuiabá, MT', tempo: 'Hoje, 08h05' },
    { id: 3, tipo: 'download', icone: '📄', titulo: 'PDF baixado', detalhe: 'LGPD — Lei 13.709/2018', tempo: 'Ontem, 16h48' },
    { id: 4, tipo: 'consulta', icone: '⚖️', titulo: 'Consulta realizada', detalhe: 'Lei 14.133/2021 — Licitações', tempo: 'Ontem, 14h30' },
    { id: 5, tipo: 'config', icone: '⚙️', titulo: 'Configuração alterada', detalhe: 'Modelo padrão alterado para GPT-4o', tempo: '22/06, 10h15' },
    { id: 6, tipo: 'senha', icone: '🔒', titulo: 'Senha alterada', detalhe: 'Senha atualizada com sucesso', tempo: '20/06, 09h00' },
  ];

  checarForca(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    if (!val) { this.forca = 0; this.forcaLabel = '—'; this.forcaCor = ''; return; }
    const forte = val.length >= 8 && /[A-Z]/.test(val) && /[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val);
    const medio = val.length >= 6 && (/[A-Z]/.test(val) || /[0-9]/.test(val));
    if (forte) {
      this.forca = 3; this.forcaLabel = 'Forte';
      this.forcaClasse = 'strong'; this.forcaCor = '#10b981';
    } else if (medio) {
      this.forca = 2; this.forcaLabel = 'Médio';
      this.forcaClasse = 'medium'; this.forcaCor = '#c9a227';
    } else {
      this.forca = 1; this.forcaLabel = 'Fraco';
      this.forcaClasse = 'weak'; this.forcaCor = '#f87171';
    }
  }

  salvar(msg: string) {
    this.toastMsg = msg;
    this.toastVisible = true;
    setTimeout(() => this.toastVisible = false, 3000);
  }
}

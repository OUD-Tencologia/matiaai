import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface SummaryCard {
  icon: string;
  iconClass: string;
  label: string;
  value: string;
  suffix: string;
  trend: string;
  trendClass: string;
}

interface AreaLegend {
  label: string;
  cor: string;
  pct: number;
}

interface Historico {
  id: number;
  usuario: string;
  area: string;
  badgeClass: string;
  tokens: string;
  data: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit, AfterViewInit {

  periodoAtivo = '30d';

  periodos = [
    { label: '7d', value: '7d' },
    { label: '30d', value: '30d' },
    { label: '90d', value: '90d' },
    { label: '1a', value: '1a' },
  ];

  summaryCards: SummaryCard[] = [
    { icon: '📋', iconClass: 'icon-blue', label: 'Total de Consultas', value: '1.847', suffix: '', trend: '↑ 12% vs mês anterior', trendClass: 'trend-up' },
    { icon: '⚡', iconClass: 'icon-gold', label: 'Tokens Consumidos', value: '4.2', suffix: 'M', trend: '↑ 8% vs mês anterior', trendClass: 'trend-up' },
    { icon: '💰', iconClass: 'icon-green', label: 'Custo Financeiro', value: 'R$ 318', suffix: ',40', trend: '↑ 5% vs mês anterior', trendClass: 'trend-down' },
    { icon: '👥', iconClass: 'icon-purple', label: 'Usuários Ativos', value: '43', suffix: '', trend: '→ Estável', trendClass: 'trend-neutral' },
  ];

  areaLegend: AreaLegend[] = [
    { label: 'Tributário',    cor: '#c9a227', pct: 34 },
    { label: 'Trabalhista',   cor: '#10b981', pct: 26 },
    { label: 'Civil',         cor: '#8b5cf6', pct: 20 },
    { label: 'Administrativo',cor: '#3b82f6', pct: 14 },
    { label: 'Penal',         cor: '#f87171', pct: 6  },
  ];

  historico: Historico[] = [
    { id: 1, usuario: 'Francisco N.', area: 'Tributário',    badgeClass: 'badge-tributario',     tokens: '2.340', data: 'Hoje, 14h22'    },
    { id: 2, usuario: 'Ana Paula R.', area: 'Trabalhista',   badgeClass: 'badge-trabalhista',    tokens: '1.890', data: 'Hoje, 11h05'    },
    { id: 3, usuario: 'Carlos M.',    area: 'Civil',         badgeClass: 'badge-civil',          tokens: '3.120', data: 'Ontem, 16h48'   },
    { id: 4, usuario: 'Beatriz S.',   area: 'Administrativo',badgeClass: 'badge-administrativo', tokens: '980',   data: 'Ontem, 09h30'   },
    { id: 5, usuario: 'Roberto L.',   area: 'Penal',         badgeClass: 'badge-penal',          tokens: '4.210', data: '22/06, 15h12'   },
  ];

  ngOnInit() {
    Chart.defaults.color = 'rgba(245,240,232,0.6)';
    Chart.defaults.font  = { family: 'Barlow', size: 11 } as any;
  }

  ngAfterViewInit() {
    this.initConsultasChart();
    this.initAreaChart();
    this.initTokensChart();
  }

  private initConsultasChart() {
    const labels: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
    }
    const data = labels.map(() => Math.floor(Math.random() * 80) + 20);

    new Chart('consultasChart', {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Consultas',
          data,
          borderColor: '#c9a227',
          backgroundColor: 'rgba(201,162,39,0.08)',
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: '#c9a227',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(201,162,39,0.06)' }, ticks: { maxTicksLimit: 8 } },
          y: { grid: { color: 'rgba(201,162,39,0.06)' }, beginAtZero: true }
        }
      }
    });
  }

  private initAreaChart() {
    new Chart('areaChart', {
      type: 'doughnut',
      data: {
        labels: this.areaLegend.map(a => a.label),
        datasets: [{
          data: this.areaLegend.map(a => a.pct),
          backgroundColor: this.areaLegend.map(a => a.cor + 'cc'),
          borderColor: 'rgba(15,31,61,0.8)',
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` } }
        }
      }
    });
  }

  private initTokensChart() {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    new Chart('tokensChart', {
      type: 'bar',
      data: {
        labels: meses,
        datasets: [
          {
            label: 'Tokens (K)',
            data: [320, 410, 380, 490, 560, 420],
            backgroundColor: 'rgba(201,162,39,0.6)',
            borderColor: 'rgba(201,162,39,0.9)',
            borderWidth: 1,
            borderRadius: 4,
            yAxisID: 'y'
          },
          {
            label: 'Custo (R$)',
            data: [48, 62, 57, 74, 84, 63],
            backgroundColor: 'rgba(16,185,129,0.4)',
            borderColor: 'rgba(16,185,129,0.8)',
            borderWidth: 1,
            borderRadius: 4,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true, labels: { boxWidth: 10, padding: 16 } } },
        scales: {
          x:  { grid: { color: 'rgba(201,162,39,0.06)' } },
          y:  { grid: { color: 'rgba(201,162,39,0.06)' }, beginAtZero: true, position: 'left' },
          y1: { grid: { display: false }, beginAtZero: true, position: 'right' }
        }
      }
    });
  }
}

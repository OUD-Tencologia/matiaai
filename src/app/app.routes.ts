import { Routes } from '@angular/router';

export const routes: Routes = [
  // Rota inicial → redireciona para login
  { path: '', redirectTo: 'login-two-factor', pathMatch: 'full' },

  // Login (Fase 1: Senha)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login').then(m => m.Login)
  },
  // Login 2FA (Fase 2: Código do Celular)
  {
    path: 'login-two-factor',
    loadComponent: () => import('./features/auth/pages/login-two-factor/login-two-factor').then(m => m.LoginTwoFactor)
  },

  // Sistema (com layout) - Área Protegida
  {
    path: 'matia',
    loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      // Rota padrão → chat
      { path: '', redirectTo: 'chat', pathMatch: 'full' },

      {
        path: 'chat',
        loadComponent: () => import('./features/chat/pages/chat/chat').then(m => m.Chat)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'admin',
        loadComponent: () => import('./features/admin/empresas/pages/empresas/empresas').then(m => m.EmpresasComponent)
      },
      {
        path: 'consulta-juridica',
        loadComponent: () => import('./features/consulta-juridica/pages/consulta-juridica/consulta-juridica').then(m => m.ConsultaJuridica)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./features/usuarios/pages/usuarios/usuarios').then(m => m.Usuarios)
      },
      {
        path: 'llm-config',
        loadComponent: () => import('./features/llm-config/pages/llm-config/llm-config').then(m => m.LlmConfig)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/perfil/pages/perfil/perfil').then(m => m.Perfil)
      },
    ]
  },

  // Rota inexistente → redireciona para login
  { path: '**', redirectTo: 'login' }
];
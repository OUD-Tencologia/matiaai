import { Routes } from '@angular/router';

export const routes: Routes = [
  // Rota inicial → redireciona para login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Login
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login').then(m => m.Login)
  },

  // Sistema (com layout)
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
        loadComponent: () => import('./features/admin/empresas/pages/empresas/empresas').then(m => m.Empresas)
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
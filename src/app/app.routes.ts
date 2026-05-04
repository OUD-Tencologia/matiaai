import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { adminGuard } from './core/guards/admin-guard';
import { guestGuard } from './core/guards/guest-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  // Rota inicial → redireciona para login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Login (Fase 1: Senha)
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/login/login').then(m => m.Login)
  },
  // Login 2FA (Fase 2: Código do Celular)
  {
    path: 'login-two-factor',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/login-two-factor/login-two-factor').then(m => m.LoginTwoFactor)
  },
  {
    path: 'reset-password',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/reset-password/reset-password').then(m => m.ResetPassword)
  },
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/forgot-password/forgot-password').then(m => m.ForgotPassword)
  },
  {
    path: 'first-access',
    canActivate: [authGuard],
    loadComponent: () => import('./features/auth/pages/first-access/first-access').then(m => m.FirstAccess)
  },

  // Sistema (com layout) - Área Protegida
  {
    path: 'matia',
    canActivate: [authGuard],
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
        canActivate: [roleGuard],
        data: { roles: ['SUPER-ADMIN', 'ADMIN'] },
        loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/empresas/pages/empresas/empresas').then(m => m.EmpresasComponent)
      },
      {
        path: 'consulta-juridica',
        loadComponent: () => import('./features/consulta-juridica/pages/consulta-juridica/consulta-juridica').then(m => m.ConsultaJuridica)
      },
      {
        path: 'usuarios',
        canActivate: [roleGuard],
        data: { roles: ['SUPER-ADMIN', 'ADMIN'] },
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
// 1. Tipo de Role centralizado e alinhado ao backend
export type UserRole = 'SUPER-ADMIN' | 'ADMIN' | 'USER';

export interface UserPayload {
  id: string;
  nome: string;
  email: string;
  role: UserRole; 
  empresa_id: string;
  avatar_url?: string | null;
  created_at?: string;
  primeiro_acesso: boolean;
}

// Representação exata do perfil retornado pela API (sem a senha e a secret)
export interface UserProfile {
  id: string;
  creation_time: string | Date;
  updated_at: string | Date | null;
  cpf: string;
  telefone: string;
  data_nascimento: string | Date;
  avatar_url: string | null;
  nome: string;
  email: string;
  role: UserRole; 
  empresa_id: string | null;
  area_juridica: string | null;
  status: 'ativo' | 'inativo';
  ultimo_acesso: string | Date | null;
  permissoes: any | null; 
  two_factor_enabled: boolean;
}

// O que enviamos ao salvar o formulário de "Dados Pessoais"
export interface UserProfileUpdate {
  nome: string; 
  email: string;
  telefone: string;
  area_juridica?: string; 
}

// O que enviamos ao salvar o formulário de "Alterar Senha"
export interface PasswordChangeRequest {
  senha_atual: string;
  nova_senha: string;
}

// Histórico para preencher a timeline
export interface ActivityHistory {
  id: string;
  tipo: string;
  icone: string;
  titulo: string;
  detalhe: string;
  tempo: string;
}
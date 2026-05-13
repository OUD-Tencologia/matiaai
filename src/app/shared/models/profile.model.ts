// As opções que o seu backend aceita
export type ProfileRole = 'ADMIN' | 'USER' | 'SUPER-ADMIN';
export type ProfileStatus = 'ativo' | 'inativo';

// O modelo que o backend DEVOLVE quando buscamos a lista (GET)
export interface ProfileData {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  data_nascimento: string;
  role: ProfileRole;
  area_juridica?: string;
  status: ProfileStatus;
  avatar_url?: string;
  empresa_id: string; 
  created_at?: string;
  total_consultas?: number;
  total_tokens?: number;
  total_custo_brl?: number;
  two_factor_enabled?: boolean;
  ultimo_acesso?: string;
  primeiro_acesso?: boolean;
}

// O modelo que ENVIAMOS para o backend criar (POST) 
// Exatamente igual ao seu Swagger!
export interface CreateProfilePayload {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  data_nascimento: string;
  profile_password?: string; // Opcional na edição, obrigatório na criação
  role: ProfileRole;
  area_juridica: string;
  status: ProfileStatus;
  avatar_url: string;
}
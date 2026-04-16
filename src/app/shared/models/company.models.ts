// Shared Models: src/app/shared/models/company.models.ts

export interface CompanyData {
  id?: string;
  name: string;
  code: string;
  cnpj: string;
  email: string;
  phone: string;
  plano: string;
  active: boolean;
  created_at?: string;
}

export interface AdminData {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  data_nascimento: string; // ISO string (YYYY-MM-DD)
  profile_password: string;
}

// Esta é a interface principal que você usará no serviço
export interface RegisterCompanyRequest {
  company: CompanyData;
  admin: AdminData;
}

// Interface para a resposta do servidor (opcional, mas ajuda muito)
export interface RegisterCompanyResponse {
  success: boolean;
  message: string;
  data: {
    empresa: CompanyData & { id: string; created_at: string };
    admin: Omit<AdminData, 'profile_password'> & { id: string; empresa_id: string };
  };
}
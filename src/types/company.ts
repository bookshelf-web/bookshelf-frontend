export type CompanyRole = 'owner' | 'manager' | 'staff';

export interface CompanyAddress {
  street: string;
  number: string;
  complement?: string | null;
  district: string;
  city: string;
  state: string;
  zip: string;
}

export interface Company {
  id: string;
  legalName: string;
  tradeName?: string | null;
  cnpj: string;
  email: string;
  phone?: string | null;
  address: CompanyAddress;
  verified: boolean;
  verifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  /** The current user's role inside the company (not set on admin listings). */
  myRole?: CompanyRole;
}

export interface CreateCompanyRequest {
  cnpj: string;
  legalName: string;
  tradeName?: string;
  email: string;
  phone?: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    zip: string;
  };
}

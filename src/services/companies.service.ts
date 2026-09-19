import api from './api';
import type { Company, CreateCompanyRequest } from '../types/company';

export const companiesService = {
  async create(data: CreateCompanyRequest): Promise<{ message: string; company: Company }> {
    const response = await api.post<{ message: string; company: Company }>('/companies', data);
    return response.data;
  },

  async listMine(): Promise<Company[]> {
    const response = await api.get<{ companies: Company[] }>('/companies');
    return response.data.companies;
  },

  /** Admin only. */
  async listForAdmin(verified?: boolean): Promise<Company[]> {
    const response = await api.get<{ companies: Company[] }>('/admin/companies', {
      params: verified === undefined ? {} : { verified },
    });
    return response.data.companies;
  },

  /** Admin only. */
  async setVerified(id: string, verified: boolean): Promise<Company> {
    const response = await api.patch<{ company: Company }>(`/admin/companies/${id}/verification`, {
      verified,
    });
    return response.data.company;
  },
};

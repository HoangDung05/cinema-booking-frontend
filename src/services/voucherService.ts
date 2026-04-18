import apiClient from './apiClient';

export type VoucherDto = {
  id: number;
  code: string;
  description?: string | null;
  discountType: string;
  discountValue: number;
  minOrderValue?: number | null;
  maxDiscountAmount?: number | null;
  startDate: string;
  endDate: string;
  usageLimit?: number | null;
  usedCount?: number | null;
  status?: string | null;
};
export type VoucherDTO = VoucherDto;

export type VoucherCreatePayload = Omit<VoucherDto, 'id'>;

export const voucherService = {
  getActiveVouchers: async (): Promise<VoucherDto[]> => {
    const res = await apiClient.get('/vouchers');
    return res.data;
  },

  getMyVouchers: async (email: string): Promise<unknown[]> => {
    const res = await apiClient.get(`/users/me/vouchers?email=${encodeURIComponent(email)}`);
    return res.data;
  },

  getAll: async (): Promise<VoucherDto[]> => {
    const res = await apiClient.get('/vouchers/all');
    return res.data;
  },

  create: async (body: VoucherCreatePayload) => {
    const res = await apiClient.post('/vouchers', body);
    return res.data as VoucherDto;
  },

  update: async (id: number, body: VoucherCreatePayload) => {
    const res = await apiClient.put(`/vouchers/${id}`, body);
    return res.data as VoucherDto;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/vouchers/${id}`);
  },
};

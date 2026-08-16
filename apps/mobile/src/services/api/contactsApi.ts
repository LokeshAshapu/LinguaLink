import { ApiClient } from './client';
import { User } from '@lingualink/types';

export const contactsApi = {
  async getContacts(search = ''): Promise<{ contacts: User[] }> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return ApiClient.get<{ contacts: User[] }>(`/contacts${query}`);
  },
};

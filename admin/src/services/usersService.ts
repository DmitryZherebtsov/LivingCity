import api from '@/lib/api';

export type UserDTO = {
  id: string;
  email: string;
  name?: string;
  role_name?: string;
  is_active?: boolean;
  created_at?: string;
};

export const fetchUsers = async (): Promise<UserDTO[]> => {
  const res = await api.get('/api/users');
  return res.data;
};

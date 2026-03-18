import type { Metadata } from 'next';
import { getProfileCached } from '@/actions/profile';
import { PerfilContent } from './perfil-content';

export const metadata: Metadata = {
  title: 'Conta',
  description: 'Gerencie seu perfil e configurações da conta',
};

export default async function PerfilPage() {
  const result = await getProfileCached();
  const user =
    'data' in result && result.data
      ? result.data
      : {
          fullName: 'Usuário',
          email: 'usuario@exemplo.com',
          avatarUrl: 'https://via.placeholder.com/150',
        };

  return (
    <PerfilContent
      fullName={user.fullName}
      email={user.email}
      avatarUrl={user.avatarUrl ?? 'https://via.placeholder.com/150'}
    />
  );
}

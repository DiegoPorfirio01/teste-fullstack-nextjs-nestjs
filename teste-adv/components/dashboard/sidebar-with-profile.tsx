import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { getProfileCached } from '@/actions/profile';

export async function SidebarWithProfile() {
  const result = await getProfileCached();
  const user =
    'data' in result && result.data
      ? {
          name: result.data.fullName,
          email: result.data.email,
          avatar: result.data.avatarUrl ?? 'https://via.placeholder.com/150',
        }
      : {
          name: 'Usuário',
          email: '',
          avatar: 'https://via.placeholder.com/150',
        };

  return <AppSidebar variant="inset" user={user} />;
}

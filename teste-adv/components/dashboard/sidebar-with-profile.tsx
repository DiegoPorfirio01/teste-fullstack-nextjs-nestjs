import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { getProfileCached } from '@/actions/profile';

export async function SidebarWithProfile() {
  const result = await getProfileCached();
  const user =
    'data' in result && result.data
      ? {
          name: result.data.fullName,
          email: result.data.email,
          avatar:
            result.data.avatarUrl ?? 'https://github.com/diegoporfirio01.png',
        }
      : {
          name: 'Usuário',
          email: '',
          avatar: 'https://github.com/diegoporfirio01.png',
        };

  return <AppSidebar variant="inset" user={user} />;
}

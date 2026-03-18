'use client';

import * as React from 'react';
import Link from 'next/link';

import { NavMain } from '@/components/dashboard/nav-main';
import { NavUser } from '@/components/dashboard/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { ROUTE_LABELS, SIDEBAR_NAV_PATHS } from '@/constants';
import {
  LayoutDashboardIcon,
  HistoryIcon,
  WalletIcon,
  CreditCardIcon,
} from 'lucide-react';

const NAV_ICONS: Record<(typeof SIDEBAR_NAV_PATHS)[number], React.ReactNode> = {
  '/dashboard': <LayoutDashboardIcon />,
  '/transactions': <HistoryIcon />,
  '/billing': <CreditCardIcon />,
};

const navMain = SIDEBAR_NAV_PATHS.map((url) => ({
  title: ROUTE_LABELS[url] ?? url,
  url,
  icon: NAV_ICONS[url],
}));

const data = {
  navMain,
};

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: { name: string; email: string; avatar: string };
}) {
  const displayUser = user ?? {
    name: 'Usuário',
    email: 'usuario@exemplo.com',
    avatar: 'https://via.placeholder.com/150',
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-.5!"
            >
              <Link href="/dashboard" prefetch={false}>
                <WalletIcon className="size-5!" />
                <span className="text-base font-semibold">Carteira</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={displayUser} />
      </SidebarFooter>
    </Sidebar>
  );
}

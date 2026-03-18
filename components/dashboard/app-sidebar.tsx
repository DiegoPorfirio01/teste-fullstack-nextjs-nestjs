"use client"

import * as React from "react"
import Link from "next/link"

import { NavDocuments } from "@/components/dashboard/nav-documents"
import { NavMain } from "@/components/dashboard/nav-main"
import { NavUser } from "@/components/dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  HistoryIcon,
  WalletIcon,
  CreditCardIcon,
} from "lucide-react"

const data = {
  navMain: [
    {
      title: "Painel",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Transações",
      url: "/transactions",
      icon: <HistoryIcon />,
    },
    {
      title: "Comprar Crédito",
      url: "/billing",
      icon: <CreditCardIcon />,
    },
  ],
  navHistory: [],
}

export function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: { name: string; email: string; avatar: string }
}) {
  const displayUser = user ?? {
    name: "Usuário",
    email: "usuario@exemplo.com",
    avatar: "/avatars/shadcn.jpg",
  }

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
        {data.navHistory.length > 0 && (
          <NavDocuments items={data.navHistory} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={displayUser} />
      </SidebarFooter>
    </Sidebar>
  )
}

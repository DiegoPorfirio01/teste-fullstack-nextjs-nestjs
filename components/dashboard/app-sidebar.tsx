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
  ArrowDownToLineIcon,
  ArrowRightLeftIcon,
  HistoryIcon,
  WalletIcon,
} from "lucide-react"

const data = {
  user: {
    name: "Usuário",
    email: "usuario@exemplo.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Painel",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Depositar",
      url: "/dashboard/depositar",
      icon: <ArrowDownToLineIcon />,
    },
    {
      title: "Transferir",
      url: "/dashboard/transferir",
      icon: <ArrowRightLeftIcon />,
    },
  ],
  navHistory: [
    {
      name: "Transações",
      url: "/dashboard",
      icon: <HistoryIcon />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavDocuments items={data.navHistory} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

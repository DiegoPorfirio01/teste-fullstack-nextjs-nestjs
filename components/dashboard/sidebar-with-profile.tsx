import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { getProfileCached } from "@/actions/profile"

export async function SidebarWithProfile() {
  const result = await getProfileCached()
  const user =
    "data" in result && result.data
      ? {
          name: result.data.fullName,
          email: result.data.email,
          avatar: "/avatars/shadcn.jpg",
        }
      : { name: "Usuário", email: "", avatar: "/avatars/shadcn.jpg" }

  return <AppSidebar variant="inset" user={user} />
}

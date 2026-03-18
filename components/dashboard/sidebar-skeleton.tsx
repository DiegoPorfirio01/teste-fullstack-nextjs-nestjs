import { Skeleton } from "@/components/ui/skeleton"

export function SidebarSkeleton() {
  return (
    <aside
      className="hidden shrink-0 flex-col gap-2 border-r bg-sidebar md:flex"
      style={{ width: "calc(var(--sidebar-width, 16rem))" }}
    >
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Skeleton className="h-6 w-6 rounded" />
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="flex-1 space-y-2 p-4">
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-9 w-full rounded-md" />
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
    </aside>
  )
}

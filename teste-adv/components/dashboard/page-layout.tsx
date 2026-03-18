import { cn } from "@/lib/utils"

const PAGE_CONTAINER_CLASS =
  "flex flex-col gap-8 px-4 py-6 md:gap-10 md:px-6"

export function PageContainer({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(PAGE_CONTAINER_CLASS, className)}
      {...props}
    />
  )
}

export function PageHeader({
  title,
  description,
  children,
  className,
  ...props
}: React.ComponentProps<"header"> & {
  title: string
  description?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <header
      className={cn("page-content", className)}
      {...props}
    >
      {children ?? (
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}
    </header>
  )
}

export function PageSection({
  className,
  ...props
}: React.ComponentProps<"section">) {
  return <section className={cn("page-content", className)} {...props} />
}

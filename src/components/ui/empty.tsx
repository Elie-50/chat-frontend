import { cva, type VariantProps } from "class-variance-authority"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MessageCirclePlus, RefreshCcw, Users } from "lucide-react"
import { Link } from "react-router-dom"
import { useGroupStore } from "@/store/groupStore"
import { useAuthStore } from "@/store/authStore"

function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12",
        className
      )}
      {...props}
    />
  )
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-header"
      className={cn(
        "flex max-w-sm flex-col items-center gap-2 text-center",
        className
      )}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  "flex shrink-0 items-center justify-center mb-2 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-title"
      className={cn("text-lg font-medium tracking-tight", className)}
      {...props}
    />
  )
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <div
      data-slot="empty-description"
      className={cn(
        "text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance",
        className
      )}
      {...props}
    />
  )
}

export function EmptyGroupChats() {
  const { accessToken } = useAuthStore();
  const { fetchGroups } = useGroupStore();

  const refreshGroups = async () => {
    if (accessToken) {
      await fetchGroups({ page: 1, size: 20 });
    }
  }
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Users />
        </EmptyMedia>
        <EmptyTitle>No Group Chats Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any group chats yet, nor did anyone add you to any. Get started by creating
          your first group chat or refresh.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Link to='/groups/new'>
            <Button className="hover:cursor-pointer">
              <MessageCirclePlus />
              Create Group Chat
            </Button>
          </Link>
          <Button onClick={refreshGroups} variant="outline" className="hover:cursor-pointer">
            <RefreshCcw />
            Refresh
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
}

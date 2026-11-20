"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MoreHorizontal, Plus } from "lucide-react"
import { UserButton } from "@clerk/nextjs"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ModeToggle } from "@/components/ui/more-toggle"
import {
  useConversationList,
  useCreateConversation,
  useDeleteConversation,
  useUpdateConversation,
} from "@/feature/conversation/hooks/use-conversation"

function ChaiLogo() {
  return (
    <div className="flex size-7 items-center justify-center rounded-full bg-[#2f6fed] text-xs font-semibold text-white">
      C
    </div>
  )
}

export default function AppSidebar() {
  const pathname = usePathname()
  const { data: conversations = [], isLoading } = useConversationList()
  const createConversation = useCreateConversation()
  const deleteConversation = useDeleteConversation()
  const updateConversation = useUpdateConversation()

  const activeId = pathname.startsWith("/c/")
    ? pathname.split("/c/")[1]?.split("/")[0]
    : undefined

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarHeader className="gap-3 p-3">
        <div className="flex items-center gap-2 px-1 py-1">
          <ChaiLogo />
          <span className="text-sm font-semibold tracking-tight">ChaiGPT</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="h-9 w-full justify-start gap-2 rounded-lg px-2 text-sm font-normal hover:bg-sidebar-accent"
          disabled={createConversation.isPending}
          onClick={() => createConversation.mutate()}
        >
          <Plus className="size-4" />
          New chat
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-2 py-0">
          <SidebarGroupLabel className="px-2 text-xs text-muted-foreground">
            Chats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuSkeleton showIcon={false} className="h-8" />
                    </SidebarMenuItem>
                  ))
                : conversations.map((conversation) => {
                    const isActive = activeId === conversation.id

                    return (
                      <SidebarMenuItem key={conversation.id}>
                        <SidebarMenuButton
                          isActive={isActive}
                          className="h-9 rounded-lg px-3 text-sm"
                          render={<Link href={`/c/${conversation.id}`} />}
                        >
                          <span className="truncate">{conversation.title}</span>
                        </SidebarMenuButton>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <SidebarMenuAction
                                showOnHover
                                className="top-2 right-2"
                                aria-label={`${conversation.title} options`}
                              />
                            }
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" side="right">
                            <DropdownMenuItem
                              onClick={() =>
                                updateConversation.mutate({
                                  id: conversation.id,
                                  data: { ispinned: !conversation.ispinned },
                                })
                              }
                            >
                              {conversation.ispinned ? "Unpin" : "Pin chat"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                updateConversation.mutate({
                                  id: conversation.id,
                                  data: { isarchived: true },
                                })
                              }
                            >
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() =>
                                deleteConversation.mutate(conversation.id)
                              }
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    )
                  })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-2 border-t border-sidebar-border p-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="text-sm text-muted-foreground">Toggle theme</span>
          <ModeToggle />
        </div>
        <div className="flex items-center gap-2 rounded-lg px-1 py-1">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-7",
              },
            }}
          />
          <span className="text-sm text-muted-foreground">Account</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useQueryClient } from "@tanstack/react-query"
import { DefaultChatTransport, type UIMessage } from "ai"
import { useMemo } from "react"
import { useChat } from "@ai-sdk/react"

import { queryKeys } from "@/feature/conversation/utils/query-keys"
import { ChatComposer } from "@/feature/conversation/componenets/chat-composer"
import { ChatMessages } from "@/feature/conversation/componenets/chat-messages"
import ChatEmpty from "./chatEmpty"

type ConversationViewProps = {
  conversationId: string
  initialMessages: UIMessage[]
}

export function ConversationView({
  conversationId,
  initialMessages,
}: ConversationViewProps) {
  const queryClient = useQueryClient()

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ id, messages }) => ({
          body: {
            id,
            message: messages[messages.length - 1],
          },
        }),
      }),
    []
  )

  const { messages, sendMessage, status } = useChat({
    id: conversationId,
    messages: initialMessages,
    transport,
    onFinish: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversation.all,
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messages.byConversation(conversationId),
      })
    },
  })

  const isLoading = status === "submitted" || status === "streaming"

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4" />
        <span className="text-sm text-muted-foreground">ChaiGPT</span>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
           <ChatEmpty/>
        ) : (
          <ChatMessages messages={messages} isLoading={isLoading} />
        )}
      </div>

      <ChatComposer
        disabled={isLoading}
        onSend={(text) => sendMessage({ text })}
      />
    </div>
  )
}
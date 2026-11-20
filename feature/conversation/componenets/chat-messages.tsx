"use client"

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/src/components/ai-elements/conversation"
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/src/components/ai-elements/message"
import { isTextUIPart, type UIMessage } from "ai"

import ChatEmpty from "@/feature/conversation/componenets/chatEmpty"

type ChatMessagesProps = {
  messages: UIMessage[]
  isLoading?: boolean
}

function getMessageText(message: UIMessage) {
  return message.parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join("")
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  return (
    <Conversation className="h-full min-h-0">
      <ConversationContent>
        {messages.length === 0 ? (
          <ConversationEmptyState>
            <ChatEmpty />
          </ConversationEmptyState>
        ) : (
          messages.map((message, index) => {
            const text = getMessageText(message)
            const isLast = index === messages.length - 1
            const isStreaming =
              Boolean(isLoading) && isLast && message.role === "assistant"

            return (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {message.role === "assistant" ? (
                    <MessageResponse isAnimating={isStreaming}>
                      {text}
                    </MessageResponse>
                  ) : (
                    <p className="whitespace-pre-wrap">{text}</p>
                  )}
                </MessageContent>
              </Message>
            )
          })
        )}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}
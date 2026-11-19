"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createMessage,
  deleteMessage,
  getMessages,
  updateMessage,
  type MessageItem,
} from "@/feature/messages/actions/conversation-message-action"
import {
  type conversationListItem,
} from "@/feature/conversation/actions/converstaion-action"
import { queryKeys } from "@/feature/conversation/utils/query-keys"

function sortConversations(conversations: conversationListItem[]) {
  return [...conversations].sort((a, b) => {
    if (a.ispinned !== b.ispinned) return a.ispinned ? -1 : 1
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  })
}

export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.messages.byConversation(conversationId ?? ""),
    queryFn: () => getMessages(conversationId!),
    enabled: Boolean(conversationId),
  })
}

export function useCreateMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      conversationId,
      content,
    }: {
      conversationId: string
      content: string
    }) => createMessage(conversationId, content),
    onMutate: async ({ conversationId, content }) => {
      const messageKey = queryKeys.messages.byConversation(conversationId)

      await queryClient.cancelQueries({ queryKey: messageKey })
      await queryClient.cancelQueries({ queryKey: queryKeys.conversation.all })

      const previousMessages = queryClient.getQueryData<MessageItem[]>(messageKey)
      const previousList = queryClient.getQueryData<conversationListItem[]>(
        queryKeys.conversation.all
      )

      const trimmed = content.trim()
      const optimisticMessage: MessageItem = {
        id: `temp-${crypto.randomUUID()}`,
        content: trimmed,
        role: "USER",
        status: "PENDING",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      if (previousMessages) {
        queryClient.setQueryData(messageKey, [...previousMessages, optimisticMessage])
      }

      if (previousList) {
        const now = new Date()
        const nextList = previousList.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                lastMessageAt: now,
                title:
                  conversation.title === "New Conversation" ||
                  conversation.title.trim() === ""
                    ? trimmed
                    : conversation.title,
              }
            : conversation
        )

        queryClient.setQueryData(queryKeys.conversation.all, sortConversations(nextList))
      }

      return { previousMessages, previousList, conversationId }
    },
    onError: (_error, variables, context) => {
      if (!context) return
      queryClient.setQueryData(
        queryKeys.messages.byConversation(variables.conversationId),
        context.previousMessages
      )
      queryClient.setQueryData(queryKeys.conversation.all, context.previousList)
    },
    onSuccess: (message, { conversationId }) => {
      const messageKey = queryKeys.messages.byConversation(conversationId)
      const current = queryClient.getQueryData<MessageItem[]>(messageKey)

      if (current) {
        const withoutTemp = current.filter((item) => !item.id.startsWith("temp-"))
        queryClient.setQueryData(messageKey, [...withoutTemp, message])
      }
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messages.byConversation(variables.conversationId),
      })
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversation.all })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversation.details(variables.conversationId),
      })
    },
  })
}

export function useUpdateMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      messageId,
      content,
    }: {
      messageId: string
      content: string
      conversationId: string
    }) => updateMessage(messageId, content),
    onMutate: async ({ messageId, content, conversationId }) => {
      const messageKey = queryKeys.messages.byConversation(conversationId)

      await queryClient.cancelQueries({ queryKey: messageKey })

      const previousMessages = queryClient.getQueryData<MessageItem[]>(messageKey)

      if (previousMessages) {
        queryClient.setQueryData(
          messageKey,
          previousMessages.map((message) =>
            message.id === messageId
              ? {
                  ...message,
                  content: content.trim(),
                  status: "COMPLETED" as const,
                  updatedAt: new Date(),
                }
              : message
          )
        )
      }

      return { previousMessages, conversationId }
    },
    onError: (_error, _variables, context) => {
      if (!context) return
      queryClient.setQueryData(
        queryKeys.messages.byConversation(context.conversationId),
        context.previousMessages
      )
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messages.byConversation(variables.conversationId),
      })
    },
  })
}

export function useDeleteMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      messageId,
    }: {
      messageId: string
      conversationId: string
    }) => deleteMessage(messageId),
    onMutate: async ({ messageId, conversationId }) => {
      const messageKey = queryKeys.messages.byConversation(conversationId)

      await queryClient.cancelQueries({ queryKey: messageKey })

      const previousMessages = queryClient.getQueryData<MessageItem[]>(messageKey)

      if (previousMessages) {
        queryClient.setQueryData(
          messageKey,
          previousMessages.filter((message) => message.id !== messageId)
        )
      }

      return { previousMessages, conversationId }
    },
    onError: (_error, _variables, context) => {
      if (!context) return
      queryClient.setQueryData(
        queryKeys.messages.byConversation(context.conversationId),
        context.previousMessages
      )
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messages.byConversation(variables.conversationId),
      })
    },
  })
}
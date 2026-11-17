"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  updateConversation,
  type conversationListItem,
} from "@/feature/conversation/actions/converstaion-action"
import { queryKeys } from "@/feature/conversation/utils/query-keys"

type ConversationUpdate = {
  title?: string
  ispinned?: boolean
  isarchived?: boolean
}

function sortConversations(conversations: conversationListItem[]) {
  return [...conversations].sort((a, b) => {
    if (a.ispinned !== b.ispinned) return a.ispinned ? -1 : 1
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  })
}

export function useUpdateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ConversationUpdate }) =>
      updateConversation(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.conversation.all })
      await queryClient.cancelQueries({ queryKey: queryKeys.conversation.details(id) })

      const previousList = queryClient.getQueryData<conversationListItem[]>(
        queryKeys.conversation.all
      )
      const previousDetail = queryClient.getQueryData(queryKeys.conversation.details(id))

      if (previousList) {
        const nextList = previousList
          .map((conversation) =>
            conversation.id === id
              ? {
                  ...conversation,
                  ...(data.title !== undefined ? { title: data.title } : {}),
                  ...(data.ispinned !== undefined ? { ispinned: data.ispinned } : {}),
                  ...(data.isarchived !== undefined ? { isarchived: data.isarchived } : {}),
                }
              : conversation
          )
          .filter((conversation) => !conversation.isarchived)

        queryClient.setQueryData(queryKeys.conversation.all, sortConversations(nextList))
      }

      if (previousDetail && typeof previousDetail === "object") {
        queryClient.setQueryData(queryKeys.conversation.details(id), {
          ...previousDetail,
          ...(data.title !== undefined ? { title: data.title } : {}),
          ...(data.ispinned !== undefined ? { ispinned: data.ispinned } : {}),
          ...(data.isarchived !== undefined ? { isArchived: data.isarchived } : {}),
        })
      }

      return { previousList, previousDetail, id }
    },
    onError: (_error, _variables, context) => {
      if (!context) return
      queryClient.setQueryData(queryKeys.conversation.all, context.previousList)
      queryClient.setQueryData(
        queryKeys.conversation.details(context.id),
        context.previousDetail
      )
    },
    onSettled: (_data, _error, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.conversation.all })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversation.details(variables.id),
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messages.byConversation(variables.id),
      })
    },
  })
}

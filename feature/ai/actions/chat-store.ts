import { isTextUIPart, type UIMessage } from "ai"
import { prisma } from "@/lib/prisma"
import type  {Prisma} from "@/generated/prisma/client"
import type { MessageStatus } from "@/generated/prisma/client"

export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter(isTextUIPart)
    .map((part) => part.text)
    .join("")
    .trim()
}

export async function getConversation(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
  })

  if (!conversation) {
    throw new Error("Conversation not found")
  }

  return conversation
}

export function toUIMessagePart(
   parts: Prisma.JsonValue | null,
   content: string  
): UIMessage["parts"] {
  const stored =  parts as UIMessage["parts"] | null

  if(Array.isArray(stored) && stored.length > 0) {
    return stored
  }

  return [{type: "text",text:content}]
}

/** Load saved messages for the chat UI. */
export async function loadChatMessages(
  conversationId: string
): Promise<UIMessage[]> {
  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      status: "COMPLETED",
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      role: true,
      content: true,
      parts: true,
    },
  })

  return messages
    .filter((message) => message.content.trim().length > 0)
    .map((message) => ({
      id: message.id,
      role: message.role.toLowerCase() as UIMessage["role"],
      parts: toUIMessagePart(message.parts, message.content),
    }))
}

/** Save the user's prompt before calling the model. */
export async function saveUserMessage(
  conversationId: string,
  userId: string,
  content: string | UIMessage
) {
  const conversation = await getConversation(conversationId, userId)
  const trimmed =
    typeof content === "string" ? content.trim() : getMessageText(content)

  if (!trimmed) {
    throw new Error("Message is required")
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      role: "USER",
      status: "COMPLETED",
      content: trimmed,
    },
  })

  const shouldRename =
    conversation.title === "New Conversation" ||
    conversation.title === "New Chat" ||
    conversation.title.trim() === ""

  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: new Date(),
      ...(shouldRename ? { title: trimmed.slice(0, 80) } : {}),
    },
  })

  return message
}

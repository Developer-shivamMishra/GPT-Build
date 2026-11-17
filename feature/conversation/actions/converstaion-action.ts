"use server"

import { requireUser } from "@/feature/auth/require"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export type conversationListItem = {
    id: string
    title: string
    model: string
    ispinned: boolean
    isarchived: boolean
    lastMessageAt: Date
   
}

async function  assertUserOwnsConversation(conversationId: string, userId: string){
    const conversation = await prisma.conversation.findFirst({
        where: {id: conversationId, userId: userId}
    })
    if (!conversation) {
        throw new Error("Conversation not found")
    }
    return conversation
}


export async function getConversationList(): Promise<conversationListItem[]> {
    const user = await requireUser()
    const conversations = await prisma.conversation.findMany({
        where: {
            userId: user.id,
            isArchived: false,
        },
        orderBy: [{ ispinned: "desc" }, { lastMessageAt: "desc" }],
        select: {
            id: true,
            title: true,
            model: true,
            ispinned: true,
            isArchived: true,
            lastMessageAt: true,
        },
    })

    return conversations.map((conversation) => ({
        id: conversation.id,
        title: conversation.title,
        model: conversation.model ?? "",
        ispinned: conversation.ispinned ?? false,
        isarchived: conversation.isArchived ?? false,
        lastMessageAt: conversation.lastMessageAt,
    }))
}

export async function createConversation(title = "new conversation"){
    const user = await requireUser()
   return  prisma.conversation.create({
        data: {
            userId: user.id,
            title: title.trim() || "New Conversation",
        }
    })
    
}

export async function updateConversation(conversationId: string,data:{title?: string, ispinned?: boolean, isarchived?: boolean}){
    const user = await requireUser()
    await assertUserOwnsConversation(conversationId, user.id)

    const conversation = await prisma.conversation.update({
        where: {id: conversationId},
        data : {
            ...(data.title !== undefined ?{title: data.title.trim() || "New Conversation"} : {}),
            ...(data.ispinned !== undefined ? {ispinned: data.ispinned} : {}),
            ...(data.isarchived !== undefined ? { isArchived: data.isarchived } : {}),
        }

    })

    revalidatePath("/");
    revalidatePath (`/c/${conversationId}`);
    return conversation
}
export async function deleteConversation(conversationId: string){
    const user = await requireUser()
    await assertUserOwnsConversation(conversationId, user.id)
    await prisma.conversation.delete({
        where: {id: conversationId}

    })
    revalidatePath("/");
    return {id:conversationId}
}



"use server"

import {revalidatePath} from "next/cache"
import { requireUser } from "@/feature/auth/require"
import { prisma } from "@/lib/prisma"
import type { MessageRole } from "@/generated/prisma/client"

export type MessageItem = {
    id: string
    content: string
    role: MessageRole
    status: "PENDING" | "COMPLETED" | "ERROR"
    createdAt: Date
    updatedAt: Date
}

async function asertownconversation(conversationId: string,userId:string){
    const conversation = await prisma.conversation.findFirst({
        where:{ id:conversationId,userId}

    })

    if(!conversation){
        throw new Error("Conversation not found")
    }

    return conversation
} 


export async function getMessages(conversationId: string): Promise<MessageItem[]> {
    const  user = await requireUser()
    await asertownconversation(conversationId,user.id)

    return prisma.message.findMany({
        where:{conversationId},
        orderBy:{createdAt:"asc"},

        select:{
            id:true,
            content:true,
            role:true,
            status:true,
            createdAt:true,
            updatedAt:true,
        }
    })
}

export async function createMessage(conversationId: string, content: string): Promise<MessageItem> {
    const user = await requireUser()
    const conversation = await asertownconversation(conversationId,user.id)

    const trimmed = content.trim()
    if(!trimmed){
        throw new Error("Content is required")
    }

   const message = await prisma.message.create({
    data:{
        conversationId,
        role:"USER",
        status:"COMPLETED",
        content:trimmed,
        
    }
   });

   const  shouldRename  = conversation.title == "New Conversation" ||conversation.title.trim() === "";

   await prisma.conversation.update({
    where:{id:conversationId},
    data:{
        lastMessageAt:new Date(),
        ...(shouldRename && {title:trimmed}),
    }
   })

    revalidatePath("/")
    revalidatePath(`/c/${conversationId}`)

    return {
        id: message.id,
        content: message.content,
        role: message.role,
        status: message.status,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
    }
}
    
export async function updateMessage(messageId: string, content: string): Promise<MessageItem> {
    const user = await requireUser()
    const trimmed = content.trim()
    if(!trimmed){
        throw new Error("Content is required")
    }

    const existingMessage = await prisma.message.findUnique({
        where:{id:messageId},
        include :{conversation:true}
    })

    if(!existingMessage || existingMessage.conversation.userId !== user.id){
        throw new Error("Message not found")
    }

    const message = await prisma.message.update({
        where:{id:messageId},
        data:{
            content:trimmed,
            status:"COMPLETED",
        },
        select: {
            id: true,
            content: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    })

    revalidatePath(`/c/${existingMessage.conversationId}`)
    return message
}

export async function deleteMessage(messageId: string) {
    const user = await requireUser()
    const existingMessage = await prisma.message.findUnique({
        where:{id:messageId},
        include :{conversation:true}
    })

    if(!existingMessage || existingMessage.conversation.userId !== user.id){
        throw new Error("Message not found")
    }

    await prisma.message.delete({
        where:{id:messageId}
    })
    revalidatePath(`/c/${existingMessage.conversationId}`)
    return {id:messageId,conversationId:existingMessage.conversationId}
}
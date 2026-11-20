"use server"

import { requireUser } from "@/feature/auth/require"
import { prisma } from "@/lib/prisma"

export async function startnewChat(){
    const user = await  requireUser()
    const conversation = await prisma.conversation.create({
        data:{
            userId:user.id,
            title:"New Chat",
        }
    })
    return conversation.id
}
import { getMessageText, loadChatMessages, saveUserMessage } from "@/feature/ai/actions/chat-store";
import { getchatModel } from "@/feature/ai/utils/model";
import { requireUser } from "@/feature/auth/require";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { convertToModelMessages, createIdGenerator, createUIMessageStreamResponse, streamText, toUIMessageStream, UIMessage } from "ai";
export async function POST(req: Request) {
    await auth.protect();
  const { message ,id } : {message : UIMessage,id : string} = await req.json();
  
    if(!message || !id) {
        return new Response("Missing message or conversation id", { status: 400 });
    }

    const user = await requireUser()

    const conversation = await prisma.conversation.findFirst({
        where: {
            id,
            userId: user.id,
        },
    });

    if(!conversation) {
        return new Response("Conversation not found", { status: 404 });
    }

    const  previousMessages = await loadChatMessages(id)

    const alreadySaved = previousMessages.some((storedMessage) => storedMessage.id === message.id)

    const messages = alreadySaved ? previousMessages : [...previousMessages, message]

    if(!alreadySaved) {
        await saveUserMessage(id, user.id, getMessageText(message))
    }

    const result =  streamText({
        model: getchatModel(conversation.model),
        system: conversation.systemPrompt ?? "you are a helpful assistant that can answer questions and help with tasks",
        messages: await convertToModelMessages(messages),
    })

    result.consumeStream();

    return  createUIMessageStreamResponse({
        stream : toUIMessageStream({
            stream:result.stream,
            originalMessages:messages,
            generateMessageId:createIdGenerator({prefix:"msg_", size:16}),
            onEnd: async ({ messages: finalMessages }) => {
              try {
                const assistant = [...finalMessages]
                  .reverse()
                  .find((item) => item.role === "assistant")
                if (!assistant) return

                const text = getMessageText(assistant)
                if (!text) return

                await prisma.message.create({
                  data: {
                    conversationId: id,
                    role: "ASSISTANT",
                    status: "COMPLETED",
                    content: text,
                  },
                })

                await prisma.conversation.update({
                  where: { id },
                  data: { lastMessageAt: new Date() },
                })
              } catch {
                // Stream UI already has the reply; persistence failed silently.
              }
            },
        })
    })



    
    
}
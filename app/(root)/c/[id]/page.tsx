import { loadChatMessages } from "@/feature/ai/actions/chat-store"
import { ConversationView } from "@/feature/conversation/componenets/conversation-view"
import { getConversation } from "@/feature/conversation/actions/converstaion-action"
import { notFound } from "next/navigation"


type conversationPageProps = {
    params: Promise<{id: string}>
}
const page = async ({params}: conversationPageProps) => {
    const {id} = await params


    try {
        await getConversation(id)
    } catch (error) {
        notFound()
    }

    const initialMessages = await loadChatMessages(id)

  return (
    <ConversationView conversationId={id} initialMessages={initialMessages} />
  )
}

export default page

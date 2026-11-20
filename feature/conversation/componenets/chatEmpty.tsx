import { MessageSquareIcon } from "lucide-react"

export default function ChatEmpty() {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <MessageSquareIcon className="size-8 text-muted-foreground" />
      <h3 className="text-sm font-medium">How can I help you today?</h3>
      <p className="max-w-sm text-sm text-muted-foreground">
        Send a message below to start chatting with ChaiGPT.
      </p>
    </div>
  )
}
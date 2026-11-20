"use client"

import { ArrowUpIcon } from "lucide-react"
import { useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type ChatComposerProps = {
  onSend: (message: string) => void
  disabled?: boolean
  className?: string
  placeholder?: string
}

export function ChatComposer({
  onSend,
  disabled = false,
  className,
  placeholder = "Message ChaiGPT…",
}: ChatComposerProps) {
  const [input, setInput] = useState("")

  const canSend = input.trim().length > 0 && !disabled

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = input.trim()
    if (!text || disabled) return

    onSend(text)
    setInput("")
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("border-t bg-background p-4", className)}
    >
      <div className="relative mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border bg-muted/40 p-2">
        <Textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="max-h-40 min-h-10 resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              event.currentTarget.form?.requestSubmit()
            }
          }}
        />
        <Button
          type="submit"
          size="icon"
          className="size-9 shrink-0 rounded-full"
          disabled={!canSend}
          aria-label="Send message"
        >
          <ArrowUpIcon className="size-4" />
        </Button>
      </div>
    </form>
  )
}
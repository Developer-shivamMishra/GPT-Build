import { ChatShell } from "@/feature/conversation/componenets/chat-shell"
import { OnboardGate } from "@/feature/auth/components/onboard-gate"
import { Suspense } from "react"
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense
      fallback={
        <ChatShell>
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Loading…
          </div>
        </ChatShell>
      }
    >
      <OnboardGate>
        <ChatShell>{children}</ChatShell>
      </OnboardGate>
    </Suspense>
  )
}
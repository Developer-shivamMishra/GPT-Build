import { onboarUser } from "@/feature/auth/action/onboard"
import { auth } from "@clerk/nextjs/server"

export async function OnboardGate({ children }: { children: React.ReactNode }) {
  await auth.protect()
  await onboarUser()

  return children
}
import { onboarUser } from '@/feature/auth/action/onboard';
import { auth } from '@clerk/nextjs/server'
import React from 'react'


const RootLayout = async ({ children }: { children: React.ReactNode }) => {

    await auth.protect();
    await onboarUser()
  return (
    <div>{children}</div>
  )
}

export default RootLayout
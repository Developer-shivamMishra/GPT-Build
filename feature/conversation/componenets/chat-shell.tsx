"use client"

import  Appsidebar  from "@/feature/conversation/componenets/app-sidebar"
import  {SidebarProvider,SidebarInset}  from "@/components/ui/sidebar"

export const ChatShell = ({children}: {children: React.ReactNode}) => {
    return (
        <SidebarProvider>
            <Appsidebar />
            <SidebarInset className="min-h-svh bg-background">
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Outlet } from "react-router-dom"

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center gap-4 border-b px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger />
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Demo Agency Ltd.</span>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                DA
              </div>
            </div>
          </header>
          <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

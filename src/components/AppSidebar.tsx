
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Building2, Home, Search, MessageSquare, Settings, FileText, UserCircle } from "lucide-react"
import { NavLink } from "react-router-dom"

const items = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Opportunities", url: "/opportunities", icon: Search },
  { title: "My Requests", url: "/requests", icon: FileText },
  { title: "Messages", url: "/messages", icon: MessageSquare },
  { title: "Profile", url: "/profile", icon: UserCircle },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      <div className="flex items-center gap-2 p-4 h-16 border-b border-border/40">
        <Building2 className="w-6 h-6 text-primary shrink-0" />
        {!isCollapsed && <span className="font-bold text-lg text-primary">TravelConnect</span>}
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => 
                        isActive 
                          ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary w-full flex items-center gap-2" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground w-full flex items-center gap-2"
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

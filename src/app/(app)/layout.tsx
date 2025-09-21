"use client"

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Logo } from "@/components/Logo"
import { Home, Bot, ShieldCheck, FileUp, FolderKanban, Settings, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/generate", icon: Bot, label: "Generate Tests" },
  { href: "/compliance", icon: ShieldCheck, label: "Compliance Check" },
  { href: "/manage", icon: FolderKanban, label: "Manage Tests" },
  { href: "/import", icon: FileUp, label: "Import Tests" },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-6 pb-4 animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-sidebar-accent/10">
            <Logo />
          </div>
        </SidebarHeader>
        <SidebarContent className="px-4 py-2">
          <SidebarMenu className="gap-2">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                  size="lg"
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <div className="px-4 py-2">
          <div className="h-px bg-sidebar-border w-full"></div>
        </div>
        <SidebarFooter className="p-6 animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="justify-start w-full p-3 h-auto rounded-xl transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground shadow-sm hover:shadow-md">
                   <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/10">
                        <AvatarImage src="https://picsum.photos/seed/user/40/40" />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">QA</AvatarFallback>
                      </Avatar>
                      <div className="text-left hidden group-data-[state=expanded]:block">
                        <p className="text-sm font-medium">QA Team</p>
                        <p className="text-xs text-muted-foreground">qa@nascom.com</p>
                      </div>
                   </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">QA Team</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      qa@nascom.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-6 md:px-8 shadow-sm">
          <SidebarTrigger className="md:hidden rounded-lg p-2 transition-colors duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"/>
          <div className="flex-1">
            <h1 className="text-lg font-semibold md:text-xl">
              {navItems.find(item => item.href === pathname)?.label || "MediTestAI"}
            </h1>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8 bg-gradient-to-br from-background to-muted/20 min-h-screen animate-in fade-in duration-500">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

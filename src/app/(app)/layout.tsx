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
import { Home, Bot, ShieldCheck, FileUp, FolderKanban, LogOut, Link2 } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
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
import { useUser } from "@/contexts/UserContext"

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/generate", icon: Bot, label: "Generate Tests" },
  { href: "/compliance", icon: ShieldCheck, label: "Compliance Check" },
  { href: "/manage", icon: FolderKanban, label: "Manage Tests" },
  { href: "/import", icon: FileUp, label: "Import Tests" },
  { href: "/traceability", icon: Link2, label: "Traceability Matrix" },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentUser, logout } = useUser()

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
                        <AvatarImage src={currentUser?.avatar || "https://picsum.photos/seed/user/40/40"} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'QA'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left hidden group-data-[state=expanded]:block">
                        <p className="text-sm font-medium">
                          {currentUser ? currentUser.name : 'QA Team'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentUser ? currentUser.email : 'qa@nascom.com'}
                        </p>
                      </div>
                   </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mb-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {currentUser ? currentUser.name : 'QA Team'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser ? currentUser.email : 'qa@nascom.com'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={async () => {
                  try {
                    await logout();
                    router.push('/login');
                  } catch (error) {
                    console.error('Logout error:', error);
                    router.push('/login');
                  }
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 sm:h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 shadow-sm">
          <SidebarTrigger className="md:hidden rounded-lg p-2 transition-colors duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"/>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm sm:text-base font-semibold truncate">
              {navItems.find(item => item.href === pathname)?.label || "MediTestAI"}
            </h1>
          </div>
        </header>
        <main className="flex-1 p-3 sm:p-6 bg-gradient-to-br from-background to-muted/20 min-h-screen animate-in fade-in duration-500">
          <div className="max-w-7xl mx-auto space-y-4">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
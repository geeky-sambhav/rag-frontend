"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import type { ChatHistoryType } from "@/components/news-chat"
import { Clock, Menu, X, MessageSquare } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar"

interface ChatSidebarProps {
  chatHistory: ChatHistoryType[]
  activeChatId: string | null
  onSelectChat: (chatId: string) => void
}

export function ChatSidebar({ chatHistory, activeChatId, onSelectChat }: ChatSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [animateItems, setAnimateItems] = useState(false)

  // Format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "just now"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes}m ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours}h ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days}d ago`
    }
  }

  // Close sidebar on mobile when a chat is selected
  useEffect(() => {
    if (isMobileOpen) {
      setIsMobileOpen(false)
    }
  }, [activeChatId])

  // Animate items after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateItems(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {/* Mobile Trigger */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-gray-800/90 text-gray-300 hover:bg-blue-900/70 hover:text-blue-400 transition-all duration-300 shadow-lg"
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:relative md:z-0 md:w-72 md:translate-x-0 transition-transform duration-500 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className={cn(
            "md:hidden absolute top-4 right-4 z-50 p-2 rounded-full bg-gray-800/90 text-gray-300 hover:bg-red-900/70 hover:text-red-400 transition-all duration-300 shadow-lg",
            isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>

        <div className="h-full w-full bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-800/50 shadow-xl">
          <SidebarProvider>
            <Sidebar collapsible="none">
              <SidebarHeader className="p-4 border-b border-gray-800/50 bg-gray-900/80">
                <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center gap-2">
                  <MessageSquare size={20} className="text-blue-400" />
                  Chat History
                </h2>
              </SidebarHeader>

              <SidebarContent>
                <SidebarMenu>
                  {chatHistory.length > 0 ? (
                    chatHistory.map((chat, index) => (
                      <SidebarMenuItem key={chat.id}>
                        <SidebarMenuButton
                          isActive={chat.id === activeChatId}
                          onClick={() => onSelectChat(chat.id)}
                          className={cn(
                            "flex flex-col items-start gap-1 hover:bg-blue-900/20 data-[active=true]:bg-blue-900/40 transition-all duration-300",
                            "hover:translate-y-[-2px] active:translate-y-0",
                            animateItems ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4",
                            "transition-all duration-500 ease-out",
                          )}
                          style={{ transitionDelay: `${index * 50}ms` }}
                        >
                          <div className="font-medium truncate w-full">{chat.title}</div>
                          <div className="flex items-center w-full text-xs text-gray-400">
                            <Clock size={12} className="mr-1" />
                            <span>{formatRelativeTime(chat.timestamp)}</span>
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <p>No chat history yet</p>
                    </div>
                  )}
                </SidebarMenu>
              </SidebarContent>
            </Sidebar>
          </SidebarProvider>
        </div>
      </div>

      {/* Overlay for mobile */}
      <div
        className={cn(
          "fixed inset-0 bg-black/70 backdrop-blur-sm z-30 md:hidden transition-opacity duration-500",
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setIsMobileOpen(false)}
      />
    </>
  )
}

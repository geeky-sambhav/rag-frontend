"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, RefreshCw } from "lucide-react"
import { cn } from "../lib/utils"
import { ChatMessage } from "./chat-message"
import { ChatSidebar } from "./chat-sidebar"
import { TypingIndicator } from "./typing-indicator"

// Types
export type MessageType = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
  hasContext?: boolean
}

export type ChatHistoryType = {
  id: string
  title: string
  timestamp: Date
  preview: string
}

export function NewsChat() {
  // State
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: "welcome",
      content: "Hello! I'm your RAG NewsBot. Ask me anything about recent news and events.",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatHistoryType[]>([
 
  ])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Simulate bot typing
    setIsTyping(true)

    // Simulate bot response after delay
    setTimeout(() => {
      const botResponses = [
        "Based on recent news sources, there have been significant developments in this area.",
        "According to my knowledge base, several news outlets have reported on this topic recently.",
        "I've analyzed recent news articles, and here's what I found about your question.",
        "Looking at the latest news data, I can tell you that experts are discussing this topic extensively.",
      ]

      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)]

      const botMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        role: "assistant",
        timestamp: new Date(),
        hasContext: Math.random() > 0.5, // Randomly decide if the message has context
      }

      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)

      // Create a new chat history item if this is a new conversation
      if (!activeChatId) {
        const newChatId = Date.now().toString()
        const newChat: ChatHistoryType = {
          id: newChatId,
          title: userMessage.content.slice(0, 20) + (userMessage.content.length > 20 ? "..." : ""),
          timestamp: new Date(),
          preview: userMessage.content,
        }

        setChatHistory((prev) => [newChat, ...prev])
        setActiveChatId(newChatId)
      }
    }, 1500)
  }

  // Handle input change and auto-resize
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)

    // Auto-resize the textarea
    e.target.style.height = "auto"
    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`
  }

  // Handle key press (Enter to send, Shift+Enter for new line)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Reset chat
  const resetChat = () => {
    setMessages([
      {
        id: "welcome",
        content: "Hello! I'm your RAG NewsBot. Ask me anything about recent news and events.",
        role: "assistant",
        timestamp: new Date(),
      },
    ])
    setActiveChatId(null)
    inputRef.current?.focus()
  }

  // Load chat history
  const loadChatHistory = (chatId: string) => {
    // In a real app, you would fetch the messages for this chat
    // For now, we'll just simulate it
    setActiveChatId(chatId)
    const selectedChat = chatHistory.find((chat) => chat.id === chatId)

    if (selectedChat) {
      setMessages([
        {
          id: "welcome",
          content: "Hello! I'm your RAG NewsBot. Ask me anything about recent news and events.",
          role: "assistant",
          timestamp: new Date(selectedChat.timestamp.getTime() - 1000),
        },
        {
          id: "user-1",
          content: selectedChat.preview,
          role: "user",
          timestamp: selectedChat.timestamp,
        },
        {
          id: "bot-1",
          content: "Here's what I found about that in recent news...",
          role: "assistant",
          timestamp: new Date(selectedChat.timestamp.getTime() + 1000),
          hasContext: true,
        },
      ])
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950">
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-animated-gradient opacity-30 pointer-events-none"></div>

      {/* Sidebar */}
      <ChatSidebar chatHistory={chatHistory} activeChatId={activeChatId} onSelectChat={loadChatHistory} />

      {/* Main Chat Container */}
      <div className="flex flex-1 flex-col h-full relative overflow-hidden px-4 sm:px-6 md:px-8">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-md z-10 shadow-md">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
            RAG NewsBot
          </h1>
          <button
            onClick={resetChat}
            className="p-2 rounded-full bg-gray-800/50 hover:bg-blue-900/50 text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-opacity-50 active:scale-95"
            aria-label="Reset chat"
          >
            <RefreshCw size={18} className="transition-transform hover:rotate-180 duration-500" />
          </button>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <div className="max-w-5xl mx-auto w-full space-y-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-800/50 bg-gray-950/80 backdrop-blur-md shadow-lg">
          <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
            <div
              className={cn(
                "relative flex items-end bg-gray-900/80 rounded-2xl border transition-all duration-300 overflow-hidden shadow-lg",
                isFocused ? "border-blue-500/70 shadow-blue-500/10" : "border-gray-800/70 shadow-black/20",
              )}
            >
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Ask about the news..."
                className={cn(
                  "flex-1 max-h-[150px] min-h-[56px] py-4 pl-4 pr-12 bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none resize-none transition-all duration-300",
                  isFocused ? "placeholder-blue-400/50" : "placeholder-gray-500",
                )}
                rows={1}
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className={cn(
                  "absolute right-3 bottom-3 p-2 rounded-full transition-all duration-300",
                  inputValue.trim()
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white hover:scale-105 shadow-lg shadow-blue-900/20"
                    : "bg-gray-800 text-gray-500 cursor-not-allowed",
                  "active:scale-95",
                )}
                aria-label="Send message"
              >
                <Send size={18} className="transform -rotate-45" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Press Enter to send, Shift+Enter for a new line</p>
          </form>
        </div>
      </div>
    </div>
  )
}

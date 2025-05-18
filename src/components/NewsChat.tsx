"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { ChatMessage } from "./ChatMessage"
import { ChatSidebar } from "./ChatSidebar"
import { TypingIndicator } from "./TypingIndicator"
import { cn } from "../utils"
import { v4 as uuidv4 } from 'uuid';

// API configuration
const API_BASE_URL =process.env.NEXT_PUBLIC_API_BASE_URL; // Change this to your actual API URL

// Icons
function SendIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  )
}

function RefreshCwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  )
}

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
  const [sessionId, setSessionId] = useState<string | null>(null)
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

  useEffect(() => {
    const storedSessionId = localStorage.getItem('newsBotSessionId');
    if (storedSessionId) {
      setSessionId(storedSessionId);
      // Set loading state first
      setMessages([{
        id: "loading",
        content: "Loading your conversation...",
        role: "assistant",
        timestamp: new Date(),
      }]);
      // Then fetch history using the stored session ID
      fetchChatHistory(storedSessionId);
    } else {
      const newSessionId = `session_${uuidv4()}`;
      setSessionId(newSessionId);
      localStorage.setItem('newsBotSessionId', newSessionId);
    }
  }, []);

  // Fetch chat history from the API
  const fetchChatHistory = async (sid: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/history/${sid}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.history && data.history.length > 0) {
        // Convert API response to MessageType format
        const historyMessages: MessageType[] = data.history.map((msg: any) => ({
          id: uuidv4(),
          content: msg.content,
          role: msg.role as "user" | "assistant",
          timestamp: new Date(),
        }));
        
        // Add welcome message at the beginning
        const welcomeMessage: MessageType = {
          id: "welcome",
          content: "Hello! I'm your RAG NewsBot. Ask me anything about recent news and events.",
          role: "assistant",
          timestamp: new Date(Date.now() - 1000),
        };
        
        setMessages([welcomeMessage, ...historyMessages]);
        
        // Create a persistent chat history entry based on the first user message
        if (chatHistory.length <= 3 && historyMessages.length > 0) {
          const userMessages = historyMessages.filter(msg => msg.role === "user");
          if (userMessages.length > 0) {
            const firstUserMsg = userMessages[0];
            const newChatId = sid; // Use session ID as chat ID for consistency
            const newChat: ChatHistoryType = {
              id: newChatId,
              title: firstUserMsg.content.length > 20 
                ? `${firstUserMsg.content.substring(0, 20)}...` 
                : firstUserMsg.content,
              timestamp: new Date(),
              preview: firstUserMsg.content,
            };
            
            // Replace default chat history with the actual one
            if (chatHistory.length <= 3 && chatHistory[0]?.id === "1") {
              setChatHistory([newChat]);
            } else {
              setChatHistory(prev => {
                // Check if this chat already exists
                const exists = prev.some(chat => chat.id === newChatId);
                if (!exists) {
                  return [newChat, ...prev];
                }
                return prev;
              });
            }
            setActiveChatId(newChatId);
          }
        }
      } else {
        // If no history, just show the welcome message
        setMessages([{
          id: "welcome",
          content: "Hello! I'm your RAG NewsBot. Ask me anything about recent news and events.",
          role: "assistant",
          timestamp: new Date(),
        }]);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      // Show error in chat
      setMessages([{
        id: "welcome",
        content: "Hello! I'm your RAG NewsBot. Ask me anything about recent news and events.",
        role: "assistant",
        timestamp: new Date(),
      }, ]);
    }
  };

  // Handle form submission
  const handleSubmit = async(e: React.FormEvent) => {
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

    setIsTyping(true)
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_message: userMessage.content, session_id: sessionId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Network response was not ok.' }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const botMessage: MessageType = { 
        id: uuidv4(),
        role: 'assistant', 
        content: data.bot_response, 
        timestamp: new Date() 
      };
      setMessages(prevMessages => [...prevMessages, botMessage]);
      
      // Update chat history with the new conversation
      if (messages.length === 1 && sessionId) { // If this is a new conversation (only welcome message)
        const chatId = sessionId; // Use session ID as chat ID for consistency
        
        // Check if this chat already exists in history
        const chatExists = chatHistory.some(chat => chat.id === chatId);
        
        if (!chatExists) {
          const newChat: ChatHistoryType = {
            id: chatId,
            title: userMessage.content.length > 20 
              ? `${userMessage.content.substring(0, 20)}...` 
              : userMessage.content,
            timestamp: new Date(),
            preview: userMessage.content,
          };
          
          // Replace default chat history or add to existing
          if (chatHistory.length <= 3 && chatHistory[0]?.id === "1") {
            setChatHistory([newChat]);
          } else {
            setChatHistory(prev => [newChat, ...prev]);
          }
        }
        setActiveChatId(chatId);
      }
      
      if (data.session_id && data.session_id !== sessionId) {
        setSessionId(data.session_id); // Update session ID if backend assigned a new one
        localStorage.setItem('newsBotSessionId', data.session_id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: MessageType = { 
        id: uuidv4(),
        role: 'user' as 'user' | 'assistant', 
        content: `Error: ${(error as Error).message || 'Could not get a response.'}`, 
        timestamp: new Date() 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsTyping(false);
    }
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

  // Reset chat and clear session history
  const resetChat = async () => {
    if (sessionId) {
      try {
        const response = await fetch(`${API_BASE_URL}/clear_session/${sessionId}`, {
          method: 'POST',
        });
        
        if (!response.ok) {
          console.error('Failed to clear chat history on server');
        }
      } catch (error) {
        console.error('Error clearing chat history:', error);
      }
    }
    
    setMessages([
      {
        id: "welcome",
        content: "Hello! I'm your RAG NewsBot. Ask me anything about recent news and events.",
        role: "assistant",
        timestamp: new Date(),
      },
    ]);
    setActiveChatId(null);
    inputRef.current?.focus();
  }

  // Load chat history
  const loadChatHistory = (chatId: string) => {
    setActiveChatId(chatId);
    const selectedChat = chatHistory.find((chat) => chat.id === chatId);

    if (selectedChat && sessionId) {
      // Set loading state
      setMessages([{
        id: "loading",
        content: "Loading chat history...",
        role: "assistant",
        timestamp: new Date(),
      }]);
      
      // Fetch chat history from API
      fetchChatHistory(sessionId);
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
            <RefreshCwIcon width={18} height={18} className="transition-transform hover:rotate-180 duration-500" />
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
                <SendIcon width={18} height={18} className="transform -rotate-45" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Press Enter to send, Shift+Enter for a new line</p>
          </form>
        </div>
      </div>
    </div>
  )
}

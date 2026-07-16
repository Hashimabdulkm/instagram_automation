"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { DashboardSidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Conversation {
  id: string
  participants: Array<{
    id: string
    name?: string
  }>
  updated_time: string
  unread_count?: number
}

interface Message {
  id: string
  from: {
    id: string
    username?: string
  }
  to: {
    data: Array<{
      id: string
      username?: string
    }>
  }
  message: string
  created_time: string
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [businessAccountId, setBusinessAccountId] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState<string | null>(null)
  const [conversationNames, setConversationNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)

  useEffect(() => {
    async function fetchConversations() {
      if (!session?.user) return
      
      try {
        const response = await fetch(`/api/conversations?userId=${(session.user as any).id}`)
        if (response.ok) {
          const data = await response.json()
          setConversations(data.data || [])
          // Store the business account ID for message alignment
          setBusinessAccountId(data.businessAccountId || null)
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchConversations()
  }, [session?.user])

  // Fetch messages for all conversations to get customer names
  useEffect(() => {
    async function fetchAllConversationNames() {
      if (!conversations.length || !businessAccountId) return
      
      for (const conversation of conversations) {
        try {
          const response = await fetch(`/api/conversations/${conversation.id}/messages?userId=${(session?.user as any)?.id}`)
          if (response.ok) {
            const data = await response.json()
            const messagesData = data.messages?.data || []
            
            // Extract customer name from the first customer message
            const customerMessage = messagesData.find((msg: Message) => msg.from?.id !== businessAccountId)
            if (customerMessage?.from?.username) {
              setConversationNames((prev: Record<string, string>) => ({
                ...prev,
                [conversation.id]: customerMessage.from.username
              }))
            }
          }
        } catch (error) {
          console.error(`Failed to fetch messages for conversation ${conversation.id}:`, error)
        }
      }
    }

    fetchAllConversationNames()
  }, [conversations, businessAccountId, session?.user])

  const fetchMessages = async (conversationId: string) => {
    if (!session?.user) return
    
    setMessagesLoading(true)
      try {
        const response = await fetch(`/api/conversations/${conversationId}/messages?userId=${(session.user as any).id}`)
        if (response.ok) {
          const data = await response.json()
          // Reverse the messages array to show newest first
          const messagesData = data.messages?.data || []
          setMessages(messagesData.reverse())
          
          // Extract customer name from the first customer message
          const customerMessage = messagesData.find((msg: Message) => msg.from?.id !== businessAccountId)
          if (customerMessage?.from?.username) {
            setCustomerName(customerMessage.from.username)
            // Store the customer name for this conversation
            setConversationNames(prev => ({
              ...prev,
              [conversationId]: customerMessage.from.username
            }))
          }
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error)
      } finally {
        setMessagesLoading(false)
      }
  }

  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversation(conversation)
    fetchMessages(conversation.id)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              <div className="text-center">Loading conversations...</div>
            </div>
          </main>
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-screen bg-background">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-border overflow-y-auto">
              <div className="p-4 border-b border-border">
                <h1 className="text-xl font-bold text-foreground">Messages</h1>
                <p className="text-sm text-muted-foreground">Instagram DM conversations</p>
              </div>
              <div className="p-4 space-y-2">
                {conversations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No conversations found
                  </div>
                ) : (
                  conversations.map((conversation) => {
                    const userName = conversationNames[conversation.id] || `User ${conversation.id.slice(-4)}`
                    const timeAgo = new Date(conversation.updated_time).toLocaleString()
                    const isSelected = selectedConversation?.id === conversation.id
                    
                    return (
                      <Card 
                        key={conversation.id} 
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                        }`}
                        onClick={() => handleConversationClick(conversation)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {userName
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-foreground truncate">{userName}</p>
                                {conversation.unread_count && conversation.unread_count > 0 && (
                                  <Badge variant="default" className="text-xs">
                                    {conversation.unread_count}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{timeAgo}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </div>

            {/* Messages View */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {customerName
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase() || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {customerName || "Customer"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedConversation.participants?.find(p => p.id !== businessAccountId)?.id}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4">
                    {messagesLoading ? (
                      <div className="text-center py-8 text-muted-foreground">Loading messages...</div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No messages found</div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => {
                          // Check if message is from the business account (current user) or from a customer
                          // Business account messages appear on the right, customer messages on the left
                          const isFromBusiness = message.from?.id === businessAccountId
                          const senderName = isFromBusiness ? "You" : (message.from?.username || `User ${message.from?.id?.slice(-4)}`)
                          
                          return (
                            <div 
                              key={message.id} 
                              className={`flex ${isFromBusiness ? 'justify-end' : 'justify-start'} mb-4`}
                            >
                              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isFromBusiness 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted'
                              }`}>
                                <p className="text-sm font-medium mb-1">{senderName}</p>
                                <p className="text-sm">{message.message}</p>
                                <p className={`text-xs mt-1 ${
                                  isFromBusiness 
                                    ? 'text-primary-foreground/70' 
                                    : 'text-muted-foreground'
                                }`}>
                                  {new Date(message.created_time).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-muted-foreground">Select a conversation to view messages</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

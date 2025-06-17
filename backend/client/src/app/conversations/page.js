'use client'

import { useState, useEffect } from 'react'
import {
  useGetConversationsQuery,
  useGetConversationQuery,
  useSendMessageMutation,
  socket,
} from '@/store/messageSlice'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MessageSquare, Send } from 'lucide-react'

export default function Conversations() {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messageContent, setMessageContent] = useState('')
  const [messageStatus, setMessageStatus] = useState(null)
 const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id || 'fallback-user-id';// Replace with actual user or guide ID from auth
  const { data: conversationsData, isLoading: convLoading, isError: convError } = useGetConversationsQuery()
  const { data: conversationData, isLoading: msgLoading, isError: msgError } = useGetConversationQuery(
    { guideId: selectedConversation?.guideId },
    { skip: !selectedConversation }
  )
  const [sendMessage, { isLoading: isSendingMessage }] = useSendMessageMutation()

  // Join Socket.IO room for real-time updates
  useEffect(() => {
    socket.emit('join', userId)
    socket.on('connect', () => console.log('Connected to Socket.IO server'))
    socket.on('disconnect', () => console.log('Disconnected from Socket.IO server'))
    return () => {
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [userId])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      setMessageStatus({ type: 'error', message: 'Message cannot be empty' })
      return
    }

    try {
      await sendMessage({ guideId: selectedConversation.guideId, content: messageContent }).unwrap()
      setMessageStatus({ type: 'success', message: 'Message sent successfully!' })
      setMessageContent('')
    } catch (error) {
      setMessageStatus({ type: 'error', message: 'Failed to send message. Please try again.' })
    }
  }

  if (convLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (convError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error loading conversations</h2>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Your Conversations</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <Card className="md:col-span-1 shadow-md border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Conversations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-200px)]">
                {conversationsData?.conversations?.length ? (
                  conversationsData.conversations.map((conv) => (
                    <Button
                      key={conv.guideId}
                      variant="ghost"
                      className={`w-full justify-start text-left mb-2 p-4 rounded-lg ${
                        selectedConversation?.guideId === conv.guideId ? 'bg-blue-100' : ''
                      }`}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <div className="flex flex-col w-full">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">{conv.guideName}</span>
                          {conv.unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatDate(conv.lastMessageAt)}</p>
                      </div>
                    </Button>
                  ))
                ) : (
                  <p className="text-gray-600 text-center">No conversations found</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Conversation Messages */}
          <Card className="md:col-span-2 shadow-md border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">
                {selectedConversation ? `Chat with ${selectedConversation.guideName}` : 'Select a conversation'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedConversation ? (
                <>
                  <ScrollArea className="h-[calc(100vh-300px)] mb-4">
                    {msgLoading ? (
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    ) : msgError ? (
                      <p className="text-red-600 text-center">Error loading messages</p>
                    ) : (
                      conversationData?.messages?.length ? (
                        conversationData.messages.map((msg) => (
                          <div
                            key={msg._id}
                            className={`flex mb-4 ${
                              msg.sender === userId ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                msg.sender === userId
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-900'
                              }`}
                            >
                              <p>{msg.content}</p>
                              <p className="text-xs mt-1 opacity-75">
                                {formatDate(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600 text-center">No messages yet</p>
                      )
                    )}
                  </ScrollArea>
                  {messageStatus && (
                    <Alert variant={messageStatus.type === 'error' ? 'destructive' : 'default'} className="mb-4">
                      <AlertDescription>{messageStatus.message}</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex gap-2">
                    <Input
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      placeholder="Type your message..."
                      disabled={isSendingMessage}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isSendingMessage}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-gray-600 text-center">Select a conversation to view messages</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
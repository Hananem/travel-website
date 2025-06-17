'use client'

import { useState } from 'react'
import { useGetGuideByIdQuery } from '@/store/guideSlice'
import { useSendMessageMutation } from '@/store/messageSlice' // Import message slice
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input' // Add Input for message form
import { Label } from '@/components/ui/label' // Add Label for form
import { Alert, AlertDescription } from '@/components/ui/alert' // Add Alert for feedback
import {
  Star,
  User,
  MapPin,
  Globe,
  Calendar,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  MessageSquare,
} from 'lucide-react'
import { useParams } from 'next/navigation'

export default function GuidePage() {
  const [isContactVisible, setIsContactVisible] = useState(false)
  const [isMessageFormVisible, setIsMessageFormVisible] = useState(false) // State for message form
  const [messageContent, setMessageContent] = useState('') // State for message input
  const [messageStatus, setMessageStatus] = useState(null) // State for success/error feedback
  const { id } = useParams()
  const { data: guideData, isLoading, isError } = useGetGuideByIdQuery(id)
  const [sendMessage, { isLoading: isSendingMessage }] = useSendMessageMutation() // Hook to send message

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || ''
  }

  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      setMessageStatus({ type: 'error', message: 'Message cannot be empty' })
      return
    }

    try {
      await sendMessage({ guideId: id, content: messageContent }).unwrap()
      setMessageStatus({ type: 'success', message: 'Message sent successfully!' })
      setMessageContent('')
      setIsMessageFormVisible(false)
    } catch (error) {
      setMessageStatus({ type: 'error', message: 'Failed to send message. Please try again.' })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error loading guide</h2>
          <p className="text-gray-600">Please try again later</p>
        </div>
      </div>
    )
  }

  if (!guideData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Guide not found</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="mb-8">
          <Card className="overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32"></div>
            <CardContent className="relative pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 -mt-16 sm:-mt-12">
                <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                  <AvatarImage src={guideData.imageUrl} alt={guideData.name} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xl font-semibold">
                    {getInitials(guideData.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{guideData.name}</h1>
                      <p className="text-lg text-gray-600">Professional Tour Guide</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={guideData.isAvailable ? "default" : "secondary"}
                        className={`px-3 py-1 font-medium ${
                          guideData.isAvailable 
                            ? "bg-green-500 hover:bg-green-600 text-white" 
                            : "bg-gray-400 text-white"
                        }`}
                      >
                        {guideData.isAvailable ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Available
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-1" />
                            Unavailable
                          </>
                        )}
                      </Badge>
                      
                      <Badge variant="outline" className="px-3 py-1 border-blue-200 text-blue-700 bg-blue-50">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        {guideData.experienceYears} Years Experience
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Section */}
            <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <User className="w-5 h-5 text-blue-600" />
                  About Me
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{guideData.bio}</p>
              </CardContent>
            </Card>

            {/* Destinations Section */}
            <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Destinations & Tours
                </CardTitle>
                <CardDescription>
                  Specialized tour experiences I offer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {guideData.destinations?.map((destination, index) => (
                    <div 
                      key={destination._id || index}
                      className="p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:shadow-md transition-shadow"
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">{destination.name}</h3>
                      <p className="text-gray-600 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {destination.destination}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Languages Section */}
            <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Languages
                </CardTitle>
                <CardDescription>
                  Languages I can communicate in
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {guideData.languages?.map((language, index) => (
                    <Badge 
                      key={index}
                      variant="secondary" 
                      className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      {language}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setIsContactVisible(!isContactVisible)}
                >
                  {isContactVisible ? "Hide Contact" : "Show Contact"}
                </Button>
                
                {isContactVisible && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium text-gray-900 truncate">{guideData.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-900">{guideData.phone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message Guide Button */}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsMessageFormVisible(!isMessageFormVisible)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {isMessageFormVisible ? 'Hide Message Form' : 'Message Guide'}
                </Button>

                {/* Message Form */}
                {isMessageFormVisible && (
                  <div className="space-y-3 pt-2">
                    {messageStatus && (
                      <Alert variant={messageStatus.type === 'error' ? 'destructive' : 'default'}>
                        <AlertDescription>{messageStatus.message}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Input
                        id="message"
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        placeholder="Type your message here..."
                        disabled={isSendingMessage}
                      />
                    </div>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={handleSendMessage}
                      disabled={isSendingMessage}
                    >
                      {isSendingMessage ? 'Sending...' : 'Send Message'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Profile Details */}
            <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Profile Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Member Since</p>
                    <p className="font-medium text-gray-900">{formatDate(guideData.createdAt)}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Experience</p>
                    <p className="font-medium text-gray-900">{guideData.experienceYears} Years</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="text-center pt-2">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Book This Guide
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
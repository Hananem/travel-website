import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Heart, Star, ThumbsUp, MessageCircle } from "lucide-react"

export default function Component() {
  return (
    <div className="min-h-screen bg-white p-8 flex items-center justify-center">
      <div className="flex flex-col lg:flex-row gap-12 max-w-7xl w-full items-center justify-center">
        
        {/* === TEXT AND NUMBERS SIDE === */}
        <div className="flex flex-col items-start max-w-md w-full text-center lg:text-left">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Discover New Adventures</h1>
          <p className="text-gray-600 mb-6">
            Join thousands of travelers in exploring breathtaking places around the world.
          </p>

          {/* 2x2 grid of numbers */}
          <div className="grid grid-cols-2 gap-6 w-full">
            <div>
              <span className="text-3xl font-bold text-blue-600">1,200+</span>
              <p className="text-sm text-gray-500">Tours</p>
            </div>
            <div>
              <span className="text-3xl font-bold text-green-600">80+</span>
              <p className="text-sm text-gray-500">Countries</p>
            </div>
            <div>
              <span className="text-3xl font-bold text-yellow-500">98%</span>
              <p className="text-sm text-gray-500">Satisfaction</p>
            </div>
            <div>
              <span className="text-3xl font-bold text-pink-500">500K</span>
              <p className="text-sm text-gray-500">Travelers</p>
            </div>
          </div>
        </div>

        {/* === CARD LAYOUT SIDE === */}
        <div className="relative w-full max-w-4xl h-96">
          {/* Main center card */}
          <Card className="absolute top-8 left-1/2 transform -translate-x-1/2 w-80 h-64 overflow-hidden shadow-2xl z-30 rotate-2">
            <div className="relative w-full h-full">
              <Image
                src="/img1.png"
                alt="Friends hanging out"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-4 right-4 bg-white rounded-full p-2 shadow-lg">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              </div>
              <div className="absolute bottom-4 left-4 right-16 bg-white/20 rounded-full h-2">
                <div className="bg-white rounded-full h-full w-3/4"></div>
              </div>
            </div>
          </Card>

          {/* Left card */}
          <Card className="absolute top-0 left-8 w-72 h-80 overflow-hidden shadow-xl z-20 -rotate-12">
            <div className="relative w-full h-full">
              <Image src="/img2.png" alt="Portrait" fill className="object-cover" />
              <div className="absolute top-4 right-4 flex gap-2">
                <div className="bg-purple-500 rounded-full p-2">
                  <Star className="w-4 h-4 text-white fill-white" />
                </div>
                <div className="bg-orange-500 rounded-full p-2">
                  <span className="text-white text-sm">😊</span>
                </div>
              </div>
              <div className="absolute bottom-8 -left-4 bg-gradient-to-r from-red-500 to-pink-500 rounded-full p-4 shadow-lg">
                <Heart className="w-8 h-8 text-white fill-white" />
              </div>
            </div>
          </Card>

          {/* Right card */}
          <Card className="absolute top-4 right-8 w-64 h-72 overflow-hidden shadow-xl z-25 rotate-12">
            <div className="relative w-full h-full">
              <Image src="/img3.png" alt="Group photo" fill className="object-cover" />
              <div className="absolute top-4 right-4 bg-green-500 rounded-full px-3 py-1 flex items-center gap-1">
                <Star className="w-4 h-4 text-white fill-white" />
                <span className="text-white text-sm font-medium">✓</span>
              </div>
              <div className="absolute bottom-4 right-4 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-4 border-white shadow-lg overflow-hidden">
                <Image src="/placeholder.svg?height=48&width=48" alt="Food" fill className="object-cover" />
              </div>
            </div>
          </Card>

          {/* Floating reactions */}
          <div className="absolute top-12 left-1/4 bg-white rounded-full p-3 shadow-lg z-40 animate-bounce">
            <ThumbsUp className="w-5 h-5 text-blue-500" />
          </div>
          <div className="absolute bottom-12 right-1/4 bg-gradient-to-r from-pink-500 to-red-500 rounded-full p-3 shadow-lg z-40">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div className="absolute top-1/3 right-12 bg-yellow-400 rounded-full p-2 shadow-lg z-35">
            <span className="text-lg">⭐</span>
          </div>
          <div className="absolute bottom-1/4 left-16 bg-purple-500 rounded-full p-2 shadow-lg z-35">
            <span className="text-white text-lg">💜</span>
          </div>
          <div className="absolute top-20 right-1/3 text-red-500 text-2xl z-40 animate-pulse">❤️</div>
          <div className="absolute bottom-20 left-1/3 text-pink-500 text-xl z-40">💕</div>
        </div>
      </div>
    </div>
  )
}


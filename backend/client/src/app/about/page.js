'use client';

import Image from 'next/image';
import { Globe, Users, Award, Shield } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-blue-600 to-teal-500">
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Story</h1>
            <p className="text-xl text-white max-w-2xl mx-auto">
              Discovering the world, one adventure at a time
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Who We Are</h2>
          <div className="w-24 h-1 bg-teal-500 mx-auto"></div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Our Journey</h3>
            <p className="text-gray-600 mb-4">
              Founded in 2015 by a group of passionate travelers, TravelEase began as a small blog sharing 
              off-the-beaten-path destinations. What started as a hobby quickly grew into a trusted resource 
              for thousands of travelers worldwide.
            </p>
            <p className="text-gray-600 mb-6">
              Today, we're a team of 50+ travel experts, writers, and local guides dedicated to helping you 
              discover authentic travel experiences that go beyond the typical tourist attractions.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center">
                <Globe className="h-6 w-6 text-teal-500 mr-2" />
                <span className="font-medium">50+ Countries</span>
              </div>
              <div className="flex items-center">
                <Users className="h-6 w-6 text-teal-500 mr-2" />
                <span className="font-medium">500K+ Travelers</span>
              </div>
              <div className="flex items-center">
                <Award className="h-6 w-6 text-teal-500 mr-2" />
                <span className="font-medium">15 Awards</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-6 w-6 text-teal-500 mr-2" />
                <span className="font-medium">100% Verified</span>
              </div>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden shadow-lg">
            <Image 
              src="/team.png" 
              alt="Our team on a hiking trip"
              width={600}
              height={400}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Values</h2>
            <div className="w-24 h-1 bg-teal-500 mx-auto"></div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="bg-teal-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <Globe className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Sustainable Travel</h3>
              <p className="text-gray-600">
                We promote eco-friendly practices and support local communities to ensure tourism benefits everyone.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="bg-teal-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Authentic Experiences</h3>
              <p className="text-gray-600">
                We connect you with genuine local experiences that most travelers never discover.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="bg-teal-100 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Trust & Safety</h3>
              <p className="text-gray-600">
                Your safety is our priority. All our partners and recommendations are thoroughly vetted.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team CTA */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-xl p-8 md:p-12 text-white">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Join Our Team</h2>
              <p className="mb-6">
                Passionate about travel? We're always looking for talented writers, photographers, and 
                travel experts to join our growing team.
              </p>
              <button className="bg-white text-teal-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                View Open Positions
              </button>
            </div>
            <div className="flex justify-center">
              <div className="relative w-64 h-64">
                <div className="absolute -top-4 -left-4 w-64 h-64 border-4 border-white/30 rounded-xl"></div>
                <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <span className="text-lg font-medium">Your Adventure Starts Here</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
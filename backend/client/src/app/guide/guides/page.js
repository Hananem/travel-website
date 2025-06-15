// app/guides/page.js
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetGuidesQuery } from '@/store/guideSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Phone, Mail, MapPin, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

export default function GuidesPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const { data, isLoading, error } = useGetGuidesQuery({ page, limit });

  if (isLoading) return <div className="text-center py-12">Loading guides...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Error loading guides</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Our Expert Guides</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Meet our professional guides who will make your travel experience unforgettable
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {data?.guides?.map((guide) => (
          <Card key={guide._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <div className="relative">
                {guide.imageUrl ? (
                  <img
                    src={guide.imageUrl}
                    alt={guide.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                    <User className="w-20 h-20 text-gray-400" />
                  </div>
                )}
                <Badge
                  variant={guide.isAvailable ? "default" : "destructive"}
                  className="absolute top-2 right-2"
                >
                  {guide.isAvailable ? "Available" : "Booked"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <CardTitle className="text-xl">{guide.name}</CardTitle>
                <div className="flex items-center">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span>4.8</span> {/* You can replace with actual rating */}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-gray-600">
                    {guide.destinations?.length || 0} destinations
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <User className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-gray-600">
                    {guide.experienceYears} {guide.experienceYears === 1 ? 'year' : 'years'} experience
                  </span>
                </div>

                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-gray-600 truncate">{guide.email}</span>
                </div>

                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 mr-2 text-gray-500" />
                  <span className="text-gray-600">{guide.phone}</span>
                </div>
              </div>

              <Button
                className="w-full mt-6"
                onClick={() => router.push(`/guide/${guide._id}`)}
              >
                View Profile
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {data?.pagination?.totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-4">
                Page {page} of {data?.pagination?.totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data?.pagination?.totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
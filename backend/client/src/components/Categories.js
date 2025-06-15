"use client";

import React from 'react';
import { useGetAllCategoriesQuery } from '@/store/categorySlice';

const Categories = () => {
  const { data: categories, error, isLoading } = useGetAllCategoriesQuery();

  if (isLoading) return <div className="text-center py-8">Loading categories...</div>;

  if (error) return (
    <div className="text-center py-8 text-red-600">
      Failed to load categories: {error.data?.error || error.message}
    </div>
  );

  if (!categories) return (
    <div className="text-center py-8 text-gray-500">
      No categories available
    </div>
  );

  // Normalize categories to an array
  const categoriesArray = Array.isArray(categories) ? categories : [categories];

  if (!categoriesArray.length) return (
    <div className="text-center py-8 text-gray-500">
      No categories available
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Categories</h2>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Text Section */}
        <div className="md:w-1/3">
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Explore Travel Categories</h3>
            <p className="text-gray-600">
              Discover a world of adventures through our curated travel categories. 
              From serene beaches to thrilling mountain treks, find the perfect 
              destination that matches your wanderlust. Browse our categories to 
              uncover unique experiences and start planning your next journey today!
            </p>
          </div>
        </div>

        {/* Slider Section */}
        <div className="md:w-2/3">
          <div className="relative">
            <div className="flex overflow-x-auto pb-6 -mx-4 px-4 scrollbar-hide">
              <div className="flex space-x-4">
                {categoriesArray.map((category) => (
                  <div 
                    key={category._id}
                    className="group relative h-48 w-16 hover:w-40 flex-shrink-0 transition-all duration-300"
                  >
                    <div className="absolute inset-0 overflow-hidden rounded-lg shadow-md">
                      {category.imageUrl && (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end">
                        <h3 className="font-bold text-white text-sm truncate">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-white/80 text-xs line-clamp-2">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
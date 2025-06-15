
'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Image as ImageIcon, X } from 'lucide-react';
import { useAddItemMutation } from '@/store/apiSlice';
import { useGetAllCategoriesQuery } from '@/store/categorySlice';

export default function CreateItem() {
  const [addItem, { isLoading }] = useAddItemMutation();
  const { data: categories, error: categoriesError, isLoading: isCategoriesLoading } = useGetAllCategoriesQuery();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    destination: '',
    duration: 1,
    price: 0,
    categoryId: '', // Store category ObjectId
    availableSpots: 0,
    isAvailable: true,
    image: null,
    imagePreview: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: reader.result
      }));
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null,
      imagePreview: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim() || !formData.destination.trim() || !formData.categoryId) {
      setError('Name, Destination, and Category are required');
      return;
    }

    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('description', formData.description);
      formPayload.append('destination', formData.destination);
      formPayload.append('duration', formData.duration.toString());
      formPayload.append('price', formData.price.toString());
      formPayload.append('categoryId', formData.categoryId); // Send categoryId
      formPayload.append('availableSpots', formData.availableSpots.toString());
      formPayload.append('isAvailable', formData.isAvailable.toString());
      if (formData.image) {
        formPayload.append('image', formData.image);
      }

      await addItem(formPayload).unwrap();
      router.push('/items');
    } catch (err) {
      console.error('Creation error:', err);
      setError(err.data?.message || 'Failed to create item');
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <div className="flex items-center mb-6">
        <Link 
          href="/items" 
          className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Create New Tour Package</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {categoriesError && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            Failed to load categories: {categoriesError.data?.error || categoriesError.message}
          </div>
        )}

        {/* Image Upload Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Tour Image
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            <div 
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-blue-300 transition-colors
                ${formData.imagePreview ? 'w-1/3' : 'w-full'}`}
              onClick={() => fileInputRef.current.click()}
            >
              {formData.imagePreview ? (
                <div className="relative h-full">
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeImage(); }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full py-8">
                  <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">
                    Click to upload an image
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Recommended size: 800x600px (max 2MB)
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="hidden"
              />
            </div>

            {!formData.imagePreview && (
              <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500 text-center">
                  A high-quality image will make your tour package more attractive to potential customers.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Basic Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Tour Name *
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="e.g., Bali Adventure Tour"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Destination *
            </label>
            <input
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="e.g., Bali, Indonesia"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the tour experience..."
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isCategoriesLoading || categoriesError}
            >
              <option value="">Select a category</option>
              {isCategoriesLoading ? (
                <option disabled>Loading categories...</option>
              ) : categories && categories.length > 0 ? (
                categories.map(category => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))
              ) : (
                <option disabled>No categories available</option>
              )}
            </select>
          </div>
        </div>

        {/* Pricing and Availability Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Duration (days)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Price ($)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Available Spots
            </label>
            <input
              type="number"
              name="availableSpots"
              value={formData.availableSpots}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isAvailable"
            name="isAvailable"
            checked={formData.isAvailable}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
            This tour is currently available for booking
          </label>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading || isCategoriesLoading || categoriesError}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors
              ${isLoading || isCategoriesLoading || categoriesError ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Tour...
              </span>
            ) : 'Create Tour Package'}
          </button>
        </div>
      </form>
    </div>
  );
}

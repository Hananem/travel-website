'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAddItemMutation } from '@/store/apiSlice';

export default function CreateItem() {
  const [addItem, { isLoading }] = useAddItemMutation();
  const router = useRouter();

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    destination: '',
    duration: 1,
    price: 0,
    category: 'Tour',
    availableSpots: 0,
    isAvailable: true,
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewItem((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newItem.name.trim() || !newItem.destination.trim()) {
      setError('Name and Destination are required');
      return;
    }

    try {
      await addItem(newItem).unwrap();
      router.push('/items');
    } catch (err) {
      console.error('Error adding item:', err);
      setError('Failed to add item: ' + (err.data?.message || err.message));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <Link href="/items" className="mr-4 text-gray-600 hover:text-gray-900">
          &larr; Back
        </Link>
        <h1 className="text-2xl font-bold">Create New Item</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-gray-700">Name *</label>
          <input
            name="name"
            value={newItem.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            value={newItem.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Destination *</label>
          <input
            name="destination"
            value={newItem.destination}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (days)</label>
            <input
              type="number"
              name="duration"
              value={newItem.duration}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price ($)</label>
            <input
              type="number"
              name="price"
              value={newItem.price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Available Spots</label>
            <input
              type="number"
              name="availableSpots"
              value={newItem.availableSpots}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAvailable"
              name="isAvailable"
              checked={newItem.isAvailable}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
              Available for booking
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isLoading ? 'Creating...' : 'Create Item'}
        </button>
      </form>
    </div>
  );
}
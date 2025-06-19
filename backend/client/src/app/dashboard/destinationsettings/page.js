'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Edit, Trash2 } from 'lucide-react';
import CreateItem from '@/components/CreateItem';
import { 
  useGetItemsQuery,
  useUpdateItemMutation,
  useDeleteItemMutation 
} from '@/store/apiSlice';

export default function DestinationSettings() {
  const router = useRouter();
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Fetch destinations by filtering items with category 'destination'
  const { data: response, isLoading, isError, error } = useGetItemsQuery({
    category: 'destination'
  });
  const destinations = response?.items || [];

  const [updateDestination] = useUpdateItemMutation();
  const [deleteDestination] = useDeleteItemMutation();

  const handleEdit = (destination) => {
    setEditingId(destination._id);
    setShowCreateForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this destination?')) {
      try {
        await deleteDestination(id).unwrap();
        router.refresh();
      } catch (err) {
        console.error('Failed to delete destination:', err);
      }
    }
  };

  const handleSubmitSuccess = () => {
    setEditingId(null);
    setShowCreateForm(false);
    router.refresh();
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowCreateForm(false);
  };

  if (isLoading) return <div>Loading destinations...</div>;
  if (isError) return <div>Error loading destinations: {error.message}</div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard" className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Manage Destinations</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add New Destination
        </button>
      </div>

     
        <div className="mb-8">
          <CreateItem 
          
          />
        </div>
     

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Name</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Location</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {destinations.map((destination) => (
                <tr key={destination._id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      {destination.imageUrl && (
                        <img 
                          src={destination.imageUrl} 
                          alt={destination.name} 
                          className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                      )}
                      {destination.name}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{destination.destination}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">${destination.price}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
                      ${destination.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {destination.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(destination)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(destination._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
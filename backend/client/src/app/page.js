'use client';

import { useState, useEffect } from 'react';
import { 
  useGetItemsQuery, 
  useGetItemsWithFiltersQuery,
  useDeleteItemMutation, 
  useUpdateItemMutation 
} from '@/store/apiSlice';
import { useRouter } from 'next/navigation';
import Component from "@/components/Component";
import CountrySliderWithText from "@/components/CountrySliderWithText";
import { Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import BookingForm from '@/components/BookingForm'; 
import Categories from '@/components/Categories'; 
import CreateCategory from '@/components/CreateCategory'; 

export default function ItemsList() {
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const router = useRouter();
  // Filter state
  const [filters, setFilters] = useState({
    category: '',
    destination: '',
    isAvailable: undefined,
    minPrice: '',
    maxPrice: '',
    minDuration: '',
    maxDuration: '',
    search: '',
    sortBy: 'createdAt:desc'
  });
  
  // Advanced filters toggle
  const [useAdvancedFilters, setUseAdvancedFilters] = useState(false);

  // Booking modal state
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Get the appropriate query based on filter mode
  const basicQuery = useGetItemsQuery({
    page,
    limit,
    category: filters.category,
    destination: filters.destination,
    isAvailable: filters.isAvailable
  });

  const advancedQuery = useGetItemsWithFiltersQuery({
    page,
    limit,
    ...filters
  });

  const { data, isLoading, error, refetch } = useAdvancedFilters ? advancedQuery : basicQuery;

  console.log("Fetched data:", data);  

  // Modal states for delete and update
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateData, setUpdatedData] = useState({
    name: '',
    description: '',
    destination: '',
    duration: 1,
    price: 0,
    category: '',
    availableSpots: 0,
    isAvailable: true,
    imageUrl: ''
  });

  const [deleteItem] = useDeleteItemMutation();
  const [updateItem] = useUpdateItemMutation();

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filters, useAdvancedFilters]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: '',
      destination: '',
      isAvailable: undefined,
      minPrice: '',
      maxPrice: '',
      minDuration: '',
      maxDuration: '',
      search: '',
      sortBy: 'createdAt:desc'
    });
    setPage(1);
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const handleUpdateClick = (item) => {
    setSelectedItem(item);
    setUpdatedData({
      name: item.name || '',
      description: item.description || '',
      destination: item.destination || '',
      duration: item.duration || 1,
      price: item.price || 0,
      category: item.category?._id || item.category || '', // Use category ID
      availableSpots: item.availableSpots || 0,
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      imageUrl: item.imageUrl || ''
    });
    setUpdateModalOpen(true);
  };

  const handleBookingClick = (item) => {
    setSelectedItem(item);
    setBookingModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteItem(selectedItem._id).unwrap();
      setDeleteModalOpen(false);
      refetch();
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateItem({
        id: selectedItem._id,
        ...updateData
      }).unwrap();
      setUpdateModalOpen(false);
      refetch();
    } catch (err) {
      console.error('Failed to update item:', err);
    }
  };

  const handleUpdateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUpdatedData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked :
              (type === 'number' ? (value === '' ? '' : Number(value)) : value)
    }));
  };

  if (isLoading) return <p className="text-center py-8">Loading...</p>;
  if (error) return (
    <div className="text-center py-8 text-red-500">
      Error: {error.data?.error || error.message || 'Unknown error'}
      <Button onClick={refetch} variant="outline" className="mt-4">Retry</Button>
    </div>
  );

  const itemsArray = Array.isArray(data?.items) ? data?.items : data?.items ? [data.items] : [];

  return (
    <div className="">
      <div
        className="relative min-h-screen "
        
      >
          <video
    autoPlay
    loop
    muted
    playsInline
    className="absolute w-full h-full object-cover"
  >
    <source src="/hero.mp4" type="video/mp4" />
    Your browser does not support the video tag.
  </video>
        <section className="h-screen flex items-center justify-center text-white text-center bg-black/40 backdrop-brightness-50">
          <div>
            <h1 className="text-5xl md:text-6xl font-extrabold drop-shadow-md">
              Discover Your Next Adventure
            </h1>
            <p className="mt-6 text-xl md:text-2xl max-w-xl mx-auto drop-shadow">
              Explore breathtaking destinations, unforgettable journeys, and create memories that last a lifetime.
            </p>
            <div className="mt-8">
              <button className="px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition">
                Start Exploring
              </button>
            </div>
          </div>
        </section>

       
      </div>
       <Component />
        <CountrySliderWithText />
      <Categories />
      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Filters</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => setUseAdvancedFilters(!useAdvancedFilters)}
              className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
            >
              {useAdvancedFilters ? 'Basic Filters' : 'Advanced Filters'}
            </button>
            <button
              onClick={handleResetFilters}
              className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Tour, Gear, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Destination</label>
            <input
              type="text"
              name="destination"
              value={filters.destination}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Country or city"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="isAvailable"
              checked={filters.isAvailable || false}
              onChange={(e) => setFilters(prev => ({
                ...prev,
                isAvailable: e.target.checked ? true : undefined
              }))}
              className="h-5 w-5"
            />
            <label>Available Only</label>
          </div>
        </div>

        {useAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Min Price</label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="$0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Price</label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="$1000.00"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Min Duration (days)</label>
              <input
                type="number"
                name="minDuration"
                value={filters.minDuration}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="1"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Duration (days)</label>
              <input
                type="number"
                name="maxDuration"
                value={filters.maxDuration}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="30"
                min="1"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Search</label>
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Search by name or description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="createdAt:desc">Newest First</option>
                <option value="createdAt:asc">Oldest First</option>
                <option value="price:asc">Price: Low to High</option>
                <option value="price:desc">Price: High to Low</option>
                <option value="duration:asc">Duration: Short to Long</option>
                <option value="duration:desc">Duration: Long to Short</option>
                <option value="name:asc">Name: A-Z</option>
                <option value="name:desc">Name: Z-A</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results and Pagination */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-sm text-gray-600">
            Showing {itemsArray.length} of {data?.pagination?.totalItems || 0} items
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm">Items per page:</span>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-2 py-1 border rounded-md"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">
              Page {page} of {data?.pagination?.totalPages || 1}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= (data?.pagination?.totalPages || 1)}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete "{selectedItem?.name}"?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {updateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-auto">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Update Item</h2>
            <form onSubmit={handleUpdateSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={updateData.name}
                  onChange={handleUpdateChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={updateData.description}
                  onChange={handleUpdateChange}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Destination *</label>
                <input
                  type="text"
                  name="destination"
                  value={updateData.destination}
                  onChange={handleUpdateChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (days)</label>
                  <input
                    type="number"
                    name="duration"
                    min="1"
                    value={updateData.duration}
                    onChange={handleUpdateChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price</label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={updateData.price}
                    onChange={handleUpdateChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Category ID</label>
                <input
                  type="text"
                  name="category"
                  value={updateData.category}
                  onChange={handleUpdateChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Enter category ID"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Available Spots</label>
                  <input
                    type="number"
                    name="availableSpots"
                    min="0"
                    value={updateData.availableSpots}
                    onChange={handleUpdateChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={updateData.isAvailable}
                    onChange={handleUpdateChange}
                    className="h-5 w-5"
                  />
                  <label>Is Available</label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={updateData.imageUrl}
                  onChange={handleUpdateChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setUpdateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {bookingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Book {selectedItem?.name}</h2>
            <BookingForm
              itemId={selectedItem?._id}
              itemPrice={selectedItem?.price}
              itemName={selectedItem?.name}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setBookingModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      {itemsArray.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {itemsArray.map((item) => (
            <Card key={item._id} className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 bg-white">
              <div className="relative overflow-hidden">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = '/path/to/fallback-image.jpg';
                      e.target.onerror = null;
                    }}
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-500">No image</p>
                    </div>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                  <span className={`text-sm font-semibold ${item.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    {item.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 bg-sky-500 text-white px-4 py-2 rounded-full font-bold text-lg">
                  ${item.price.toFixed(2)}
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{item.duration} days</span>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed line-clamp-2">
                  {item.description}
                </p>
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Details:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="bg-sky-100 text-sky-700 text-xs px-2 py-1 rounded-full">
                      {item.destination}
                    </span>
                    <span className="bg-sky-100 text-sky-700 text-xs px-2 py-1 rounded-full">
                      {item.availableSpots} spots
                    </span>
                    <span className="bg-sky-100 text-sky-700 text-xs px-2 py-1 rounded-full">
                      {item.category?.name || item.category || 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">ID: {item._id.slice(-6)}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => handleUpdateClick(item)}
                      variant="outline"
                      className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                    >
                      Update
                    </Button>
                    <Button 
                      onClick={() => handleDeleteClick(item)}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    >
                      Delete
                    </Button>
                    <Button 
                      onClick={() => handleBookingClick(item)}
                      variant="outline"
                      className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                      disabled={!item.isAvailable}
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-white shadow-sm">
          <p className="text-gray-500 text-lg mb-4">No items found matching your filters</p>
          <Button 
            onClick={handleResetFilters}
            variant="outline"
            className="px-8 py-3 text-lg border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white"
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Bottom Pagination */}
      {data?.pagination?.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              First
            </button>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (data.pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= data.pagination.totalPages - 2) {
                pageNum = data.pagination.totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1 border rounded-md ${page === pageNum ? 'bg-blue-600 text-white' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= data.pagination.totalPages}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Next
            </button>
            <button
              onClick={() => setPage(data.pagination.totalPages)}
              disabled={page >= data.pagination.totalPages}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
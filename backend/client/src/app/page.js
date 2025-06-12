'use client';

import { useState, useEffect } from 'react';
import { 
  useGetItemsQuery, 
  useGetItemsWithFiltersQuery,
  useDeleteItemMutation, 
  useUpdateItemMutation 
} from '@/store/apiSlice';
import { useRouter } from 'next/navigation';
import Component from "@/components/Component"
import CountrySliderWithText from "@/components/CountrySliderWithText"
export default function ItemsList() {
  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Query selection
  const [useAdvancedFilters, setUseAdvancedFilters] = useState(false);

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

  const { data, isLoading, error, refetch } = 
    useAdvancedFilters ? advancedQuery : basicQuery;

  console.log("Fetched data:", data);  

  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    name: '',
    description: '',
    destination: '',
    duration: 1,
    price: 0,
    category: 'Tour',
    availableSpots: 0,
    isAvailable: true,
    imageUrl: ''
  });

  const [deleteItem] = useDeleteItemMutation();
  const [updateItem] = useUpdateItemMutation();
  const router = useRouter();

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
      category: item.category || 'Tour',
      availableSpots: item.availableSpots || 0,
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      imageUrl: item.imageUrl || ''
    });
    setUpdateModalOpen(true);
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
        ...updatedData
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
  if (error) return <p className="text-center py-8 text-red-500">Error loading data</p>;

  return (
    <div className="">
       <div
      className="relative min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/bg.png')" }}
    >
      {/* Navbar is already fixed and rendered in RootLayout */}
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

<Component />
<CountrySliderWithText />

    </div>
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

        {/* Basic Filters */}
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

        {/* Advanced Filters */}
        {useAdvancedFilters && (
          <>
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
          </>
        )}
      </div>

      {/* Results and Pagination */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-sm text-gray-600">
            Showing {data?.items?.length || 0} of {data?.pagination?.totalItems || 0} items
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
                  value={updatedData.name}
                  onChange={handleUpdateChange}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  value={updatedData.description}
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
                  value={updatedData.destination}
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
                    value={updatedData.duration}
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
                    value={updatedData.price}
                    onChange={handleUpdateChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Category</label>
                <input
                  type="text"
                  name="category"
                  value={updatedData.category}
                  onChange={handleUpdateChange}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Tour, Gear, Experience..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Available Spots</label>
                  <input
                    type="number"
                    name="availableSpots"
                    min="0"
                    value={updatedData.availableSpots}
                    onChange={handleUpdateChange}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>

                <div className="flex items-center space-x-2 mt-6">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={updatedData.isAvailable}
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
                  value={updatedData.imageUrl}
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

      {/* Items List */}
  {data?.items?.length > 0 ? (
  <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
    {data.items.map(item => (
      <div key={item._id} className="group relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 hover:border-gray-200">
        {/* Image Section */}
        <div className="relative h-48 w-full overflow-hidden">
          {item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.src = '/path/to/fallback-image.jpg';
                e.target.onerror = null;
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-500">No image</p>
              </div>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              item.isAvailable 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {item.isAvailable ? 'Available' : 'Unavailable'}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
              {item.name}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
              {item.description}
            </p>
          </div>
        
          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Destination</p>
                  <p className="text-sm font-medium text-gray-900">{item.destination}</p>
                </div>
              </div>
            
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Duration</p>
                  <p className="text-sm font-medium text-gray-900">{item.duration} days</p>
                </div>
              </div>
            </div>
          
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Price</p>
                  <p className="text-lg font-bold text-green-600">${item.price.toFixed(2)}</p>
                </div>
              </div>
            
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Available</p>
                  <p className="text-sm font-medium text-gray-900">{item.availableSpots} spots</p>
                </div>
              </div>
            </div>
          </div>
        
          {/* Category Tag */}
          <div className="pt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200">
              {item.category}
            </span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="px-6 pb-6 flex space-x-3">
          <button
            onClick={() => handleUpdateClick(item)}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-[1.02] transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Update
          </button>
          <button
            onClick={() => handleDeleteClick(item)}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transform hover:scale-[1.02] transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Delete
          </button>
        </div>
      </div>
    ))}
  </div>
) : (
  <div className="text-center py-12 border rounded-lg bg-gray-50">
    <p className="text-gray-500">No items found matching your filters</p>
    <button
      onClick={handleResetFilters}
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
    >
      Reset Filters
    </button>
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
            
            {/* Page numbers */}
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

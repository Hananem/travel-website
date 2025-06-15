import { useState } from 'react';
import { useCreateBookingMutation } from '@/store/bookingSlice';

const BookingForm = ({ itemId, itemPrice, itemName }) => {
  const [createBooking, { isLoading, error }] = useCreateBookingMutation();
  
  const [formData, setFormData] = useState({
    bookingDate: '',
    numberOfPeople: 1,
    customerInfo: {
      fullName: '',
      phone: '',
      email: '',
      specialRequests: ''
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await createBooking({
        itemId,
        ...formData
      }).unwrap();
      
      console.log('Booking created:', result);
      alert('Booking created successfully!');
      
      // Reset form or redirect
      setFormData({
        bookingDate: '',
        numberOfPeople: 1,
        customerInfo: {
          fullName: '',
          phone: '',
          email: '',
          specialRequests: ''
        }
      });
    } catch (err) {
      console.error('Failed to create booking:', err);
      alert('Failed to create booking. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('customerInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        customerInfo: {
          ...prev.customerInfo,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const totalPrice = itemPrice * formData.numberOfPeople;

  return (
   <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Book {itemName}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-row items-center space-x-2">
          <label htmlFor="bookingDate" className="text-sm font-medium text-gray-700 w-1/3">
            Booking Date
          </label>
          <input
            id="bookingDate"
            type="date"
            name="bookingDate"
            value={formData.bookingDate}
            onChange={handleInputChange}
            required
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 w-2/3"
          />
        </div>

        <div className="flex flex-row items-center space-x-2">
          <label htmlFor="numberOfPeople" className="text-sm font-medium text-gray-700 w-1/3">
            Number of People
          </label>
          <input
            id="numberOfPeople"
            type="number"
            name="numberOfPeople"
            value={formData.numberOfPeople}
            onChange={handleInputChange}
            min="1"
            required
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 w-2/3"
          />
        </div>

        <div className="flex flex-row items-center space-x-2">
          <label htmlFor="fullName" className="text-sm font-medium text-gray-700 w-1/3">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            name="customerInfo.fullName"
            value={formData.customerInfo.fullName}
            onChange={handleInputChange}
            required
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 w-2/3"
          />
        </div>

        <div className="flex flex-row items-center space-x-2">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700 w-1/3">
            Phone
          </label>
          <input
            id="phone"
            type="tel"
            name="customerInfo.phone"
            value={formData.customerInfo.phone}
            onChange={handleInputChange}
            required
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 w-2/3"
          />
        </div>

        <div className="flex flex-row items-center space-x-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 w-1/3">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="customerInfo.email"
            value={formData.customerInfo.email}
            onChange={handleInputChange}
            required
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 w-2/3"
          />
        </div>

        <div className="flex flex-row items-start space-x-2">
          <label htmlFor="specialRequests" className="text-sm font-medium text-gray-700 w-1/3">
            Special Requests
          </label>
          <textarea
            id="specialRequests"
            name="customerInfo.specialRequests"
            value={formData.customerInfo.specialRequests}
            onChange={handleInputChange}
            rows="3"
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 w-2/3"
          />
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between">
            <span>Price per person:</span>
            <span>${itemPrice}</span>
          </div>
          <div className="flex justify-between">
            <span>Number of people:</span>
            <span>{formData.numberOfPeople}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total Price:</span>
            <span>${totalPrice}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Creating Booking...' : 'Book Now'}
        </button>

        {error && (
          <div className="text-red-600 text-sm">
            {error.data?.error || 'An error occurred while creating the booking'}
          </div>
        )}
      </form>
    </div>
  );
};

export default BookingForm;
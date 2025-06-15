import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const bookingSlice = createApi({
  reducerPath: 'bookingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:4000/api/',
    prepareHeaders: (headers, { getState }) => {
      const token = localStorage.getItem('token') || getState().auth?.token;// Access token from state.user.token
      if (token) {
        headers.set('Authorization', token); 
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Booking'],
  endpoints: (builder) => ({
    getBookings: builder.query({
      query: () => 'bookings',
      providesTags: ['Booking'],
    }),
    createBooking: builder.mutation({
      query: (bookingData) => ({
        url: 'bookings',
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Booking'],
    }),
    updateBooking: builder.mutation({
      query: ({ id, ...bookingData }) => ({
        url: `bookings/${id}`,
        method: 'PUT',
        body: bookingData,
      }),
      invalidatesTags: ['Booking'],
    }),
    deleteBooking: builder.mutation({
      query: (id) => ({
        url: `bookings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Booking'],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
} = bookingSlice;
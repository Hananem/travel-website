// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice';
import { authSlice } from './authSlice';
import { bookingSlice } from './bookingSlice';
import { guideSlice } from './guideSlice';
import { categorySlice } from './categorySlice'; // Add the new category slice

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [authSlice.reducerPath]: authSlice.reducer,
    [bookingSlice.reducerPath]: bookingSlice.reducer,
    [guideSlice.reducerPath]: guideSlice.reducer,
    [categorySlice.reducerPath]: categorySlice.reducer, // Add category reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      apiSlice.middleware, 
      authSlice.middleware, 
      bookingSlice.middleware, 
      guideSlice.middleware,
      categorySlice.middleware // Add category middleware
    ),
});

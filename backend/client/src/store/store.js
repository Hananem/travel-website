import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from './apiSlice';
import { authSlice } from './authSlice';
import { bookingSlice } from './bookingSlice';
import { guideSlice } from './guideSlice';
import { categorySlice } from './categorySlice';
import { messageSlice } from './messageSlice'; // Add message slice

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [authSlice.reducerPath]: authSlice.reducer,
    [bookingSlice.reducerPath]: bookingSlice.reducer,
    [guideSlice.reducerPath]: guideSlice.reducer,
    [categorySlice.reducerPath]: categorySlice.reducer,
    [messageSlice.reducerPath]: messageSlice.reducer, // Add message reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      apiSlice.middleware,
      authSlice.middleware,
      bookingSlice.middleware,
      guideSlice.middleware,
      categorySlice.middleware,
      messageSlice.middleware // Add message middleware
    ),
});

setupListeners(store.dispatch);
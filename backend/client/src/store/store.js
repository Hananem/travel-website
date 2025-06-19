import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { apiSlice } from './apiSlice';
import { authSlice } from './authSlice';
import { bookingSlice } from './bookingSlice';
import { guideSlice } from './guideSlice';
import { categorySlice } from './categorySlice';
import { messageSlice } from './messageSlice';
import { notificationSlice } from './notificationSlice'; // Import the notification slice

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [authSlice.reducerPath]: authSlice.reducer,
    [bookingSlice.reducerPath]: bookingSlice.reducer,
    [guideSlice.reducerPath]: guideSlice.reducer,
    [categorySlice.reducerPath]: categorySlice.reducer,
    [messageSlice.reducerPath]: messageSlice.reducer,
    [notificationSlice.reducerPath]: notificationSlice.reducer, // Add notification reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      apiSlice.middleware,
      authSlice.middleware,
      bookingSlice.middleware,
      guideSlice.middleware,
      categorySlice.middleware,
      messageSlice.middleware,
      notificationSlice.middleware // Add notification middleware
    ),
});

setupListeners(store.dispatch);
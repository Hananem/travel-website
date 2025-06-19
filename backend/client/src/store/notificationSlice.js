import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { io } from 'socket.io-client';

// Initialize Socket.IO client
const socket = io('http://localhost:4000'); // Backend URL

export const notificationSlice = createApi({
  reducerPath: 'notificationSlice',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:4000/api/notification',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', token); // Without 'Bearer' prefix
      }
      return headers;
    },
  }),
  tagTypes: ['Notifications'],
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => `/?page=${page}&limit=${limit}`,
      providesTags: ['Notifications'],
      async onCacheEntryAdded(
        arg,
        { cacheDataLoaded, cacheEntryRemoved, updateCachedData }
      ) {
        // Join the user's notification room
        const userId = localStorage.getItem('userId');
        if (userId) {
          socket.emit('join', userId);
        }

        await cacheDataLoaded;

        // Listen for new notifications
        socket.on('newNotification', (notification) => {
          updateCachedData((draft) => {
            if (draft) {
              draft.notifications.unshift(notification);
              draft.total += 1;
            }
          });
        });

        await cacheEntryRemoved;
        socket.off('newNotification');
      },
    }),
    markAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `/${notificationId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
      async onQueryStarted(notificationId, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(
            notificationSlice.util.updateQueryData(
              'getNotifications',
              undefined,
              (draft) => {
                const notification = draft?.notifications.find(
                  (n) => n._id === notificationId
                );
                if (notification) {
                  notification.read = true;
                }
              }
            )
          );
        } catch {}
      },
    }),
    deleteNotification: builder.mutation({
      query: (notificationId) => ({
        url: `/${notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
      async onQueryStarted(notificationId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          notificationSlice.util.updateQueryData(
            'getNotifications',
            undefined,
            (draft) => {
              if (draft) {
                draft.notifications = draft.notifications.filter(
                  (n) => n._id !== notificationId
                );
                draft.total -= 1;
              }
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useDeleteNotificationMutation,
} = notificationSlice;

// Export socket for component use
export { socket };
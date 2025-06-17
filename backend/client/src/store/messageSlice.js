import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { io } from 'socket.io-client';

// Initialize Socket.IO client
const socket = io('http://localhost:4000'); // Backend URL

export const messageSlice = createApi({
  reducerPath: 'messageSlice',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:4000/api/messages',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token'); // Your auth method
      if (token) {
        headers.set('Authorization', token);
      }
      return headers;
    },
  }),
  tagTypes: ['Messages', 'Conversations'],
  endpoints: (builder) => ({
    sendMessage: builder.mutation({
      query: ({ guideId, content }) => ({
        url: '/',
        method: 'POST',
        body: { guideId, content },
      }),
      invalidatesTags: ['Messages', 'Conversations'],
    }),
    getConversation: builder.query({
      query: ({ guideId, page = 1, limit = 20 }) => `/guides/${guideId}?page=${page}&limit=${limit}`,
      providesTags: ['Messages'],
      async onCacheEntryAdded(arg, { cacheDataLoaded, cacheEntryRemoved, updateCachedData }) {
        await cacheDataLoaded;
        socket.on('newMessage', (message) => {
          if (message.receiver === arg.guideId || message.sender === arg.guideId) {
            updateCachedData((draft) => {
              draft.messages.unshift(message);
            });
          }
        });
        await cacheEntryRemoved;
        socket.off('newMessage');
      },
    }),
    getConversations: builder.query({
      query: () => '/conversations',
      providesTags: ['Conversations'],
      async onCacheEntryAdded(arg, { cacheDataLoaded, cacheEntryRemoved, updateCachedData }) {
        await cacheDataLoaded;
        socket.on('newMessage', (message) => {
          updateCachedData((draft) => {
            const conv = draft.conversations.find(
              (c) => c.guideId === message.receiver || c.guideId === message.sender
            );
            if (conv) {
              conv.lastMessage = message.content;
              conv.lastMessageAt = message.createdAt;
              if (message.receiver === 'current-user-id') conv.unreadCount += 1; // Replace with user ID
            }
          });
        });
        await cacheEntryRemoved;
        socket.off('newMessage');
      },
    }),
  }),
});

export const {
  useSendMessageMutation,
  useGetConversationQuery,
  useGetConversationsQuery,
} = messageSlice;

// Export socket for component use
export { socket };
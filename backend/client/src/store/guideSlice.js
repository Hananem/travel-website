// src/store/guideSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const guideSlice = createApi({
  reducerPath: 'guideApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: 'http://localhost:4000/api/guides',
    prepareHeaders: (headers, { getState }) => {
      // Add auth token if available (without 'Bearer' prefix)
      const token = localStorage.getItem('token') ;
      if (token) {
        headers.set('Authorization', token); // Raw token without 'Bearer'
      }
      return headers;
    }
  }),
  tagTypes: ['Guide'],
  endpoints: (builder) => ({
    getGuides: builder.query({
      query: (params = {}) => {
        const { page = 1, limit = 10, ...filters } = params;
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString()
        });
        
        // Add filters if they exist
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            queryParams.append(key, value);
          }
        });
        
        return `/?${queryParams.toString()}`;
      },
      providesTags: (result) => 
        result 
          ? [
              ...result.guides.map(({ _id }) => ({ type: 'Guide', id: _id })),
              { type: 'Guide', id: 'LIST' },
            ]
          : [{ type: 'Guide', id: 'LIST' }]
    }),

    getGuideById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Guide', id }]
    }),

    createGuide: builder.mutation({
      query: (body) => ({
        url: '/',
        method: 'POST',
        body
      }),
      invalidatesTags: [{ type: 'Guide', id: 'LIST' }]
    }),

    updateGuide: builder.mutation({
      query: ({ id, body }) => ({
        url: `/${id}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Guide', id },
        { type: 'Guide', id: 'LIST' }
      ]
    }),

    deleteGuide: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Guide', id },
        { type: 'Guide', id: 'LIST' }
      ]
    })
  })
});

export const {
  useGetGuidesQuery,
  useGetGuideByIdQuery,
  useCreateGuideMutation,
  useUpdateGuideMutation,
  useDeleteGuideMutation
} = guideSlice;
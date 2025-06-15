// src/store/categorySlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const categorySlice = createApi({
  reducerPath: 'categoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:4000/api/categories',
    prepareHeaders: (headers, { getState }) => {
      // Add auth token if available (without 'Bearer' prefix)
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', token); // Raw token without 'Bearer'
      }
      return headers;
    }
  }),
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    // Get all categories (public)
    getAllCategories: builder.query({
      query: () => '/',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Category', id: _id })),
              { type: 'Category', id: 'LIST' },
            ]
          : [{ type: 'Category', id: 'LIST' }]
    }),

    // Get a single category by ID (public)
    getCategoryById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: 'Category', id }]
    }),

    // Create a new category with image upload (admin only)
    createCategory: builder.mutation({
      query: (formData) => ({
        url: '/',
        method: 'POST',
        body: formData, // FormData for file upload
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }]
    }),

    // Update a category with optional image upload (admin only)
    updateCategory: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/${id}`,
        method: 'PUT',
        body: formData, // FormData for file upload
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' }
      ]
    }),

    // Delete a category (admin only)
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' }
      ]
    })
  })
});

export const {
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation
} = categorySlice;
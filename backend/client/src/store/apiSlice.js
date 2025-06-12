import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:4000/api/' }),
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
  tagTypes: ['Item'],
  endpoints: (builder) => ({
    // GET all items with pagination and basic filtering
    getItems: builder.query({
      query: ({ 
        page = 1, 
        limit = 10, 
        category, 
        destination, 
        isAvailable 
      } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        
        if (category) params.append('category', category);
        if (destination) params.append('destination', destination);
        if (isAvailable !== undefined) params.append('isAvailable', isAvailable);
        
        return `items?${params.toString()}`;
      },
      providesTags: (result) => 
        result 
          ? [
              ...result.items.map(({ _id }) => ({ type: 'Item', id: _id })),
              { type: 'Item', id: 'LIST' },
            ]
          : [{ type: 'Item', id: 'LIST' }],
      transformResponse: (response) => ({
        
        items: response.items,
        pagination: response.pagination,
      }),
    }),

    // GET items with advanced filters, sorting, and pagination
    getItemsWithFilters: builder.query({
      query: ({ 
        page = 1, 
        limit = 10,
        category,
        destination,
        isAvailable,
        minPrice,
        maxPrice,
        minDuration,
        maxDuration,
        search,
        sortBy
      } = {}) => {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        
        if (category) params.append('category', category);
        if (destination) params.append('destination', destination);
        if (isAvailable !== undefined) params.append('isAvailable', isAvailable);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (minDuration) params.append('minDuration', minDuration);
        if (maxDuration) params.append('maxDuration', maxDuration);
        if (search) params.append('search', search);
        if (sortBy) params.append('sortBy', sortBy);
        
        return `items/filters?${params.toString()}`;
      },
      providesTags: (result) => 
        result 
          ? [
              ...result.items.map(({ _id }) => ({ type: 'Item', id: _id })),
              { type: 'Item', id: 'FILTERED_LIST' },
            ]
          : [{ type: 'Item', id: 'FILTERED_LIST' }],
      transformResponse: (response) => ({
        items: response.items,
        pagination: response.pagination,
      }),
    }),

    // GET single item by id
    getItemById: builder.query({
      query: (id) => `items/${id}`,
      providesTags: (result, error, id) => [{ type: 'Item', id }],
    }),

    // POST new item
    addItem: builder.mutation({
      query: (newItem) => ({
        url: 'items',
        method: 'POST',
        body: newItem,
      }),
      invalidatesTags: [{ type: 'Item', id: 'LIST' }, { type: 'Item', id: 'FILTERED_LIST' }],
    }),

    // PUT update item by id
    updateItem: builder.mutation({
      query: ({ id, ...updatedFields }) => ({
        url: `items/${id}`,
        method: 'PUT',
        body: updatedFields,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Item', id },
        { type: 'Item', id: 'LIST' },
        { type: 'Item', id: 'FILTERED_LIST' },
      ],
    }),

    // DELETE item by id
    deleteItem: builder.mutation({
      query: (id) => ({
        url: `items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Item', id: 'LIST' },
        { type: 'Item', id: 'FILTERED_LIST' },
      ],
    }),
  }),
});

export const {
  useGetItemsQuery,
  useGetItemsWithFiltersQuery,
  useGetItemByIdQuery,
  useAddItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
} = apiSlice;
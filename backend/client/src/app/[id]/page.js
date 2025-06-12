'use client';

import { useRouter, useParams } from 'next/navigation';
import { useGetItemByIdQuery } from '../../store/apiSlice';

export default function ItemById() {
  const params = useParams();
  const id = params.id;

  const { data, isLoading, error } = useGetItemByIdQuery(id);

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading data</p>;
  if (!data) return <p>No item found</p>;

  return (
    <div>
      <h2>{data.name}</h2>
      <p>{data.description}</p>
    </div>
  );
}
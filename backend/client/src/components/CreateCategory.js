// components/CreateCategory.js
"use client";

import { useState } from 'react';
import { useCreateCategoryMutation } from '@/store/categorySlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function CreateCategory() {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [createCategory] = useCreateCategoryMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (image) {
      formData.append('image', image);
    }

    toast.promise(
      createCategory(formData).unwrap(),
      {
        loading: 'Creating category...',
        success: () => {
          setName('');
          setDescription('');
          setImage(null);
          return 'Category created successfully';
        },
        error: (err) => {
          return err.data?.message || 'Failed to create category';
        },
        finally: () => {
          setIsLoading(false);
        }
      }
    );
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6 border rounded-lg">
      <h2 className="text-xl font-semibold">Create New Category</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="image">Image (optional)</Label>
          <Input
            id="image"
            type="file"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            accept="image/*"
          />
        </div>
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Category"}
        </Button>
      </form>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { 
  useGetAllCategoriesQuery, 
  useUpdateCategoryMutation, 
  useDeleteCategoryMutation 
} from '@/store/categorySlice';
import CreateCategory from '@/components/CreateCategory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function CategorySettings() {
  const { data: categories, isLoading, error, refetch } = useGetAllCategoriesQuery();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  // State for update modal
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [updateData, setUpdateData] = useState({
    name: '',
    description: '',
    image: null,
  });

  // State for delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const handleUpdateClick = (category) => {
    setSelectedCategory(category);
    setUpdateData({
      name: category.name || '',
      description: category.description || '',
      image: null,
    });
    setUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', updateData.name);
    formData.append('description', updateData.description);
    if (updateData.image) {
      formData.append('image', updateData.image);
    }

    toast.promise(
      updateCategory({ id: selectedCategory._id, formData }).unwrap(),
      {
        loading: 'Updating category...',
        success: () => {
          setUpdateModalOpen(false);
          refetch();
          return 'Category updated successfully';
        },
        error: (err) => err.data?.message || 'Failed to update category',
      }
    );
  };

  const handleUpdateChange = (e) => {
    const { name, value, files } = e.target;
    setUpdateData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    toast.promise(
      deleteCategory(categoryToDelete._id).unwrap(),
      {
        loading: 'Deleting category...',
        success: () => {
          setDeleteModalOpen(false);
          refetch();
          return 'Category deleted successfully';
        },
        error: (err) => err.data?.message || 'Failed to delete category',
      }
    );
  };

  if (isLoading) return <p className="text-center py-8">Loading...</p>;
  if (error) return (
    <p className="text-center py-8 text-red-500">
      Error: {error.data?.message || error.message || 'Unknown error'}
    </p>
  );

  const categoriesArray = Array.isArray(categories) ? categories : categories ? [categories] : [];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">Category Settings</h1>

      {/* Create Category Section */}
      <CreateCategory />

      {/* Category List */}
      {categoriesArray.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesArray.map((category) => (
            <Card key={category._id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{category.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.imageUrl && (
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-32 object-cover rounded-md"
                  />
                )}
                <p className="text-gray-600">{category.description || 'No description'}</p>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleUpdateClick(category)}
                    variant="outline"
                    className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                  >
                    Update
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(category)}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No categories found</p>
      )}

      {/* Update Modal */}
      {updateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Update Category</h2>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={updateData.name}
                  onChange={handleUpdateChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={updateData.description}
                  onChange={handleUpdateChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Image (optional)</Label>
                <Input
                  id="image"
                  name="image"
                  type="file"
                  onChange={handleUpdateChange}
                  accept="image/*"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  onClick={() => setUpdateModalOpen(false)}
                  variant="outline"
                  className="border-gray-300"
                >
                  Cancel
                </Button>
                <Button type="submit">Update</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            <p className="mb-6">Are you sure you want to delete "{categoryToDelete?.name}"?</p>
            <div className="flex justify-end space-x-4">
              <Button
                onClick={() => setDeleteModalOpen(false)}
                variant="outline"
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

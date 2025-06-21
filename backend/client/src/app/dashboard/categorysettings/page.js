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
import { toast } from 'sonner';
import { X, Plus, Edit, Trash2 } from 'lucide-react';

export default function CategorySettings() {
  const { data: categories, isLoading, error, refetch } = useGetAllCategoriesQuery();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  // State for create modal
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // State for update modal
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [updateData, setUpdateData] = useState({
    name: '',
    description: '',
    image: null,
    imagePreview: '',
  });

  // State for delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const handleCreateCategorySuccess = () => {
    setCreateModalOpen(false);
    refetch();
  };

  const handleUpdateClick = (category) => {
    setSelectedCategory(category);
    setUpdateData({
      name: category.name || '',
      description: category.description || '',
      image: null,
      imagePreview: category.imageUrl || '',
    });
    setUpdateModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUpdateData((prev) => ({
        ...prev,
        image: file,
        imagePreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setUpdateData((prev) => ({
      ...prev,
      image: null,
      imagePreview: '',
    }));
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
      updateCategory({ id: selectedCategory._id, body: formData }).unwrap(),
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
    const { name, value } = e.target;
    setUpdateData((prev) => ({
      ...prev,
      [name]: value,
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Category Settings</h1>
        <Button 
          onClick={() => setCreateModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Category
        </Button>
      </div>

      {/* Category Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {categoriesArray.length > 0 ? (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Image</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Description</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {categoriesArray.map((category) => (
                  <tr key={category._id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                      {category.imageUrl && (
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                      {category.name}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {category.description || 'No description'}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                      <button
                        onClick={() => handleUpdateClick(category)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(category)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center p-8">
            <p className="text-gray-500 mb-4">No categories found</p>
            <Button 
              onClick={() => setCreateModalOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create Your First Category
            </Button>
          </div>
        )}
      </div>

      {/* Create Category Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-lg">
              <h2 className="text-xl font-bold">Create New Category</h2>
              <Button
                onClick={() => setCreateModalOpen(false)}
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6">
              <CreateCategory 
                onSuccess={handleCreateCategorySuccess}
                onCancel={() => setCreateModalOpen(false)}
                isModal={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {updateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Update Category</h2>
              <Button
                onClick={() => setUpdateModalOpen(false)}
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="space-y-4" encType="multipart/form-data">
              <div className="space-y-2">
                <Label htmlFor="image">Category Image</Label>
                <div className="flex items-center gap-4">
                  {updateData.imagePreview && (
                    <div className="relative">
                      <img
                        src={updateData.imagePreview}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <div>
                    <Input
                      id="image"
                      name="image"
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                    <p className="text-xs text-gray-500 mt-1">Max size: 2MB</p>
                  </div>
                </div>
              </div>
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
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Confirm Delete</h2>
              <Button
                onClick={() => setDeleteModalOpen(false)}
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
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
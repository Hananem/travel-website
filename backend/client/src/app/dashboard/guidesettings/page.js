
'use client';

import { useState } from 'react';
import { 
  useGetGuidesQuery, 
  useUpdateGuideMutation, 
  useDeleteGuideMutation 
} from '@/store/guideSlice';
import CreateGuide from '@/components/CreateGuide';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { X, Image as ImageIcon } from 'lucide-react';

export default function GuideSettings() {
  const { data, isLoading, error, refetch } = useGetGuidesQuery({ page: 1, limit: 100 });
  const [updateGuide] = useUpdateGuideMutation();
  const [deleteGuide] = useDeleteGuideMutation();

  // State for update modal
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [updateData, setUpdateData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    destinations: [],
    languages: '',
    experienceYears: '1',
    isAvailable: true,
    image: null,
    imagePreview: '',
  });
  const [fileInputRef, setFileInputRef] = useState(null);

  // State for delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [guideToDelete, setGuideToDelete] = useState(null);

  const handleUpdateClick = (guide) => {
    setSelectedGuide(guide);
    setUpdateData({
      name: guide.name || '',
      email: guide.email || '',
      phone: guide.phone || '',
      bio: guide.bio || '',
      destinations: guide.destinations || [],
      languages: guide.languages || '',
      experienceYears: guide.experienceYears || '1',
      isAvailable: guide.isAvailable !== undefined ? guide.isAvailable : true,
      image: null,
      imagePreview: guide.imageUrl || '',
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
    if (fileInputRef) {
      fileInputRef.value = '';
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(updateData).forEach(([key, value]) => {
      if (key === 'image' && value instanceof File) {
        formData.append(key, value);
      } else if (key === 'destinations' && Array.isArray(value)) {
        value.forEach((dest) => formData.append('destinations[]', dest));
      } else if (key !== 'imagePreview' && value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    toast.promise(
      updateGuide({ id: selectedGuide._id, body: formData }).unwrap(),
      {
        loading: 'Updating guide...',
        success: () => {
          setUpdateModalOpen(false);
          refetch();
          return 'Guide updated successfully';
        },
        error: (err) => err.data?.message || 'Failed to update guide',
      }
    );
  };

  const handleUpdateChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUpdateData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleDestinationsChange = (selectedDestinations) => {
    setUpdateData((prev) => ({
      ...prev,
      destinations: selectedDestinations,
    }));
  };

  const handleDeleteClick = (guide) => {
    setGuideToDelete(guide);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    toast.promise(
      deleteGuide(guideToDelete._id).unwrap(),
      {
        loading: 'Deleting guide...',
        success: () => {
          setDeleteModalOpen(false);
          refetch();
          return 'Guide deleted successfully';
        },
        error: (err) => err.data?.message || 'Failed to delete guide',
      }
    );
  };

  if (isLoading) return <p className="text-center py-8">Loading...</p>;
  if (error) return (
    <p className="text-center py-8 text-red-500">
      Error: {error.data?.message || error.message || 'Unknown error'}
    </p>
  );

  const guidesArray = Array.isArray(data?.guides) ? data?.guides : data?.guides ? [data.guides] : [];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-center">Guide Settings</h1>

      {/* Create Guide Section */}
      <CreateGuide />

      {/* Guide List */}
      {guidesArray.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guidesArray.map((guide) => (
            <Card key={guide._id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{guide.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {guide.imageUrl && (
                  <img
                    src={guide.imageUrl}
                    alt={guide.name}
                    className="w-full h-32 object-cover rounded-md"
                  />
                )}
                <p className="text-gray-600">{guide.bio || 'No bio'}</p>
                <p className="text-sm text-gray-500">Email: {guide.email}</p>
                <p className="text-sm text-gray-500">Phone: {guide.phone}</p>
                <p className="text-sm text-gray-500">Languages: {guide.languages}</p>
                <p className="text-sm text-gray-500">Experience: {guide.experienceYears}</p>
                <p className="text-sm text-gray-500">
                  Destinations: {guide.destinations?.join(', ') || 'None'}
                </p>
                <p className="text-sm text-gray-500">
                  Available: {guide.isAvailable ? 'Yes' : 'No'}
                </p>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleUpdateClick(guide)}
                    variant="outline"
                    className="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                  >
                    Update
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(guide)}
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
        <p className="text-center text-gray-500">No guides found</p>
      )}

      {/* Update Modal */}
      {updateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Update Guide</h2>
            <form onSubmit={handleUpdateSubmit} className="space-y-4" encType="multipart/form-data">
              <div className="space-y-2">
                <Label htmlFor="image">Profile Image</Label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-blue-300 transition-colors ${
                      updateData.imagePreview ? 'w-1/3' : 'w-full'
                    }`}
                    onClick={() => fileInputRef.click()}
                  >
                    {updateData.imagePreview ? (
                      <div className="relative h-full">
                        <img
                          src={updateData.imagePreview}
                          alt="Preview"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeImage(); }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-8">
                        <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload an image</p>
                      </div>
                    )}
                    <input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      ref={(ref) => setFileInputRef(ref)}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={updateData.email}
                  onChange={handleUpdateChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="text"
                  value={updateData.phone}
                  onChange={handleUpdateChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={updateData.bio}
                  onChange={handleUpdateChange}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="languages">Languages</Label>
                <Input
                  id="languages"
                  name="languages"
                  type="text"
                  value={updateData.languages}
                  onChange={handleUpdateChange}
                  placeholder="English, Spanish, French"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experienceYears">Years of Experience</Label>
                <select
                  id="experienceYears"
                  name="experienceYears"
                  value={updateData.experienceYears}
                  onChange={handleUpdateChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((year) => (
                    <option key={year} value={year}>
                      {year} {year === 1 ? 'year' : 'years'}
                    </option>
                  ))}
                  <option value="10+">10+ years</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Availability</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isAvailable"
                    name="isAvailable"
                    checked={updateData.isAvailable}
                    onChange={handleUpdateChange}
                  />
                  <Label htmlFor="isAvailable">Currently available</Label>
                </div>
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
            <p className="mb-6">Are you sure you want to delete "{guideToDelete?.name}"?</p>
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

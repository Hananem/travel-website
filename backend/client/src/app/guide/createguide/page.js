"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useGetItemsQuery } from '@/store/apiSlice';
import { useCreateGuideMutation } from '@/store/guideSlice';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { MultiSelect } from '@/components/ui/multi-select';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Image as ImageIcon, X } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(6, "Phone number must be at least 6 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  destinations: z.array(z.string()).min(1, "Select at least one destination"),
  languages: z.string().min(1, "Enter at least one language"),
  experienceYears: z.string().min(1, "Enter years of experience"),
  isAvailable: z.boolean(),
  image: z.instanceof(File).optional(),
  imagePreview: z.string().optional(),
});

export default function CreateGuidePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [createGuide, { isLoading }] = useCreateGuideMutation();

  const { data: destinationsResponse } = useGetItemsQuery({
    itemType: 'destination',
    limit: 1000,
    page: 1,
  });
  const destinations = destinationsResponse?.items || [];

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      bio: "",
      destinations: [],
      languages: "",
      experienceYears: "1",
      isAvailable: true,
      image: undefined,
      imagePreview: "",
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      form.setValue("image", file);
      form.setValue("imagePreview", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    form.setValue("image", undefined);
    form.setValue("imagePreview", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (values) => {
    try {
      const formData = new FormData();
      
      // Append all fields to FormData
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'image' && value instanceof File) {
          formData.append(key, value);
        } else if (key === 'destinations') {
          value.forEach(dest => formData.append('destinations[]', dest));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      await createGuide(formData).unwrap();
      toast.success("Guide created successfully");
      router.push("/guides");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create guide");
    }
  };

  const imagePreview = form.watch("imagePreview");

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Guide</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" encType="multipart/form-data">
            {/* Image Upload Section */}
            <div className="space-y-2">
              <FormLabel>Profile Image</FormLabel>
              <div className="flex flex-col sm:flex-row gap-4">
                <div 
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-blue-300 transition-colors ${
                    imagePreview ? 'w-1/3' : 'w-full'
                  }`}
                  onClick={() => fileInputRef.current.click()}
                >
                  {imagePreview ? (
                    <div className="relative h-full">
                      <img
                        src={imagePreview}
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
                      <p className="text-sm text-gray-500">
                        Click to upload an image
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Recommended size: 800x600px (max 2MB)
                      </p>
                    </div>
                  )}
                  <FormControl>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      ref={fileInputRef}
                      className="hidden"
                    />
                  </FormControl>
                </div>

                {!imagePreview && (
                  <div className="flex- fisico items-center justify-center bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 text-center">
                      A high-quality image will make your guide profile more attractive.
                    </p>
                  </div>
                )}
              </div>
              <FormMessage />
            </div>

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="guide@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Password must be at least 6 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bio */}
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biography</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the guide's experience and specialties..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Destinations */}
            <FormField
              control={form.control}
              name="destinations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destinations</FormLabel>
                  <MultiSelect
                    options={destinations.map(d => ({
                      value: d._id,
                      label: d.name,
                      image: d.imageUrl
                    }))}
                    selected={field.value}
                    onChange={field.onChange}
                    placeholder="Select destinations..."
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Languages */}
            <FormField
              control={form.control}
              name="languages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Languages</FormLabel>
                  <FormControl>
                    <Input placeholder="English, Spanish, French" {...field} />
                  </FormControl>
                  <FormDescription>
                    Separate languages with commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Experience */}
            <FormField
              control={form.control}
              name="experienceYears"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year} {year === 1 ? "year" : "years"}
                        </SelectItem>
                      ))}
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Availability */}
            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Currently available for tours</FormLabel>
                </FormItem>
              )}
            />

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/guides")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Guide"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
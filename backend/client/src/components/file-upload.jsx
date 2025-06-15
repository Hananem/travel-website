"use client";

import { UploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";

export const FileUpload = ({ endpoint, onUploadSuccess }) => {
  return (
    <UploadDropzone
      endpoint={endpoint}
      onClientUploadComplete={(res) => {
        if (res && res[0]?.url) {
          onUploadSuccess(res[0].url);
        }
      }}
      onUploadError={(error) => {
        console.error("Upload error:", error);
        alert("Upload failed! Please try again.");
      }}
      appearance={{
        button: "bg-primary text-primary-foreground hover:bg-primary/90 ut-uploading:cursor-not-allowed ut-uploading:bg-primary/80",
        container: "border-2 border-dashed border-gray-300 rounded-lg ut-readying:border-blue-500 ut-uploading:border-blue-500",
        uploadIcon: "text-blue-500",
        label: "text-foreground hover:text-blue-500",
        allowedContent: "text-muted-foreground",
      }}
      config={{
        mode: "auto",
      }}
    />
  );
};
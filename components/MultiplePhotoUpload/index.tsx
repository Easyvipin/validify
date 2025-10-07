"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Upload, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SCREENSHOT_UPLOAD_LIMIT } from "@/utils/constants";

interface PhotoFile {
  file: File;
  preview: string;
  id: string;
}

export function MultiplePhotoUpload() {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (photos.length !== SCREENSHOT_UPLOAD_LIMIT) {
        const newPhotos = acceptedFiles.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
          id: Math.random().toString(36).substr(2, 9),
        }));

        setPhotos((prev) => [...prev, ...newPhotos]);
      }
    },
    [photos]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: true,
  });

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const photoToRemove = prev.find((p) => p.id === id);
      if (photoToRemove) {
        URL.revokeObjectURL(photoToRemove.preview);
      }
      return prev.filter((p) => p.id !== id);
    });
  };

  const clearAll = () => {
    photos.forEach((photo) => URL.revokeObjectURL(photo.preview));
    setPhotos([]);
  };

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <Card className="p-0 md:p-2">
        <CardContent className="p-1 py-1">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-1 md:p-2 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <Upload className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {isDragActive ? "Drop photos here" : "Upload photos"}
                </p>
                <p className="text-sm hidden md:block text-muted-foreground">
                  Drag and drop your product screenshots here, or click.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Previews */}
      {photos.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                Selected Photos ({photos.length}/{SCREENSHOT_UPLOAD_LIMIT})
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                className="text-destructive hover:text-destructive bg-transparent"
              >
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-8 md:grid-cols-8 lg:grid-cols-8 gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={photo.preview || "/placeholder.svg"}
                      alt={photo.file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removePhoto(photo.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>

                  {/* File info */}
                  <div className="mt-2 space-y-1">
                    <p
                      className="text-xs font-medium truncate"
                      title={photo.file.name}
                    >
                      {photo.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(photo.file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Actions */}
      {photos.length > 0 && (
        <div className="flex gap-4">
          <Button className="flex-1">
            <Upload className="h-4 w-4 mr-2" />
            Upload {photos.length} Photo{photos.length !== 1 ? "s" : ""}
          </Button>
          <Button variant="outline" onClick={clearAll}>
            Cancel
          </Button>
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-2 text-center">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
              <ImageIcon className="h-4 w-4" />
              <p>No photos selected yet</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

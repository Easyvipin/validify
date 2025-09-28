"use client";

import { CldUploadButton } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import type { CloudinaryUploadWidgetResults } from "next-cloudinary";

type Props = {
  onUpload: (url: string) => void;
  multiple?: boolean;
  children: React.ReactNode;
};

export default function CloudinaryUpload({
  onUpload,
  multiple = false,
  children,
}: Props) {
  console.log(process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  return (
    <CldUploadButton
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      options={{ multiple }} // ✅ multiple upload via widget config
      onSuccess={(result: CloudinaryUploadWidgetResults) => {
        if (typeof result === "object" && "info" in result) {
          const info = result.info as any;
          if (info?.secure_url) {
            onUpload(info.secure_url);
          }
        }
      }}
      onError={(error) => {
        console.error("Cloudinary upload failed:", error);
      }}
    >
      {children}
    </CldUploadButton>
  );
}

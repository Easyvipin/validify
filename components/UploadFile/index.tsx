"use client";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { Children, ReactNode, useState } from "react";

type UploadFileType = {
  onDrop: (files: File[]) => void;
  files: File[] | undefined;
  children: ReactNode;
  disable: boolean;
};

const UploadFile = ({ onDrop, files, children, disable }: UploadFileType) => {
  return (
    <Dropzone
      accept={{ "image/*": [] }}
      maxFiles={1}
      maxSize={1024 * 1024 * 10}
      minSize={1024}
      onDrop={onDrop}
      onError={console.error}
      src={files?.length ? files : undefined}
      disabled={disable}
    >
      {children}
    </Dropzone>
  );
};
export default UploadFile;

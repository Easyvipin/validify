"use client";

import { createProject, getAllCategories } from "../actions";
import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryArray } from "@/app/(onboarding)/onboarding/page";
import CloudinaryUpload from "@/components/CloudinaryUpload";
import UploadFile from "@/components/UploadFile";
import Image from "next/image";
import {
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { UploadIcon } from "lucide-react";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { MultiplePhotoUpload } from "@/components/MultiplePhotoUpload";

// 1️⃣ Define validation schema
const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  desc: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  url: z.string().url("Invalid URL").min(1, "URL is required"),
});

type LogoData = {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
};

interface IAddProject {
  closeDialog: () => void;
}

export default function AddProject({ closeDialog }: IAddProject) {
  const [categories, setCategories] = useState<CategoryArray>([]);
  const [assetSection, setAssetSection] = useState(true);
  const [files, setFiles] = useState<File[] | undefined>();
  const [state, formAction, isPending] = useActionState(createProject, {
    ok: false,
    message: "",
  });
  const [logoData, setLogoData] = useState<LogoData | null>(null);
  const [filePreview, setFilePreview] = useState<string | undefined>();
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isLogoDeleting, setIsLogoDeleting] = useState(false);
  /*  const [screenshots, setScreenshots] = useState<string[]>([]); */

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      desc: "",
      categoryId: "1",
      url: "",
    },
  });

  useEffect(() => {
    if (state.message) {
      if (state.ok) {
        toast.success(state.message);
        setAssetSection(true);
        form.reset();
      } else {
        toast.error(state.message);
        closeDialog();
      }
    }
  }, [state, form]);

  useEffect(() => {
    async function loadCategories() {
      const cats = await getAllCategories();
      if (!cats || cats.length === 0) {
        throw new Error("No categories found");
      }
      setCategories(cats);
    }
    loadCategories();
  }, []);

  const handleDrop = async (files: File[]) => {
    console.log(files);
    setFiles(files);
    if (files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === "string") {
          setFilePreview(e.target?.result);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  const uploadLogo = useCallback(async () => {
    if (files?.[0]) {
      setIsLogoUploading(true);
      try {
        const res = await fetch("/api/sign-upload");
        const { signature, timestamp, cloudName, apiKey, folder } =
          await res.json();

        const formData = new FormData();
        formData.append("file", files[0]);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        formData.append("folder", folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await uploadRes.json();
        setLogoData(data);
        setIsLogoUploading(false);
        toast.error("You logo just got uploaded!");
      } catch (err) {
        toast.error("Please Try Again!");
        setIsLogoUploading(false);
      }
    }
  }, [files]);

  const deleteLogo = useCallback(async () => {
    if (!logoData?.public_id) return;

    setIsLogoDeleting(true);

    const res = await fetch("/api/delete-logo", {
      method: "POST",
      body: JSON.stringify({ publicId: logoData?.public_id }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (!data.error) {
      setFiles([]);
      setFilePreview(undefined);
      setIsLogoDeleting(false);
      toast.success("Logo Deleted!");
      setLogoData(null);
    } else {
      console.error("Failed to delete logo", data.error);
      toast.error("Try Again!");
    }
  }, [logoData]);

  return (
    <>
      {!assetSection && (
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((values) => {
                startTransition(() => {
                  formAction(values);
                });
              })}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="desc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter project description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pick a category</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select profession" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending}>
                {isPending ? "Creating..." : "Add Project"}
              </Button>
            </form>
          </Form>
        </div>
      )}
      {assetSection && (
        <div className="flex w-full h-full justify-evenly flex-col md:flex-row">
          {assetSection && (
            <>
              <div>
                <h4 className="font-semibold">Add Logo & Screenshots</h4>
                <div className="mt-2">
                  <h5 className="text-foreground mb-2">Logo</h5>
                  <div className="flex">
                    <div className="flex flex-col gap-2.5 w-[120px] h-[160px]">
                      <UploadFile
                        onDrop={handleDrop}
                        files={files}
                        disable={logoData ? true : false}
                      >
                        <DropzoneEmptyState>
                          <UploadIcon size={60} />
                        </DropzoneEmptyState>
                        {filePreview && (
                          <DropzoneContent>
                            <div className="h-full w-full border-4 border-red-500 overflow-clip">
                              <img
                                alt="Preview"
                                className="absolute top-0 w-full h-full left-0 object-cover"
                                src={filePreview}
                              />
                            </div>
                          </DropzoneContent>
                        )}
                      </UploadFile>
                      {!logoData?.secure_url && (
                        <Button
                          disabled={
                            files?.length === 0 || isLogoUploading === true
                          }
                          onClick={uploadLogo}
                          className="w-full"
                        >
                          Upload Logo {isLogoUploading && <Spinner />}
                        </Button>
                      )}
                      {logoData?.secure_url && isLogoUploading === false && (
                        <Button
                          disabled={isLogoDeleting}
                          onClick={deleteLogo}
                          className="w-full"
                        >
                          Delete {isLogoDeleting && <Spinner />}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-[100%] md:w-[50%]">
                <MultiplePhotoUpload />
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

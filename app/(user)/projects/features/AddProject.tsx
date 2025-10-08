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
import { metaDataForSteps, PROJECT_STEPS } from "@/utils/constants";
import { Textarea } from "@/components/ui/textarea";
import { string } from "zod/v3";
import { uploadScreenshotsToProject } from "../../project/action";
import { useRouter } from "next/navigation";

// 1️⃣ Define validation schema
const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  desc: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  url: z.string().url("Invalid URL").min(1, "URL is required"),
  tagline: z.string().min(10, "Every product has a tagline"),
  logoUrl: z.string().url("Invalid URL"),
});

type LogoData = {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
};

interface PhotoFile {
  file: File;
  preview: string;
  id: string;
}

interface IAddProject {}

export default function AddProject() {
  const [categories, setCategories] = useState<CategoryArray>([]);
  const [files, setFiles] = useState<File[] | undefined>();
  const [state, formAction, isPending] = useActionState(createProject, {
    ok: false,
    message: "",
  });
  const [logoData, setLogoData] = useState<LogoData | null>(null);
  const [filePreview, setFilePreview] = useState<string | undefined>();
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [isLogoDeleting, setIsLogoDeleting] = useState(false);
  const [steps, setSteps] = useState(1);
  const [existingProjectId, setExistingProjectId] = useState<
    number | undefined
  >(undefined);

  const router = useRouter();

  /*  const [screenshots, setScreenshots] = useState<string[]>([]); */

  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onChange",
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      desc: "",
      categoryId: "1",
      url: "",
      logoUrl: "",
      tagline: "",
    },
  });

  useEffect(() => {
    if (state.message) {
      if (state.ok) {
        toast.success(state.message);
        setExistingProjectId(state.newProjectId);
        setSteps((prev) => prev + 1);
        form.reset();
      } else {
        toast.error(state.message);
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
        form.setValue("logoUrl", data.secure_url);
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

  const handleNext = async (
    fieldsToValidate: (keyof z.infer<typeof formSchema>)[]
  ) => {
    const valid = await form.trigger(fieldsToValidate);
    if (valid) {
      setSteps((prev) => prev + 1);
    }
  };

  const decrementStep = (e) => {
    e.preventDefault();
    setSteps((prev) => prev - 1);
  };

  const uploadScreenshots = useCallback(
    async (photos: PhotoFile[]) => {
      if (photos.length === 0) return;

      try {
        const res = await fetch("/api/sign-upload");
        const { signature, timestamp, cloudName, apiKey, folder } =
          await res.json();

        const uploadPromises = photos.map(async (photo) => {
          const formData = new FormData();
          formData.append("file", photo.file);
          formData.append("api_key", apiKey);
          formData.append("timestamp", timestamp.toString());
          formData.append("signature", signature);
          formData.append("folder", folder);

          const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
            { method: "POST", body: formData }
          );

          const data = await uploadRes.json();
          return data.secure_url;
        });
        const uploadedUrls = await Promise.all(uploadPromises);

        const { ok, message } = await uploadScreenshotsToProject(
          uploadedUrls,
          existingProjectId!
        );
        if (ok) {
          toast.success(message);
          router.push("/projects");
        } else {
          toast.error(message);
        }
      } catch (err) {
        toast.error("Upload failed, please try again!");
      }
    },
    [existingProjectId]
  );

  return (
    <div className="flex h-[80vh] border mt-10 rounded-4xl overflow-clip">
      <section className="w-[40%] h-[100%] bg-accent hidden md:block ">
        <img className="w-full h-full" src={metaDataForSteps[steps].coverUrl} />
      </section>
      <div className="w-full md:w-[60%] h-full p-10 relative flex flex-col justify-center">
        <h1 className="text-xl md:text-3xl">{metaDataForSteps[steps].label}</h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => {
              console.log("triggered");
              startTransition(() => {
                formAction(values);
              });
            })}
            className="space-y-4 mt-6"
          >
            {steps === 1 && (
              <>
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">
                        Tell us where it points to , avoid localhost please !
                      </FormLabel>
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
                      <FormLabel className="text-lg">
                        It belongs to which race ? , choose category{" "}
                      </FormLabel>
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
                              <SelectItem
                                key={cat.id}
                                value={cat.id.toString()}
                              >
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
                <div className="flex justify-between w-full gap-2 mt-10">
                  <Button
                    type="button"
                    className="text-xl rounded mt-auto py-6 flex-1"
                    onClick={(e) => handleNext(["url", "categoryId"])}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
            {steps === 2 && (
              <>
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
                  name="tagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tag Line</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="okay dokey to problems..."
                          {...field}
                        />
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
                        <Textarea
                          placeholder="Describe your product what you solve etc"
                          className="h-[100px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
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
                <div className="flex justify-between w-full gap-2 mt-auto">
                  <Button
                    type="button"
                    className="text-xl rounded mt-auto py-6 flex-1"
                    disabled={isPending}
                    onClick={decrementStep}
                  >
                    Prev
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 text-xl rounded mt-auto py-6"
                    disabled={isPending}
                  >
                    {isPending ? "Creating..." : "Setup Project"}
                  </Button>
                </div>
              </>
            )}
          </form>
        </Form>
        {steps === 3 && (
          <div className="flex w-full h-full justify-evenly flex-col md:flex-row">
            <>
              <div className="w-[100%]">
                <MultiplePhotoUpload onUpload={uploadScreenshots} />
              </div>
            </>
          </div>
        )}
      </div>
    </div>
  );
}

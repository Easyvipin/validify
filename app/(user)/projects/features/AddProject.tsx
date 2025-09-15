"use client";

import { createProject, getAllCategories } from "../actions";
import { startTransition, useActionState, useEffect, useState } from "react";
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

// 1️⃣ Define validation schema
const formSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  desc: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  url: z.string().url("Invalid URL").min(1, "URL is required"),
});

interface IAddProject {
  closeDialog: () => void;
}

export default function AddProject({ closeDialog }: IAddProject) {
  const [categories, setCategories] = useState<CategoryArray>([]);
  const [state, formAction, isPending] = useActionState(createProject, {
    ok: false,
    message: "",
  });

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
        closeDialog();
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

  return (
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
                <Input placeholder="Enter project description" {...field} />
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
  );
}

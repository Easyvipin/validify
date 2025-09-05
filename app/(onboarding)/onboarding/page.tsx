"use client";

import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { completeOnboarding, getAllCategories } from "./action";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

export type CategoryArray = Awaited<ReturnType<typeof getAllCategories>>;

const formSchema = z.object({
  name: z.string().min(4, "Project name is required"),
  bio: z.string().min(4, "Description is required"),
  profession: z.string().min(1, "Select Profession Please"),
});

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<number[]>([1, 2]);
  const [categories, setCategories] = useState<CategoryArray>([]);
  const [state, formAction, isPending] = useActionState(completeOnboarding, {
    ok: false,
    message: "",
  });
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      bio: "",
      profession: "",
    },
  });

  useEffect(() => {
    if (state.message) {
      if (state.ok) {
        toast.success(state.message);
        form.reset();
        router.push("/projects");
      } else {
        toast.error(state.message);
        router.refresh();
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

  const toggleCategory = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((cat) => cat !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  const handleSubmitStep1 = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (selected.length < 1) return;
      setStep(2);
    },
    [selected]
  );

  return (
    <div className="flex items-center justify-center h-full p-4">
      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.4 }}
              className="bg-card rounded-2xl shadow-lg shadow-accent-foreground p-6 border-[0.2px] border-accent dark:border-primary"
            >
              <h1 className="text-2xl font-bold mb-2 text-center">
                Pick Your Interests
              </h1>
              <p className="text-muted-foreground text-center mb-6">
                Select up to <span className="font-medium">3 categories</span>{" "}
                you care about. This will personalize the projects you see.
              </p>
              <form onSubmit={handleSubmitStep1} className="space-y-6">
                <div className="flex flex-wrap gap-2 justify-center">
                  {categories.length === 0
                    ? Array.from({ length: 7 }).map((_, i) => (
                        <Skeleton key={i} className="h-9 w-20 rounded-full" />
                      ))
                    : categories.map((cat) => (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => toggleCategory(cat.id)}
                          className={`px-4 py-2 rounded-full border transition ${
                            selected.includes(cat.id)
                              ? "bg-accent-foreground dark:bg-accent text-primary border-ring"
                              : "bg-background hover:bg-accent"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                </div>
                <div className="flex justify-center">
                  <Button
                    type="submit"
                    className="flex justify-center items-center"
                    disabled={selected.length < 1}
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="bg-card rounded-2xl shadow-lg shadow-accent-foreground p-6 border-[0.2px] border-accent dark:border-primary"
            >
              <h1 className="text-2xl font-bold mb-2 text-center">
                👤 Complete Your Profile
              </h1>
              <p className="text-muted-foreground text-center mb-6">
                Add details to let others know who you are. <br />
                (You can skip this step if you’d like.)
              </p>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((values) => {
                    const payload = {
                      ...values,
                      categories: selected,
                    };
                    console.log(payload);
                    startTransition(() => {
                      formAction(payload);
                    });
                  })}
                  className="space-y-4"
                >
                  <FormField
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="A little about yourself..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="profession"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profession</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select profession" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="developer">
                                Developer
                              </SelectItem>
                              <SelectItem value="designer">Designer</SelectItem>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-between">
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={() => setStep(1)}
                    >
                      ← Back
                    </Button>
                    <div className="flex gap-2">
                      <Button type="submit">
                        View Projects
                        {!isPending ? (
                          <ArrowRight className="ml-2 h-4 w-4" />
                        ) : (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

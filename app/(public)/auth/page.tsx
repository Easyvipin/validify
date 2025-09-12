"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { userHasCategories } from "./action";

export default function AfterSignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function ensureUser() {
      const res = await fetch("/api/user", { method: "POST" });

      if (res.ok) {
        const categories = await userHasCategories();
        if (categories?.length > 0) {
          router.push("/projects");
        } else {
          router.push("/onboarding");
        }
      } else {
        alert("Failed to set up your account. Please try again."); // need redirection to fail page
        router.push("/");
      }
    }
    ensureUser().finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-6 h-full flex justify-center items-center">
      {loading
        ? "Wait as we load you into the validation Systems"
        : "Redirecting..."}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

interface IAuthRedirectButton {
    isAuthenticated:boolean;
    label:string;
}

export default function AuthRedirectButton({isAuthenticated , label}:IAuthRedirectButton) {
  const router = useRouter();

  function handleClick() {
    if (isAuthenticated) {
      router.push("/projects");
    } else {
      alert("You need to log in first");
    }
  }

  return (
    <Button onClick={handleClick}>
      {label}
    </Button>
  );
}

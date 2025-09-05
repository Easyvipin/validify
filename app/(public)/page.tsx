import { isUserLoggedIn } from "../action";
import AuthRedirectButton from "@/components/AuthRedirectButton";

export default async function Home() {
  const isLoggedIn = await isUserLoggedIn();
  return (
    <div className="font-sans bg-background/95 grid grid-rows-[20px_1fr_20px] items-center justify-items-center  p-8 pb-20 gap-16 sm:p-20">
      <AuthRedirectButton
        isAuthenticated={isLoggedIn}
        label="Validate your project"
      />
    </div>
  );
}

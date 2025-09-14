import ShinyText from "@/components/ShinyText";
import { isUserLoggedIn } from "../action";
import AuthRedirectButton from "@/components/AuthRedirectButton";

export default async function Home() {
  const isLoggedIn = await isUserLoggedIn();
  return (
    <div className="font-sans bg-background/95 grid grid-rows-[20px_1fr_20px] items-center justify-items-center  p-8 pb-20 gap-16 sm:p-20">
      <ShinyText
        text="Early Access"
        disabled={false}
        speed={3}
        className="custom-class text-8xl"
      />
      <ShinyText
        text="To Tomorrow’s Projects"
        disabled={false}
        speed={3}
        className="custom-class text-7xl text-primary"
      />
      <div className="flex flex-col justify-center items-center gap-10">
        <h3 className="mt-0">
          Place for Early Birds , MVP , or college side projects
        </h3>
        <AuthRedirectButton
          isAuthenticated={isLoggedIn}
          label="Validate your project"
        />
      </div>
    </div>
  );
}

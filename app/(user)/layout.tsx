import { DashboardNavigation } from "@/components/Navigation/DashboardNav";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/themes";
import type { Metadata } from "next";
import "../globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Feed",
  description: "list of projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: shadcn,
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <DashboardNavigation />
            <main className="h-[calc(100vh-7rem)] mx-auto w-full max-w-6xl my-4 px-4 md:px-0 overflow-scroll scrollbar-none">
              {/* Your content here */}
              {children}
            </main>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

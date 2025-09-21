"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Home, FolderOpen, Bell, Menu, X, Fan, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "../ModeToggle";
import { time } from "console";
import { getNotifications } from "@/app/(user)/notifications/actions";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

export function DashboardNavigation() {
  const pathname = usePathname();
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(async () => {
      const resp = await getNotifications();
      if (resp.totalUnreadCount > 0) {
        setUnreadNotifications(resp.totalUnreadCount);
      }
      console.log(resp);
    }, 60000);
  }, []);

  const navItems: NavItem[] = [
    {
      name: "Feed",
      href: "/feed",
      icon: Home,
    },
    {
      name: "My Projects",
      href: "/projects",
      icon: FolderOpen,
    },
    {
      name: "Impact",
      href: "/impact",
      icon: Fan,
    },
  ];

  const isActiveRoute = (href: string) => {
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Desktop & Tablet Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-accent ">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/feed" className="flex items-center">
                <div className="text-2xl font-bold text-primary">Validify</div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors relative",
                      isActiveRoute(item.href)
                        ? "text-accent-foreground bg-accent"
                        : "text-accent-foreground hover:bg-sidebar-primary"
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                    {/* { && item.badge > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )} */}
                  </Link>
                );
              })}
            </div>

            {/* Desktop User Menu */}
            <div className="flex items-center gap-2">
              <Link
                href={"/notifications"}
                className={cn(
                  "flex items-center px-3 py-3 text-sm font-medium rounded-full transition-colors relative",
                  isActiveRoute("/notifications")
                    ? "text-accent-foreground bg-accent"
                    : "text-accent-foreground hover:bg-sidebar-primary"
                )}
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </span>
                )}
              </Link>
              <Link
                href={"/settings"}
                className={cn(
                  "flex items-center px-3 py-3 text-sm font-medium rounded-full transition-colors relative",
                  isActiveRoute("/settings")
                    ? "text-accent-foreground bg-accent"
                    : "text-accent-foreground hover:bg-sidebar-primary"
                )}
              >
                <Settings className="h-4 w-4" />
                {/* {item.badge && item.badge > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )} */}
              </Link>
              <ModeToggle />
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 ml-4",
                  },
                }}
              />
            </div>
          </div>

          {/* Mobile Navigation Menu (Hamburger Style) */}
          <div
            className="md:hidden fixed bottom-20 left-10 right-10 py-1 border border-white/20 rounded-full z-50
                backdrop-blur-lg bg-white/10 shadow-lg shadow-accent/20 transition-transform duration-200 hover:scale-105"
          >
            <div className="flex justify-around">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex flex-col items-center py-2 px-2 text-xs font-medium relative rounded-full",
                      isActiveRoute(item.href)
                        ? "text-accent-foreground bg-accent"
                        : "text-accent-foreground hover:bg-sidebar-primary"
                    )}
                  >
                    <div className="relative">
                      <Icon className="h-4 w-4" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Bottom Tab Bar (Alternative to hamburger) */}
      {/* Uncomment this if you prefer bottom tabs on mobile */}
      {/*
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center py-2 px-3 text-xs font-medium relative',
                  isActiveRoute(item.href)
                    ? 'text-blue-600'
                    : 'text-gray-600'
                )}
              >
                <div className="relative">
                  <Icon className="h-6 w-6 mb-1" />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-[10px]">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="truncate w-full text-center">
                  {item.name === 'My Projects' ? 'Projects' : item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      */}
    </>
  );
}

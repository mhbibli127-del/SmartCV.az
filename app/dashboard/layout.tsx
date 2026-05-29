"use client";



import React, { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";

import {

  Search,

  Menu,

  X,

} from "lucide-react";

import NotificationPanel from "@/components/NotificationPanel";

import { useToast } from "@/components/ui/use-toast";

import { Icon } from "@/components/ui/icon";

import { useLogout } from "@/hooks/useLogout";

import { api } from "@/lib/api-client";

import { useCurrentUser, initialOf } from "@/hooks/useCurrentUser";

import { useAuthGuard } from "@/hooks/useAuthGuard";

import { shouldFetchAuthenticatedApis } from "@/lib/auth-client";

import { useSession } from "next-auth/react";

import { cn } from "@/lib/utils";
import { DashboardPageTracker } from "@/components/dashboard/DashboardPageTracker";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ErrorBoundary } from "@/components/ErrorBoundary";



export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  const pathname = usePathname();

  const isFocusMode =
    pathname.startsWith("/dashboard/studio") ||
    pathname.startsWith("/dashboard/builder/editor") ||
    pathname.startsWith("/dashboard/editor");

  const isEditorFocus = isFocusMode;

  const isFullWidthStudio = isFocusMode;

  const router = useRouter();

  const { status } = useSession();

  useAuthGuard();

  const { logout } = useLogout();

  const { success, error: toastError } = useToast();

  const { user } = useCurrentUser();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [welcomeShown, setWelcomeShown] = useState(false);



  useEffect(() => {

    if (welcomeShown || !shouldFetchAuthenticatedApis(status)) return;

    const showWelcome = async () => {
      try {
        const { ok, data } = await api.get<{
          notifications: { type: string; read: boolean }[];
          unreadCount: number;
        }>("/api/notifications");

        if (ok && data.unreadCount > 0) {
          const loginNotice = data.notifications?.find(
            (n) => n.type === "login" && !n.read
          );

          if (loginNotice) {
            success("Welcome back", "You're signed in to SmartCV.");
            setWelcomeShown(true);
          }
        }
      } catch (err) {
        console.error("[dashboard/welcome]", err);
      }
    };

    void showWelcome();

  }, [welcomeShown, success, status]);



  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch {
      toastError("Logout failed", "Please try again.");
    }
  }, [logout, toastError]);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const triggerLogout = useCallback(() => {
    void handleLogout();
  }, [handleLogout]);



  const handleSearch = (e: React.FormEvent) => {

    e.preventDefault();

    if (searchQuery.trim()) {

      router.push(`/dashboard/examples?q=${encodeURIComponent(searchQuery)}`);

    }

  };



  return (

    <div className="flex min-h-screen bg-[#f7f7f8] text-zinc-900">

      <DashboardPageTracker />

      <button

        type="button"

        className="fixed left-4 top-4 z-50 rounded-[12px] border border-black/[0.08] bg-white p-2.5 shadow-sm md:hidden"

        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}

        aria-label="Toggle menu"

      >

        {mobileMenuOpen ? (

          <Icon icon={X} size="lg" label="Close menu" />

        ) : (

          <Icon icon={Menu} size="lg" label="Open menu" />

        )}

      </button>



      <DashboardSidebar
        pathname={pathname}
        user={user}
        isEditorFocus={isEditorFocus}
        mobileMenuOpen={mobileMenuOpen}
        onNavigate={closeMobileMenu}
        onLogout={triggerLogout}
      />



      <div className="flex min-w-0 flex-1 flex-col">

        {!isFocusMode && (
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-black/[0.06] bg-white/70 px-6 backdrop-blur-xl md:px-8">

          <form onSubmit={handleSearch} className="relative max-w-md flex-1">

            <Icon

              icon={Search}

              size="sm"

              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"

            />

            <input

              type="search"

              placeholder="Search examples, templates…"

              value={searchQuery}

              onChange={(e) => setSearchQuery(e.target.value)}

              className="h-10 w-full rounded-[12px] border border-black/[0.08] bg-zinc-50/80 py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-400 transition-all focus:border-black/[0.12] focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900/10"

            />

          </form>

          <div className="ml-4 flex items-center gap-2">

            <NotificationPanel />

            <Link

              href="/dashboard/account"

              className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-zinc-900 text-xs font-semibold text-white transition-transform hover:scale-[1.02]"

              title={user?.email ?? "Account"}

            >

              {initialOf(user)}

            </Link>

          </div>

        </header>
        )}



        <main
          data-full-width={isFullWidthStudio || undefined}
          className={cn(
            "mx-auto w-full flex-1 space-y-6 px-6 py-8 md:px-8 data-[full-width=true]:max-w-none",
            isFullWidthStudio ? "max-w-none space-y-0 py-0" : "max-w-6xl"
          )}
        >
          <ErrorBoundary
            title="This page failed to load"
            description="Something went wrong while rendering this view. Your other dashboard pages should still work."
            homeHref="/dashboard/templates"
            homeLabel="Browse templates"
          >
            {children}
          </ErrorBoundary>

        </main>

      </div>



      {mobileMenuOpen && (

        <div

          className="fixed inset-0 z-30 bg-zinc-900/20 backdrop-blur-sm md:hidden"

          onClick={closeMobileMenu}
          role="presentation"

        />

      )}

    </div>

  );

}


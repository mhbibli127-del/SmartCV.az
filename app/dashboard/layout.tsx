"use client";



import React, { useEffect, useState } from "react";

import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";

import {

  LayoutDashboard,

  FileEdit,

  Library,

  UserCircle,

  LogOut,

  Search,

  Menu,

  X,

  TrendingUp,
  LayoutGrid,
  PenLine,
} from "lucide-react";

import NotificationPanel from "@/components/NotificationPanel";

import BrandLogo from "@/components/BrandLogo";

import { useToast } from "@/components/ui/use-toast";

import { Icon } from "@/components/ui/icon";

import { useLogout } from "@/hooks/useLogout";

import { api } from "@/lib/api-client";

import UsageBanner from "@/components/UsageBanner";

import { useSubscription } from "@/hooks/useSubscription";

import UpgradeToProButton from "@/components/UpgradeToProButton";

import { useCurrentUser, displayNameOf, initialOf } from "@/hooks/useCurrentUser";

import { useAuthGuard } from "@/hooks/useAuthGuard";

import { shouldFetchAuthenticatedApis } from "@/lib/auth-client";

import { useSession } from "next-auth/react";

import { cn } from "@/lib/utils";



const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "My CVs", href: "/dashboard/builder", icon: FileEdit },
  { name: "Templates", href: "/dashboard/templates", icon: LayoutGrid },
  { name: "Studio", href: "/dashboard/studio", icon: PenLine },
  { name: "Examples", href: "/dashboard/examples", icon: Library },
  { name: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
  { name: "Account", href: "/dashboard/account", icon: UserCircle },
];



export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  const pathname = usePathname();

  const isFocusMode =
    pathname.startsWith("/dashboard/studio") ||
    pathname.startsWith("/dashboard/builder/editor");

  const isEditorFocus = isFocusMode;

  const isFullWidthStudio = isFocusMode;

  const router = useRouter();

  const { status } = useSession();

  useAuthGuard();

  const { logout } = useLogout();

  const { success, error: toastError } = useToast();

  const { plan } = useSubscription();

  const { user } = useCurrentUser();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [welcomeShown, setWelcomeShown] = useState(false);



  useEffect(() => {

    if (welcomeShown || !shouldFetchAuthenticatedApis(status)) return;

    const showWelcome = async () => {

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

    };

    showWelcome();

  }, [welcomeShown, success, status]);



  const handleLogout = async () => {

    try {

      await logout();

    } catch {

      toastError("Logout failed", "Please try again.");

    }

  };



  const handleSearch = (e: React.FormEvent) => {

    e.preventDefault();

    if (searchQuery.trim()) {

      router.push(`/dashboard/examples?q=${encodeURIComponent(searchQuery)}`);

    }

  };



  return (

    <div className="flex min-h-screen bg-[#f7f7f8] text-zinc-900">

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



      {/* Sidebar */}

      <aside

        className={cn(

          "fixed z-40 flex h-screen w-[260px] flex-col border-r border-black/[0.06] bg-white/80 backdrop-blur-xl transition-transform duration-300 md:sticky md:translate-x-0",

          isEditorFocus && "hidden",

          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"

        )}

      >

        <div className="border-b border-black/[0.06] px-6 py-7">

          <BrandLogo href="/dashboard" showTagline size="md" />

        </div>



        <nav className="flex-1 space-y-0.5 px-3 py-5">

          {navItems.map((item) => {

            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : item.href === "/dashboard/builder"
                  ? pathname === "/dashboard/builder" ||
                    pathname.startsWith("/dashboard/builder/editor")
                  : item.href === "/dashboard/studio"
                    ? pathname === "/dashboard/studio" ||
                      pathname.startsWith("/dashboard/studio")
                    : item.href === "/dashboard/templates"
                      ? pathname === "/dashboard/templates"
                      : pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

            return (

              <Link

                key={item.name}

                href={item.href}

                onClick={() => setMobileMenuOpen(false)}

                className={cn(

                  "flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13px] font-medium transition-all duration-200",

                  isActive

                    ? "bg-zinc-900 text-white shadow-sm"

                    : "text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900"

                )}

              >

                <Icon

                  icon={item.icon}

                  size="sm"

                  className={isActive ? "text-white/90" : "text-zinc-400"}

                />

                {item.name}

              </Link>

            );

          })}

        </nav>



        <div className="space-y-2 border-t border-black/[0.06] p-4">

          {user && (

            <div className="px-2 pb-1">

              <p className="truncate text-[13px] font-medium text-zinc-900">

                {displayNameOf(user)}

              </p>

              <p className="truncate text-xs text-zinc-400">{user.email}</p>

            </div>

          )}

          <div className="rounded-[12px] border border-black/[0.06] bg-zinc-50/80 p-4">

            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">

              Plan

            </p>

            <p className="mt-0.5 text-sm font-semibold capitalize text-zinc-900">

              {plan}

            </p>

            {plan === "free" && (

              <UpgradeToProButton

                className="mt-3 w-full"

                size="sm"

                variant="default"

                label="Upgrade"

              />

            )}

          </div>

          <button

            type="button"

            onClick={handleLogout}

            className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"

          >

            <Icon icon={LogOut} size="sm" />

            Log out

          </button>

        </div>

      </aside>



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
          {!isFullWidthStudio && <UsageBanner />}

          {children}

        </main>

      </div>



      {mobileMenuOpen && (

        <div

          className="fixed inset-0 z-30 bg-zinc-900/20 backdrop-blur-sm md:hidden"

          onClick={() => setMobileMenuOpen(false)}

          role="presentation"

        />

      )}

    </div>

  );

}


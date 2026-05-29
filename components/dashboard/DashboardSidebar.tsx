"use client";

import { memo } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Library,
  UserCircle,
  LogOut,
  TrendingUp,
  LayoutGrid,
  PenLine,
  type LucideIcon,
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { Icon } from "@/components/ui/icon";
import { displayNameOf } from "@/hooks/useCurrentUser";
import type { CurrentUser } from "@/hooks/useCurrentUser";
import { cn } from "@/lib/utils";

const navItems: Array<{ name: string; href: string; icon: LucideIcon }> = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Templates", href: "/dashboard/templates", icon: LayoutGrid },
  { name: "Studio", href: "/dashboard/studio", icon: PenLine },
  { name: "Examples", href: "/dashboard/examples", icon: Library },
  { name: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
  { name: "Account", href: "/dashboard/account", icon: UserCircle },
];

function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/dashboard/studio") {
    return pathname === "/dashboard/studio" || pathname.startsWith("/dashboard/studio");
  }
  if (href === "/dashboard/templates") {
    return pathname === "/dashboard/templates" || pathname.startsWith("/dashboard/editor");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface DashboardSidebarProps {
  pathname: string;
  user: CurrentUser | null;
  isEditorFocus: boolean;
  mobileMenuOpen: boolean;
  onNavigate: () => void;
  onLogout: () => void;
}

function DashboardSidebarInner({
  pathname,
  user,
  isEditorFocus,
  mobileMenuOpen,
  onNavigate,
  onLogout,
}: DashboardSidebarProps) {
  return (
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
          const isActive = isNavItemActive(pathname, item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
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
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-[12px] px-3 py-2.5 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
        >
          <Icon icon={LogOut} size="sm" />
          Log out
        </button>
      </div>
    </aside>
  );
}

export const DashboardSidebar = memo(DashboardSidebarInner);

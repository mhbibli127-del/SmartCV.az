"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileEdit,
  Wand2,
  Library,
  UserCircle,
  LogOut,
  Search,
  Menu,
  X,
  TrendingUp,
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

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "CV Builder", href: "/dashboard/builder", icon: FileEdit },
  { name: "AI Generator", href: "/dashboard/generator", icon: Wand2 },
  { name: "Examples", href: "/dashboard/examples", icon: Library },
  { name: "Analytics", href: "/dashboard/analytics", icon: TrendingUp },
  { name: "Account", href: "/dashboard/account", icon: UserCircle },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
          success("Welcome back!", "You are signed in to SmartCV.");
          setWelcomeShown(true);
        }
      }
    };

    showWelcome();
  }, [welcomeShown, success, status]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
      toastError("Logout failed", "Please try again.");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleUpgrade = () => {
    router.push("/pricing");
  };

  return (
    <div className="flex min-h-screen bg-[#fafafa] text-gray-900">
      <button 
        type="button"
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-xl shadow-sm border border-gray-200"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <Icon icon={X} size="lg" label="Close menu" />
        ) : (
          <Icon icon={Menu} size="lg" label="Open menu" />
        )}
      </button>

      <aside className={`fixed md:sticky top-0 h-screen z-40 w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-8 border-b border-gray-200">
          <BrandLogo href="/dashboard" showTagline size="md" />
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-black text-white" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon
                  icon={item.icon}
                  size="md"
                  className={isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"}
                />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200 space-y-2">
          {user && (
            <div className="px-2 pb-2">
              <p className="truncate text-sm font-semibold text-gray-900">
                {displayNameOf(user)}
              </p>
              <p className="truncate text-xs text-gray-500">{user.email}</p>
            </div>
          )}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
            <p className="text-sm font-semibold text-gray-900 mb-1 capitalize">{plan} plan</p>
            <p className="text-xs text-gray-600 mb-3">
              {plan === "free" ? "Unlock unlimited AI & CVs" : "All features active"}
            </p>
            {plan === "free" && (
              <UpgradeToProButton
                className="w-full py-2 text-sm"
                variant="primary"
                label="Upgrade to Pro"
              />
            )}
          </div>
          <button 
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 hover:bg-gray-100 transition-colors font-medium rounded-xl"
          >
            <Icon icon={LogOut} size="md" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-gray-200 bg-white flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex-1 max-w-xl">
            <form onSubmit={handleSearch} className="relative">
              <Icon
                icon={Search}
                size="sm"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input 
                type="text" 
                placeholder="Search features, templates, or help..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm placeholder:text-gray-400 transition-all"
              />
            </form>
          </div>
          <div className="flex items-center gap-4">
            <NotificationPanel />
            <Link
              href="/dashboard/account"
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Account"
              title={user?.email ?? "Account"}
            >
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center font-bold text-sm text-white">
                {initialOf(user)}
              </div>
            </Link>
          </div>
        </header>
        <main className="p-8 max-w-7xl mx-auto w-full space-y-6">
          <UsageBanner />
          {children}
        </main>
      </div>
      
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          role="presentation"
        />
      )}
    </div>
  );
}

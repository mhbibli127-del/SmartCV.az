"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { Shield, Users, FileText, RefreshCw, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SUPER_ADMIN_EMAIL } from "@/lib/admin-config";

type SaasUser = {
  email: string;
  name: string;
  plan: string;
  cvUsed: number;
  cvLimit: number;
  status: string;
  createdAt: string;
};

type Analytics = {
  totalUsers: number;
  totalCvUsed: number;
  avgCvUsed: number;
};

export default function AdminPage() {
  const { error: toastError } = useToast();
  const [users, setUsers] = useState<SaasUser[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (res.status === 403 || res.status === 401) {
        setForbidden(true);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load");
      setUsers(Array.isArray(data.users) ? data.users : []);
      setAnalytics(data.analytics ?? null);
      setForbidden(false);
    } catch (err) {
      toastError("Load failed", err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q)
    );
  }, [users, search]);

  if (forbidden) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <Shield className="h-12 w-12 text-gray-400" />
        <h1 className="mt-4 text-xl font-semibold">Super Admin access required</h1>
        <p className="mt-2 text-sm text-gray-600">
          Only {SUPER_ADMIN_EMAIL} can access this dashboard.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <BrandLogo href="/dashboard" showTagline size="md" />
          <div className="flex gap-3">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Super Admin
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">SmartCV Dashboard</h1>
          <p className="mt-2 text-gray-600">User usage overview (open access — no billing)</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Total users</CardDescription>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{analytics?.totalUsers ?? "—"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardDescription>Total CVs created</CardDescription>
              <FileText className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{analytics?.totalCvUsed ?? "—"}</p>
              <p className="mt-1 text-xs text-gray-500">
                Avg {analytics?.avgCvUsed ?? 0} per user
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User list</CardTitle>
            <CardDescription>email · cv used</CardDescription>
            <div className="relative pt-4">
              <Search className="absolute left-3 top-1/2 mt-2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search users…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>CV Used</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={3} className="py-12 text-center text-gray-500">
                      Loading…
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  filtered.map((user) => (
                    <TableRow key={user.email}>
                      <TableCell>
                        <div className="font-medium">{user.email}</div>
                        <div className="text-xs text-gray-500">{user.name}</div>
                      </TableCell>
                      <TableCell>{user.cvUsed}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-lg bg-zinc-200/80", className)}
      aria-hidden
    />
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("space-y-3 rounded-xl border border-zinc-200 p-4", className)}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

export function SkeletonEditor() {
  return (
    <div className="flex h-[70vh] gap-4">
      <Skeleton className="hidden w-64 shrink-0 md:block" />
      <Skeleton className="flex-1" />
    </div>
  );
}

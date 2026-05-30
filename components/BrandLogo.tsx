import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  variant?: "full" | "mark";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  href?: string;
  className?: string;
};

const MARK_SIZES = { sm: 32, md: 40, lg: 48 } as const;

export default function BrandLogo({
  variant = "full",
  size = "md",
  showTagline = false,
  href,
  className = "",
}: BrandLogoProps) {
  const markPx = MARK_SIZES[size];

  const content =
    variant === "mark" ? (
      <Image
        src="/brand/logo-mark.svg"
        alt="SmartCV"
        width={markPx}
        height={markPx}
        priority
        className={className}
      />
    ) : (
      <div className={`flex items-center gap-3 ${className}`}>
        <Image
          src="/brand/logo-mark.svg"
          alt=""
          width={markPx}
          height={markPx}
          priority
          aria-hidden
        />
        <div className="leading-tight">
          <span className="text-xl font-bold tracking-tight text-gray-900">
            SmartCV
            <span className="text-indigo-600">.az</span>
          </span>
          {showTagline && (
            <p className="text-xs font-medium text-gray-500">
              Professional CV Builder
            </p>
          )}
        </div>
      </div>
    );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
      >
        {content}
      </Link>
    );
  }

  return content;
}

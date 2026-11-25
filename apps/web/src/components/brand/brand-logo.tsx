import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  variant?: "full" | "icon" | "text" | "badge";
  theme?: "blue" | "white";
  className?: string;
  iconHeight?: number;
  href?: string;
  showProductTag?: boolean;
}

export function BrandLogo({
  variant = "full",
  theme = "blue",
  className,
  iconHeight = 32,
  href = "/dashboard",
  showProductTag = true,
}: BrandLogoProps) {
  const isBlue = theme === "blue";

  const iconSrc = isBlue
    ? "/brand/Biru-Logo-no-bg.png"
    : "/brand/Putih-Logo-no-bg.png";

  const textSrc = isBlue
    ? "/brand/Biru-text-no-bg.png"
    : "/brand/Putih-text-no-bg.png";

  // Calculate proportional width based on standard 1:1 for logo icon and ~3.5:1 for wordmark text
  const iconWidth = Math.round(iconHeight * 1.0);
  const textHeight = Math.round(iconHeight * 0.72);
  const textWidth = Math.round(textHeight * 3.8);

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {variant !== "text" && (
        <div className="relative shrink-0 flex items-center justify-center">
          <Image
            src={iconSrc}
            alt="StackPlus Studio Logo"
            width={iconWidth}
            height={iconHeight}
            className="object-contain"
            priority
          />
        </div>
      )}

      {variant !== "icon" && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <Image
              src={textSrc}
              alt="StackPlus Studio"
              width={textWidth}
              height={textHeight}
              className="object-contain"
              priority
            />
            {showProductTag && (
              <span
                className={cn(
                  "px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded",
                  isBlue
                    ? "bg-brand-primary-soft text-brand-primary border border-brand-primary/20"
                    : "bg-white/15 text-white border border-white/20"
                )}
              >
                ERP
              </span>
            )}
          </div>
          {variant === "badge" && (
            <span
              className={cn(
                "text-[10px] tracking-tight font-medium -mt-0.5",
                isBlue ? "text-brand-ink-muted" : "text-white/70"
              )}
            >
              Distribution Management
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-md transition-opacity hover:opacity-90"
      >
        {content}
      </Link>
    );
  }

  return content;
}

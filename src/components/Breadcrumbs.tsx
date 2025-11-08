"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Split path and filter out empty segments
  const segments = pathname.split("/").filter(Boolean);

  if (!segments.length) return null;

  return (
    <nav className="px-2 sm:px-8 py-2 bg-background border-b border-border" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 sm:space-x-2 text-sm text-muted-foreground">
        {segments.map((seg, idx) => {
          const href = "/" + segments.slice(0, idx + 1).join("/");
          const label = seg.charAt(0).toUpperCase() + seg.slice(1);
          const isLast = idx === segments.length - 1;

          return (
            <li key={idx} className="flex items-center">
              {!isLast && (
                <>
                  <Link
                    href={href}
                    className={cn(
                      "hover:text-primary transition-colors",
                      "truncate max-w-[100px] sm:max-w-xs"
                    )}
                  >
                    {label}
                  </Link>
                  <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground shrink-0" />
                </>
              )}
              {isLast && (
                <span className="font-semibold text-foreground truncate max-w-[120px] sm:max-w-xs">
                  {label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

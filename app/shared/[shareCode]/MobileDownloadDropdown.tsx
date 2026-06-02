"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IOS_APP_STORE_URL, buildPlayStoreUrl } from "@/lib/invite-config";

/**
 * Single "Download" button used in the shared-outfit page navbar on mobile,
 * where rendering both store buttons side-by-side caused them to wrap and
 * stack vertically inside the tight h-16 navbar. Tapping opens a dropdown
 * with the two store options.
 *
 * On screens ≥sm the navbar uses the full <AppStoreButtons /> instead.
 */
export function MobileDownloadDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="rounded-none h-10 px-4 bg-btn-cta text-foreground hover:bg-btn-cta-hover border border-border gap-2"
        >
          <Download className="h-4 w-4" />
          <span className="text-sm font-medium">Download</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <a
            href={IOS_APP_STORE_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 cursor-pointer"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor">
              <path d="M16.72 12.56c-.03-2.2 1.8-3.25 1.88-3.3-1.03-1.5-2.62-1.71-3.18-1.73-1.35-.14-2.64.8-3.33.8-.7 0-1.77-.78-2.92-.76-1.5.02-2.9.87-3.67 2.21-1.57 2.72-.4 6.75 1.12 8.95.74 1.08 1.63 2.29 2.8 2.25 1.12-.04 1.55-.73 2.9-.73 1.35 0 1.74.73 2.92.71 1.21-.02 1.97-1.1 2.7-2.19.85-1.24 1.2-2.44 1.22-2.5-.03-.01-2.35-.9-2.37-3.71Z" />
              <path d="M14.75 4.5c.6-.73 1-1.74.89-2.75-.86.03-1.9.58-2.52 1.31-.56.65-1.05 1.69-.92 2.68.96.08 1.95-.49 2.55-1.24Z" />
            </svg>
            App Store
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={buildPlayStoreUrl()}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 cursor-pointer"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor">
              <path d="M4.02 3.5c-.3.3-.47.71-.47 1.24v14.52c0 .52.17.94.47 1.24l8.62-8.01-8.62-8Z" />
              <path d="M13.5 12.01 16.7 9.03 6.02 3.7c.1.08.18.18.26.3l7.22 8Z" />
              <path d="M13.5 12.01 6.28 20c-.08.12-.17.22-.26.3l10.68-5.33-3.2-2.96Z" />
              <path d="M20.47 11.07 17.94 9.8l-3.03 2.8 3.03 2.8 2.53-1.27c.68-.34.68-1.39 0-1.73Z" />
            </svg>
            Google Play
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

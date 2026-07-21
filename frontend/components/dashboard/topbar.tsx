"use client";

import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { useAuth } from "@/hooks/use-auth";

export function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between border-b border-border/60 px-4 py-4 md:px-6">
      <MobileNav />
      <div className="flex items-center gap-3">
        {user && (
          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <UserIcon className="h-4 w-4" aria-hidden="true" />
            {user.full_name}
          </div>
        )}
        <Button variant="ghost" size="sm" onClick={logout}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    </header>
  );
}

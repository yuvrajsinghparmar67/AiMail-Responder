"use client";

import { LogOut, Mail, User as UserIcon, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";

export default function SettingsPage() {
  const { user, isHydrating, logout } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-muted-foreground">Your account details.</p>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
          <CardDescription>Information tied to your account.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {isHydrating || !user ? (
            <>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-64" />
              <Skeleton className="h-5 w-40" />
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 text-sm">
                <UserIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>{user.full_name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <span>
                  Member since{" "}
                  {new Date(user.created_at).toLocaleDateString(undefined, {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </>
          )}

          <div className="border-t border-border/60 pt-4">
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, FileText, Coins, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/stat-card";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { RecentEmailsCard } from "@/components/dashboard/recent-emails-card";
import { RecentDraftsCard } from "@/components/dashboard/recent-drafts-card";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { fadeUp, staggerContainer } from "@/lib/motion";

export default function DashboardPage() {
  const { user } = useAuth();
  const { summary, recentEmails, recentDrafts, isLoading, error } = useDashboardData();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">
            Welcome{user ? `, ${user.full_name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s what&apos;s happening with your replies.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/generator">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            New reply
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Skeleton className="h-56 rounded-xl" />
            <Skeleton className="h-56 rounded-xl" />
          </div>
        </div>
      ) : error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : (
        summary && (
          <>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-1 gap-4 sm:grid-cols-3"
            >
              <motion.div variants={fadeUp}>
                <StatCard
                  label="Emails generated"
                  value={summary.total_emails_generated.toLocaleString()}
                  icon={Mail}
                  accent="primary"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatCard
                  label="Drafts saved"
                  value={summary.total_drafts_saved.toLocaleString()}
                  icon={FileText}
                  accent="secondary"
                />
              </motion.div>
              <motion.div variants={fadeUp}>
                <StatCard
                  label="Tokens used"
                  value={summary.total_token_usage.toLocaleString()}
                  icon={Coins}
                  accent="accent"
                />
              </motion.div>
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <UsageChart dailyUsage={summary.daily_usage} />
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-1 gap-6 lg:grid-cols-2"
            >
              <motion.div variants={fadeUp}>
                <RecentEmailsCard emails={recentEmails} />
              </motion.div>
              <motion.div variants={fadeUp}>
                <RecentDraftsCard drafts={recentDrafts} />
              </motion.div>
            </motion.div>
          </>
        )
      )}
    </div>
  );
}

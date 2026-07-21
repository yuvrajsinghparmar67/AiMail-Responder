"use client";

import { motion } from "framer-motion";
import { Mail, FileText, Coins } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/dashboard/stat-card";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { useAnalytics } from "@/hooks/use-analytics";
import { fadeUp, staggerContainer } from "@/lib/motion";

export default function AnalyticsPage() {
  const { summary, isLoading, error } = useAnalytics();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Analytics</h1>
        <p className="mt-1 text-muted-foreground">Your usage across the last 14 days.</p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-80 rounded-xl" />
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
          </>
        )
      )}
    </div>
  );
}

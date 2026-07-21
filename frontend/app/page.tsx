"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Zap,
  LayoutTemplate,
  Languages,
  BarChart3,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fadeUp, staggerContainer } from "@/lib/motion";

const FEATURES = [
  {
    icon: Zap,
    title: "Streaming replies",
    description: "Watch your reply generate token-by-token — no waiting on a spinner.",
  },
  {
    icon: Sparkles,
    title: "8 tones, 3 lengths",
    description: "From a quick casual note to a formal executive response, in one click.",
  },
  {
    icon: LayoutTemplate,
    title: "Reusable templates",
    description: "Save your team's playbooks for support, sales, HR, and more.",
  },
  {
    icon: Languages,
    title: "5 languages",
    description: "Reply in English, Hindi, Spanish, French, or German.",
  },
  {
    icon: BarChart3,
    title: "Usage analytics",
    description: "Track volume and token usage across your whole inbox workflow.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    description: "JWT-secured accounts, rate-limited endpoints, your data stays yours.",
  },
];

const TONES = [
  "Professional",
  "Friendly",
  "Formal",
  "Casual",
  "Apologetic",
  "Sales",
  "Customer Support",
  "Executive",
];

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* --- Nav ------------------------------------------------------------ */}
      <header className="container flex items-center justify-between py-6">
        <span className="font-display text-lg font-semibold text-gradient-brand">
          AI Email Responder
        </span>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </header>

      {/* --- Hero ------------------------------------------------------------ */}
      <section className="relative flex flex-col items-center gap-6 bg-gradient-radial-glow px-6 py-24 text-center">
        <motion.span
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="rounded-full border border-border/60 bg-card/60 px-4 py-1 text-sm text-muted-foreground backdrop-blur"
        >
          Powered by Gemini
        </motion.span>
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.05 }}
          className="max-w-2xl font-display text-4xl font-semibold tracking-tight sm:text-6xl"
        >
          Never stare at a{" "}
          <span className="text-gradient-brand">blank reply</span> again
        </motion.h1>
        <motion.p
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          className="max-w-xl text-muted-foreground"
        >
          Paste any incoming email, pick a tone, and get a polished, on-brand
          reply in seconds — streamed live, ready to send.
        </motion.p>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Button size="lg" asChild>
            <Link href="/register">
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.2 }}
          className="mt-4 flex flex-wrap items-center justify-center gap-2"
        >
          {TONES.map((tone) => (
            <span
              key={tone}
              className="rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground"
            >
              {tone}
            </span>
          ))}
        </motion.div>
      </section>

      {/* --- Feature grid ------------------------------------------------------ */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        variants={staggerContainer}
        className="container grid grid-cols-1 gap-4 py-16 sm:grid-cols-2 lg:grid-cols-3"
      >
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <motion.div key={title} variants={fadeUp}>
            <Card className="h-full">
              <CardContent className="flex flex-col gap-3 p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="font-medium">{title}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.section>

      {/* --- Final CTA -------------------------------------------------------- */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="container flex flex-col items-center gap-4 py-20 text-center"
      >
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">
          Ready to clear your inbox faster?
        </h2>
        <Button size="lg" asChild>
          <Link href="/register">
            Create your free account
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </motion.section>

      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} AI Email Responder. Built with Next.js and Gemini.
      </footer>
    </main>
  );
}

import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "Create account — AI Email Responder" };

export default function RegisterPage() {
  return (
    <AuthShell title="Create your account" description="Start generating polished replies in minutes.">
      <RegisterForm />
    </AuthShell>
  );
}

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result) {
        setError("Sign in failed. Please try again.");
        return;
      }

      if (result.error) {
        setError("Invalid email or password.");
        return;
      }

      // Full page navigation so the middleware picks up the new session cookie
      window.location.href = "/dashboard";
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto rounded-full bg-muted size-20 grid place-items-center">
            <Image src="/untitleddesign.png" alt="Bot" width={30} height={30} className="w-15 h-15" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to continue to your dashboard</p>
        </div>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Email & Password</TabsTrigger>
            <TabsTrigger value="instagram">Instagram</TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4 mt-4">
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="underline text-foreground">
                Create one
              </Link>
            </p>
          </TabsContent>

          <TabsContent value="instagram" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground text-center">
              Log in using your Instagram Business account.
            </p>
            <Button
              className="w-full"
              onClick={() => signIn("instagram", { callbackUrl: "/dashboard" })}
            >
              Continue with Instagram
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Prefer email?{" "}
              <Link href="/signup" className="underline text-foreground">
                Create an account
              </Link>
            </p>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground text-center">
          By continuing you agree to our{" "}
          <Link href="/terms-of-service" className="underline">Terms of Service</Link>{" "}
          and{" "}
          <Link href="/privacy-policy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}

"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <div className="space-y-2">
          <div className="mx-auto rounded-full bg-muted size-20 grid place-items-center">
                <Image
                  src="/untitleddesign.png"
                  alt="Bot"
                  width={30}
                  height={30}
                  className="w-15 h-15"
                />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to continue to your dashboard
          </p>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() => signIn("instagram", { callbackUrl: "/dashboard" })}
          >
            Continue with Instagram
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          By continuing you agree to our {" "}
          <Link href="/terms-of-service" className="underline">
            Terms of Service
          </Link>{" "}
          and {" "}
          <Link href="/privacy-policy" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

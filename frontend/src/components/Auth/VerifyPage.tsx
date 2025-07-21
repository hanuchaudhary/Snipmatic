import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function VerifyPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div>
        <h2 className="text-3xl font-instrumental mb-6">Check your email</h2>
      </div>
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">
            A sign in link has been sent to your email address.
          </p>

          <div className="bg-muted/50 rounded-lg p-4 border">
            <p className="text-sm text-muted-foreground">
              <span className="font-mono">localhost:3000</span>
            </p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Didn't receive the email? Check your spam folder or{" "}
              <Link href="/signin" className="text-primary hover:underline">
                try again
              </Link>
            </p>
          </div>

          <div className="pt-4">
            <Button variant="outline" asChild>
              <Link href="/signin">Back to Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

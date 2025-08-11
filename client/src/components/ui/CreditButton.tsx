"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import axios from "axios";
import Link from "next/link";

export function CreditButton() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchCredits();
    }
  }, [session?.user?.id]);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/credits");
      setCredits(response.data.credits || 0);
    } catch (error) {
      console.error("Error fetching credits:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <Link href="/credits" className="group">
      <Button variant="outline" size="sm" className="flex items-center gap-2">
        <span className="font-mono">
          {loading ? "..." : credits}
        </span>
        <span className="text-xs text-muted-foreground group-hover:text-orange-400 transition-colors">Credits</span>
      </Button>
    </Link>
  );
}

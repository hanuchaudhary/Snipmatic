import { useEffect, useState } from "react";
import { Link } from "react-router";

import {
  Check,
  CreditCard,
  ExternalLink,
  Palette,
} from "lucide-react";
import { toast } from "sonner";

import { ThemeSwitch } from "@/components/theme-switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PaymentApi } from "@/lib/api/payment";
import { updateUser, useSession } from "@/lib/auth/auth.client";
import { AVATARS } from "@/lib/avatars";

export function SettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setImage(user.image ?? "");
    }
  }, [user]);

  const save = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter a name.");
      return;
    }
    setSaving(true);
    try {
      const result = await updateUser({ name: trimmed, image: image || null });
      if (result.error)
        throw new Error(result.error.message || "Could not save profile");
      toast.success("Profile updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const openBilling = async () => {
    setOpeningPortal(true);
    try {
      const { url } = await PaymentApi.createPortal();
      window.location.assign(url);
    } catch {
      toast.error(
        "Billing is not available yet. Choose a plan to get started."
      );
      setOpeningPortal(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-20 pt-10 md:px-10 md:pt-16">
      <div className="mb-10">
        <h1 className="mt-2 heading">Settings</h1>
        <p className="mt-1 subheading">
          Manage your account and preferences.
        </p>
      </div>
      <div className="">
        <section
          aria-labelledby="personal-heading"
        >
          <div className="py-6 md:py-8">
            <div className="flex flex-wrap items-center gap-5">
              <Avatar className="size-20">
                <AvatarImage src={image} alt={name || "Your avatar"} />
                <AvatarFallback className="text-2xl">
                  {name.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Choose an avatar</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pick a character that feels like you.
                </p>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-12">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.name}
                  type="button"
                  onClick={() => setImage(avatar.url)}
                  aria-label={`Choose ${avatar.name} avatar`}
                  aria-pressed={image === avatar.url}
                  className={`relative aspect-square overflow-hidden rounded-2xl border-2 transition-transform hover:-translate-y-1 ${image === avatar.url ? "border-foreground" : "border-transparent"}`}
                >
                  <img
                    src={avatar.url}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  {image === avatar.url && (
                    <span className="absolute bottom-0 right-0 grid size-5 place-items-center rounded-tl-lg bg-foreground text-background">
                      <Check size={13} />
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <label className="block text-sm font-medium">
                Display name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={80}
                  className="mt-2 h-11 w-full rounded-xl border bg-background px-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="block text-sm font-medium">
                Email address
                <input
                  value={user?.email ?? ""}
                  readOnly
                  className="mt-2 h-11 w-full rounded-xl border bg-secondary/30 px-4 text-muted-foreground"
                />
              </label>
            </div>
            <div className="mt-7 flex justify-end">
              <Button
                onClick={() => void save()}
                disabled={saving || !user}
                className="rounded-full px-6"
              >
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        </section>
        <section className="flex flex-wrap items-center justify-between gap-5 py-6 md:py-8">
          <div className="flex items-center gap-4">
            <span className="grid size-11 place-items-center rounded-xl bg-secondary">
              <Palette size={20} />
            </span>
            <div>
              <h2 className="">Appearance</h2>
              <p className="text-sm text-muted-foreground">
                Choose a light or dark workspace.
              </p>
            </div>
          </div>
          <ThemeSwitch />
        </section>
        <section className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <span className="grid size-11 place-items-center rounded-xl bg-secondary">
              <CreditCard size={20} />
            </span>
            <div>
              <h2 className="">Billing and plan</h2>
              <p className="text-sm text-muted-foreground">
                Manage payment methods, invoices, and your subscription.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild className="rounded-full">
              <Link to="/pricing">View plans</Link>
            </Button>
            <Button
              onClick={() => void openBilling()}
              disabled={openingPortal}
              className="rounded-full"
            >
              {openingPortal ? "Opening…" : "Manage billing"}
              <ExternalLink size={15} />
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}

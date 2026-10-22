import { useEffect, useState } from "react";
import { Link } from "react-router";

import {
  Check,
} from "lucide-react";
import { toast } from "sonner";

import { ThemeSwitch } from "@/components/theme-switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PaymentApi } from "@/lib/api/payment";
import { updateUser, useSession } from "@/lib/auth/auth.client";
import { AVATARS } from "@/lib/avatars";
import { IconCreditCardFilled, IconExternalLinkFilled, IconPaletteFilled } from "@tabler/icons-react";
import { LabelInput } from "@/components/ui/label-input";
import { PlasticButton } from "@/components/ui/plastic-button";

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
              <LabelInput
                label="Display name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
              />
              <LabelInput
                label="Email address"
                type="email"
                value={user?.email ?? ""}
                readOnly
                isDisabled
                disabled
              />
            </div>
            <div className="mt-7 flex justify-end">
              <PlasticButton
                onClick={() => void save()}
                disabled={saving || !user}
              >
                {saving ? "Saving…" : "Save changes"}
              </PlasticButton>
            </div>
          </div>
        </section>
        <section className="flex flex-wrap items-center justify-between gap-5 py-6 md:py-8">
          <div className="flex items-center gap-4">
            <span className="grid size-11 place-items-center rounded-xl bg-secondary">
              <IconPaletteFilled size={20} />
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
              <IconCreditCardFilled size={20} />
            </span>
            <div>
              <h2 className="">Billing and plan</h2>
              <p className="text-sm text-muted-foreground">
                Manage payment methods, invoices, and your subscription.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <PlasticButton variant="white" className="rounded-full">
              <Link to="/pricing">View plans</Link>
            </PlasticButton>
            <PlasticButton variant="primary"
              onClick={() => void openBilling()}
              disabled={openingPortal}
            >
              {openingPortal ? "Opening…" : "Manage billing"}
              <IconExternalLinkFilled size={15} />
            </PlasticButton>
          </div>
        </section>
      </div>
    </main>
  );
}

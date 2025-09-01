import React, { useState } from "react";
import { Button } from "../ui/button";
import { signOut, useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface SignoutProps {
  closeMobileMenu?: () => void;
}

export function Signout({ closeMobileMenu }: SignoutProps) {
  const { data: session } = useSession();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSignOut = () => {
    signOut({
      redirectTo: "/",
    });
    closeMobileMenu?.();
    setIsDialogOpen(false);
  };

  return (
    <>
      {session && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size={"sm"}>
              Sign Out
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg rounded-4xl font-jost">
            <DialogHeader>
              <DialogTitle className="text-orange-400 font-instrumental tracking-wide">Confirm Sign Out</DialogTitle>
              <DialogDescription>
                Are you sure you want to sign out? You'll need to sign in again
                to access your account.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleSignOut}>
                Sign Out
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

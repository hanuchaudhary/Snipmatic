import * as React from "react";
import {
    ChevronDown,
    LogOut,
    Settings,
    User,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "@/lib/auth/auth.client";
import { useSidebar } from "./sidebar";
import { useNavigate } from "react-router";

export function ProfileDropdown() {
    const [logoutOpen, setLogoutOpen] = React.useState(false);
    const { data } = useSession()
    const { open } = useSidebar()
    const collapsed = !open;
    const navigate = useNavigate()
    const initials = data?.user.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const onProfile = () => {
        navigate("/profile")
    }
    const onSettings = () => {
        navigate("/setting")
    }
    const onLogout = async () => {
        await signOut()
        await navigate("/")
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Button
                        variant="ghost"
                        className={cn(
                            "h-auto w-full justify-start gap-3 px-2 py-2",
                            "hover:bg-accent",
                            collapsed && "justify-center px-2"
                        )}
                    >
                        <Avatar className="size-9 shrink-0">
                            <AvatarImage src={data?.user.image! || "/logo.png"} alt={data?.user.name} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>

                        {!collapsed && (
                            <>
                                <div className="min-w-0 flex-1 text-left">
                                    <p className="truncate text-sm font-medium">
                                        {data?.user.name}
                                    </p>

                                    <p className="truncate text-xs text-muted-foreground">
                                        {data?.user.email}
                                    </p>
                                </div>

                                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                            </>
                        )}
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    align={collapsed ? "start" : "end"}
                    side="top"
                    sideOffset={8}
                    className="w-60"
                >
                    <DropdownMenuGroup>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex items-center gap-3 py-1">
                                <Avatar className="size-9">
                                    <AvatarImage src={data?.user.image || "/logo.png"} alt={data?.user.name} />
                                    <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                        {data?.user.name}
                                    </p>

                                    <p className="truncate text-xs text-muted-foreground">
                                        {data?.user.email}
                                    </p>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={onProfile}>
                        <User className="mr-2 size-4" />
                        Profile
                    </DropdownMenuItem>

                    <DropdownMenuItem onClick={onSettings}>
                        <Settings className="mr-2 size-4" />
                        Settings
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onSelect={(event) => {
                            event.preventDefault();
                            setLogoutOpen(true);
                        }}
                    >
                        <LogOut className="mr-2 size-4" />
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you sure you want to logout?
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            You will need to sign in again to access your account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            Cancel
                        </AlertDialogCancel>

                        <AlertDialogAction
                            onClick={() => {
                                setLogoutOpen(false);
                                onLogout?.();
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Logout
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
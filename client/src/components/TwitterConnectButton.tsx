"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { IconBrandXFilled } from "@tabler/icons-react";
import axios from "axios";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function TwitterConnectButton({
    disabled,
}: {
    disabled?: boolean;
}) {
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);

    React.useEffect(() => {
        const checkConnection = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get("/api/auth/twitter/status");
                setIsConnected(response.data.isConnected);
            } catch (error) {
                console.error("Failed to check Twitter connection status:", error);
            } finally {
                setIsLoading(false);
            }
        };
        checkConnection();
        return () => {
            setIsConnected(false);
        };
    }, []);

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/auth/twitter/request-token");
            const data = await response.json();
            if (data.oauth_token) {
                window.location.href = `https://api.twitter.com/oauth/authenticate?oauth_token=${data.oauth_token}`;
            } else {
                throw new Error("Failed to get OAuth token");
            }
        } catch (error: any) {
            toast.error("Failed to connect Twitter account. Please try again.");
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisconnect = async () => {
        setIsLoading(true);
        try {
            await axios.post("/api/auth/twitter/disconnect");
            setIsConnected(false);
            setShowDisconnectDialog(false);
            toast.success("Twitter account disconnected successfully");
        } catch (error) {
            toast.error("Failed to disconnect Twitter account. Please try again.");
            console.error("Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleButtonClick = () => {
        if (isConnected) {
            setShowDisconnectDialog(true);
        } else {
            handleLogin();
        }
    };

    return (
        <div>
            <Button
                disabled={disabled || isLoading}
                className="rounded-full font-jost"
                size={"sm"}
                onClick={handleButtonClick}
            >
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    isConnected ? "Connected" : "Connect"
                )}
                <IconBrandXFilled className="size-3.5" />
            </Button>

            <Dialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
                <DialogContent className="rounded-4xl p-2">
                    <div className="p-6 border rounded-3xl space-y-6 font-jost">
                    <DialogHeader>
                        <DialogTitle className="font-instrumental tracking-wider text-orange-400">Disconnect Twitter Account</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to disconnect your Twitter account? You will need to reconnect it later if you want to use Twitter features.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDisconnectDialog(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDisconnect}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Disconnecting...
                                </>
                            ) : (
                                "Disconnect"
                            )}
                        </Button>
                    </DialogFooter>
</div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { LoginForm } from "./login-form";
import { LogIn } from "lucide-react";
import AppLogo from "../logos/app";

interface LoginModalProps {
    trigger?: React.ReactNode;
    open?: boolean;
    hidden: boolean;
    onOpenChange?: (open: boolean) => void;
}

export default function LoginModal({
    trigger,
    open,
    onOpenChange,
    hidden = false,
}: LoginModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleOpenChange = (newOpen: boolean) => {
        setIsOpen(newOpen);
        onOpenChange?.(newOpen);
    };

    return (
        <Dialog open={open ?? isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        className={`${
                            hidden ? "hidden" : "flex"
                        } items-center gap-3 justify-start`}
                    >
                        <LogIn />
                        Login
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6">
                            <AppLogo />
                        </div>
                        <h1 className="text-3xl font-bold text-primary font-mono tracking-wider">
                            Fino
                        </h1>
                    </div>

                    <DialogTitle className="mx-auto">Welcome back</DialogTitle>
                    <DialogDescription className="mx-auto">
                        Login with your email or Google account
                    </DialogDescription>
                </DialogHeader>
                <LoginForm />
            </DialogContent>
        </Dialog>
    );
}

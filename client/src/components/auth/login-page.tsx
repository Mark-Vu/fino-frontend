"use client";

import { LoginForm } from "./login-form";
import AppLogo from "../logos/app";

interface LoginPageProps {
    className?: string;
    loginWithGoogle?: boolean;
}

export function LoginPage({
    className = "",
    loginWithGoogle = true,
}: LoginPageProps) {
    return (
        <div
            className={`min-h-screen flex items-center justify-center p-6 ${className}`}
        >
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="w-6 h-6">
                            <AppLogo />
                        </div>
                        <h1 className="text-3xl font-bold text-primary font-mono tracking-wider">
                            Fino
                        </h1>
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">
                        Welcome back
                    </h2>
                    <p className="text-muted-foreground">
                        Login with your email or Google account
                    </p>
                </div>
                <LoginForm loginWithGoogle={loginWithGoogle} />
            </div>
        </div>
    );
}

"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { Provider } from "@supabase/supabase-js";
import { SITE_URL } from "@/lib/constants";

interface LoginFormProps extends React.ComponentProps<"div"> {
    loginWithGoogle?: boolean;
}

export function LoginForm({
    className,
    loginWithGoogle = true,
    ...props
}: LoginFormProps) {
    const [email, setEmail] = useState("");
    const [resendTimer, setResendTimer] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);

    // ⏳ Countdown effect
    useEffect(() => {
        if (resendTimer <= 0) return;
        const timer = setInterval(
            () => setResendTimer((prev) => prev - 1),
            1000
        );
        return () => clearInterval(timer);
    }, [resendTimer]);

    const handleMagicLinkLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsLoading(true);
        setMessage(null);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/confirm`,
                },
            });

            if (error) {
                setMessage({ type: "error", text: error.message });
            } else {
                setMessage({
                    type: "success",
                    text: "Check your email for the login link!",
                });
                setResendTimer(30);
            }
        } catch (error) {
            console.error("Error sending magic link:", error);
            setMessage({
                type: "error",
                text: "Something went wrong. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginWithProvider = async (provider: Provider) => {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${SITE_URL}/auth/callback`,
            },
        });

        if (error) {
            console.error(`Login error with ${provider}:`, error);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <div className="grid gap-6">
                {/* Email Login Form */}
                <form className="grid gap-6" onSubmit={handleMagicLinkLogin}>
                    <div className="grid gap-3">
                        <Label
                            htmlFor="email"
                            className="text-base font-medium"
                        >
                            Email Address
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-11"
                        />
                        <p className="text-sm text-muted-foreground">
                            We&#39;ll send a secure login link to your email. No
                            password required.
                        </p>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className="w-full mb-3 h-11"
                            disabled={isLoading || resendTimer > 0}
                        >
                            {isLoading
                                ? "Sending Login Link..."
                                : resendTimer > 0
                                ? `Resend Available in ${resendTimer}s`
                                : "Send Secure Login Link"}
                        </Button>

                        {message && (
                            <div
                                className={`p-3 rounded-md text-sm ${
                                    message.type === "success"
                                        ? "bg-green-50 text-green-700 border border-green-200"
                                        : "bg-red-50 text-red-700 border border-red-200"
                                }`}
                            >
                                {message.type === "success" ? (
                                    <div className="space-y-1">
                                        <p className="font-medium">
                                            ✓ Login link sent!
                                        </p>
                                        <p className="text-xs">
                                            Check your email inbox and click the
                                            secure login link to continue. The
                                            link will expire in 1 hour for
                                            security.
                                        </p>
                                    </div>
                                ) : (
                                    <p>{message.text}</p>
                                )}
                            </div>
                        )}
                    </div>
                </form>

                {/* Google Login - only show if enabled */}
                {loginWithGoogle && (
                    <>
                        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                            <span className="bg-background text-muted-foreground relative z-10 px-2">
                                Or continue with
                            </span>
                        </div>

                        <div className="flex flex-col gap-4">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() =>
                                    handleLoginWithProvider("google")
                                }
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    x="0px"
                                    y="0px"
                                    width="100"
                                    height="100"
                                    viewBox="0 0 48 48"
                                >
                                    <path
                                        fill="#fbc02d"
                                        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                                    ></path>
                                    <path
                                        fill="#e53935"
                                        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                                    ></path>
                                    <path
                                        fill="#4caf50"
                                        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                                    ></path>
                                    <path
                                        fill="#1565c0"
                                        d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                                    ></path>
                                </svg>
                                Login with Google
                            </Button>
                        </div>
                    </>
                )}
            </div>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By clicking continue, you agree to our{" "}
                <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>.
            </div>
        </div>
    );
}

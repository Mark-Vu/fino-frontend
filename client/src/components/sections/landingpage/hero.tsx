"use client";

import { Button } from "@/components/ui/button";
import LoginModal from "../../auth/login-modal";
import { ArrowRight } from "lucide-react";

export function Hero() {
    return (
        <section className="relative overflow-hidden">
            {/* Gradients */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-96 start-1/2 -translate-x-1/2"
            >
                <div className="bg-gradient-to-r from-violet-300/50 to-purple-100 blur-3xl w-[400px] h-[700px] -rotate-60 -translate-x-40" />
                <div className="bg-gradient-to-tl from-blue-50 via-blue-100 to-blue-50 blur-3xl w-[1440px] h-[800px] rounded-full origin-top-left -rotate-12 -translate-x-60" />
            </div>
            {/* End Gradients */}

            <div className="relative z-10">
                <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
                    <div className="max-w-2xl text-center mx-auto">
                        <p className="inline-block text-sm font-medium bg-clip-text bg-gradient-to-l from-blue-600 to-violet-500 text-transparent">
                            Fino: Financial Data, Simplified
                        </p>

                        {/* Title */}
                        <div className="mt-5 max-w-2xl mx-auto">
                            <h1 className="block font-semibold text-foreground text-4xl md:text-5xl lg:text-6xl">
                                Convert Bank Statements to CSV — Fast and Secure
                            </h1>
                        </div>
                        {/* End Title */}

                        <div className="mt-5 max-w-3xl mx-auto">
                            <p className="text-lg text-muted-foreground">
                                Fino helps you turn messy bank statements (PDF,
                                PNG, JPEG, TIFF) into clean, structured CSVs
                                ready for analysis. Use it free without an
                                account, or sign in for saved history and faster
                                workflows.
                            </p>
                        </div>

                        <div className="mt-8 gap-3 flex justify-center">
                            <Button variant="default" asChild>
                                <a href="#try-services">Try it free</a>
                            </Button>
                            <LoginModal
                                trigger={
                                    <Button variant="outline">
                                        Claim 10 free trials with our most
                                        advanced model
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                }
                                hidden={false}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

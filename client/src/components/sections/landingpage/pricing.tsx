"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import LoginModal from "../../auth/login-modal";

interface PricingFeature {
    text: string;
    included: boolean;
}

interface PricingPlan {
    id: string;
    name: string;
    description: string;
    price: number | string;
    period: string;
    features: PricingFeature[];
    ctaText: string;
    ctaVariant: "default" | "outline" | "secondary";
    isPopular?: boolean;
    isEnterprise?: boolean;
}

const pricingPlans: PricingPlan[] = [
    {
        id: "professional",
        name: "Professional",
        description: "Use everything in our tools with most advanced features",
        price: 29,
        period: "month",
        features: [
            { text: "Unlimited bank statement conversions", included: true },
            {
                text: "Delivery receipt converter (JPEG, PNG, TIFF)",
                included: true,
            },
            { text: "Advanced AI processing models", included: true },
            { text: "Batch file processing (up to 10 files)", included: true },
            { text: "Priority processing queue", included: true },
            {
                text: "Export to multiple formats (CSV, Excel, JSON)",
                included: true,
            },
            { text: "24/7 email support", included: true },
        ],
        ctaText: "Get started today",
        ctaVariant: "outline",
        isPopular: true,
    },
    {
        id: "enterprise",
        name: "Enterprise",
        description: "Custom solutions tailored to your workflow",
        price: "Contact us",
        period: "month",
        features: [
            { text: "Everything in Professional", included: true },
            { text: "Custom workflow integration", included: true },
            { text: "Priority phone & email support", included: true },
            { text: "Custom data extraction rules", included: true },
            { text: "White-label solutions", included: true },
            { text: "Custom integrations & webhooks", included: true },
        ],
        ctaText: "Contact sales",
        ctaVariant: "default",
        isEnterprise: true,
    },
];

interface PricingModalProps {
    trigger?: React.ReactNode;
    hidden?: boolean;
}

export function PricingModal({ trigger }: PricingModalProps) {
    return (
        <Dialog>
            {trigger && (
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl font-bold">
                            Choose Your Plan
                        </DialogTitle>
                    </DialogHeader>
                    <PricingContent />
                </DialogContent>
            )}
        </Dialog>
    );
}

function PricingContent() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-base/7 font-semibold text-primary">
                    Pricing
                </h2>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-balance text-foreground sm:text-4xl">
                    Choose the right plan for you
                </p>
                <p className="mt-4 text-lg text-muted-foreground">
                    Choose an affordable plan that&apos;s packed with the best
                    features for converting your financial documents, automating
                    workflows, and driving business efficiency.
                </p>
            </div>

            {/* Pricing cards */}
            <div className="grid max-w-4xl mx-auto grid-cols-1 gap-6 lg:grid-cols-2">
                {pricingPlans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`relative rounded-3xl p-6 ring-1 ring-border ${
                            plan.isEnterprise
                                ? "bg-card shadow-2xl"
                                : "bg-card/60"
                        }`}
                    >
                        {/* Popular badge */}
                        {plan.isPopular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                                    Most Popular
                                </span>
                            </div>
                        )}

                        {/* Plan header */}
                        <h3
                            id={`tier-${plan.id}`}
                            className="text-lg font-semibold text-primary"
                        >
                            {plan.name}
                        </h3>
                        <p className="mt-2 flex items-baseline gap-x-2">
                            <span className="text-4xl font-semibold tracking-tight text-foreground">
                                {typeof plan.price === "number"
                                    ? `$${plan.price}`
                                    : plan.price}
                            </span>
                            {typeof plan.price === "number" && (
                                <span className="text-base text-muted-foreground">
                                    /{plan.period}
                                </span>
                            )}
                        </p>
                        <p className="mt-3 text-sm text-muted-foreground">
                            {plan.description}
                        </p>

                        {/* Features list */}
                        <ul
                            role="list"
                            className="mt-6 space-y-2 text-sm text-muted-foreground"
                        >
                            {plan.features.map((feature, index) => (
                                <li key={index} className="flex gap-x-3">
                                    <Check
                                        className="h-5 w-5 flex-none text-primary mt-0.5"
                                        aria-hidden="true"
                                    />
                                    <span className="text-sm">
                                        {feature.text}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        {/* CTA Button */}
                        <div className="mt-6">
                            {plan.isEnterprise ? (
                                <Button
                                    asChild
                                    variant={plan.ctaVariant}
                                    className="w-full"
                                >
                                    <a
                                        href="mailto:sales@fino.com?subject=Enterprise Plan Inquiry"
                                        aria-describedby={`tier-${plan.id}`}
                                    >
                                        {plan.ctaText}
                                    </a>
                                </Button>
                            ) : (
                                <LoginModal
                                    trigger={
                                        <Button
                                            variant={plan.ctaVariant}
                                            className="w-full"
                                        >
                                            {plan.ctaText}
                                        </Button>
                                    }
                                    hidden={false}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Additional info */}
            <div className="text-center">
                <p className="text-sm text-muted-foreground">
                    All plans include 10 free credits. No credit card required.
                    Cancel anytime.
                </p>
            </div>
        </div>
    );
}

export function Pricing() {
    return (
        <section className="relative isolate bg-background px-6 lg:px-8">
            {/* Background gradient */}
            <div
                aria-hidden="true"
                className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl"
            >
                <div
                    className="mx-auto aspect-[1155/678] w-[288.75px] bg-gradient-to-tr from-primary/30 to-violet-500/30 opacity-30"
                    style={{
                        clipPath:
                            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                    }}
                />
            </div>

            <PricingContent />
        </section>
    );
}

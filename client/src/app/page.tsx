"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth-context";
import { SIDE_BAR_SECTIONS, type SidebarActiveSection } from "@/lib/constants";
import { BankStatementConverter } from "@/components/bank-statement-converter";

export default function Home() {
    const { user, loading } = useAuth();
    const [activeSection, setActiveSection] = useState<SidebarActiveSection>(
        SIDE_BAR_SECTIONS.DASHBOARD
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (user) {
        return (
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    } as React.CSSProperties
                }
            >
                <AppSidebar
                    variant="inset"
                    onSectionChange={setActiveSection}
                    activeSection={activeSection}
                />
                <SidebarInset>
                    <SiteHeader activeSection={activeSection} />
                    <div className="flex flex-1 flex-col">
                        <div className="@container/main flex flex-1 flex-col gap-2">
                            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                                {activeSection ===
                                    SIDE_BAR_SECTIONS.DASHBOARD && (
                                    <>
                                        <SectionCards />
                                        <div className="px-4 lg:px-6">
                                            <div className="grid gap-6">
                                                <div className="bg-card border rounded-lg p-6">
                                                    <h2 className="text-xl font-semibold mb-4">
                                                        Welcome back,{" "}
                                                        {user.email}!
                                                    </h2>
                                                    <p className="text-muted-foreground">
                                                        This is your main
                                                        dashboard. Navigate
                                                        using the sidebar to
                                                        explore different
                                                        sections.
                                                    </p>
                                                </div>
                                                <div className="grid md:grid-cols-3 gap-6">
                                                    <div className="bg-card border rounded-lg p-6">
                                                        <h3 className="text-lg font-semibold mb-3">
                                                            Quick Stats
                                                        </h3>
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between">
                                                                <span>
                                                                    Total
                                                                    Projects
                                                                </span>
                                                                <span className="font-medium">
                                                                    12
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>
                                                                    Active Tasks
                                                                </span>
                                                                <span className="font-medium">
                                                                    8
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>
                                                                    Team Members
                                                                </span>
                                                                <span className="font-medium">
                                                                    5
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="bg-card border rounded-lg p-6">
                                                        <h3 className="text-lg font-semibold mb-3">
                                                            Recent Activity
                                                        </h3>
                                                        <p className="text-muted-foreground text-sm">
                                                            No recent activity
                                                            to show.
                                                        </p>
                                                    </div>
                                                    <div className="bg-card border rounded-lg p-6">
                                                        <h3 className="text-lg font-semibold mb-3">
                                                            Quick Actions
                                                        </h3>
                                                        <div className="space-y-2">
                                                            <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm">
                                                                Create Project
                                                            </button>
                                                            <button className="w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors text-sm">
                                                                View Analytics
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeSection ===
                                    SIDE_BAR_SECTIONS.PDF_TO_CSV && (
                                    <BankStatementConverter />
                                )}
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="mb-12">
                <h1 className="text-5xl font-bold text-primary mb-6">
                    Welcome to Fino
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                    A social media platform built for SaaS founders to connect,
                    share growth strategies, and collaborate on building
                    scalable products.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors">
                        Get Started
                    </button>
                    <button className="bg-secondary text-secondary-foreground px-8 py-3 rounded-lg text-lg font-semibold hover:bg-secondary/90 transition-colors">
                        Learn More
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Connect</h3>
                    <p className="text-muted-foreground">
                        Join a community of entrepreneurs and exchange insights
                    </p>
                </div>

                <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Grow</h3>
                    <p className="text-muted-foreground">
                        Share growth strategies and learn from others&apos;
                        experiences
                    </p>
                </div>

                <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                            className="w-8 h-8 text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Collaborate</h3>
                    <p className="text-muted-foreground">
                        Work together on building scalable products
                    </p>
                </div>
            </div>
        </div>
    );
}

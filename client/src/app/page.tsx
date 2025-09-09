"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth-context";
import { SIDE_BAR_SECTIONS, type SidebarActiveSection } from "@/lib/constants";
import { Hero } from "@/components/sections/landingpage/hero";
import { TryOurServices } from "@/components/sections/landingpage/try-our-services";
import { Pricing } from "@/components/sections/landingpage/pricing";
import { MultipleBankStatementConverter } from "@/components/multiple-bank-statement-converter";
import { DeliveryReceiptConverter } from "@/components/delivery-receipt-converter";
import Footer from "@/components/sections/landingpage/footer";

// Helper function to get section from URL hash
const getSectionFromHash = (): SidebarActiveSection => {
    if (typeof window === "undefined") return SIDE_BAR_SECTIONS.DASHBOARD;

    const hash = window.location.hash;
    switch (hash) {
        case "#dashboard":
            return SIDE_BAR_SECTIONS.DASHBOARD;
        case "#bankstatement-converter":
            return SIDE_BAR_SECTIONS.PDF_TO_CSV;
        case "#delivery-receipt-converter":
            return SIDE_BAR_SECTIONS.DELIVERY_RECEIPT;
        default:
            return SIDE_BAR_SECTIONS.DASHBOARD;
    }
};

export default function Home() {
    const { user, loading } = useAuth();

    const [activeSection, setActiveSection] = useState<SidebarActiveSection>(
        SIDE_BAR_SECTIONS.DASHBOARD
    );

    // Handle hash changes and initial load
    useEffect(() => {
        const handleHashChange = () => {
            const newSection = getSectionFromHash();
            setActiveSection(newSection);
        };

        if (!window.location.hash) {
            window.history.replaceState(null, "", "#bankstatement-converter");
        }
        handleHashChange();

        // Listen for hash changes
        window.addEventListener("hashchange", handleHashChange);

        return () => {
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, []);

    // Handle section change and update URL hash
    const handleSectionChange = (section: SidebarActiveSection) => {
        setActiveSection(section);

        // Update URL hash
        let hash = "#dashboard";
        if (section === SIDE_BAR_SECTIONS.PDF_TO_CSV) {
            hash = "#bankstatement-converter";
        } else if (section === SIDE_BAR_SECTIONS.DELIVERY_RECEIPT) {
            hash = "#delivery-receipt-converter";
        }

        if (window.location.hash !== hash) {
            window.history.pushState(null, "", hash);
        }
    };

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
                    onSectionChange={handleSectionChange}
                    activeSection={activeSection}
                />
                <SidebarInset>
                    <SiteHeader activeSection={activeSection} />
                    <div className="flex flex-1 flex-col bg-background">
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
                                    <MultipleBankStatementConverter />
                                )}

                                {activeSection ===
                                    SIDE_BAR_SECTIONS.DELIVERY_RECEIPT && (
                                    <DeliveryReceiptConverter />
                                )}
                            </div>
                        </div>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        );
    }

    return (
        <div className="flex flex-col gap-16">
            <Hero />
            <TryOurServices />
            <Pricing />
            <Footer />
        </div>
    );
}

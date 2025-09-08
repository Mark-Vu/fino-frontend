"use client";

import * as React from "react";
import { FileCog, Receipt } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/auth-context";
import {
    SIDE_BAR_SECTIONS,
    URLS,
    type SidebarActiveSection,
} from "@/lib/constants";
import AppLogo from "./logos/app";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    onSectionChange?: (section: SidebarActiveSection) => void;
    activeSection?: SidebarActiveSection;
}

export function AppSidebar({
    onSectionChange,
    activeSection,
    ...props
}: AppSidebarProps) {
    const { user } = useAuth();
    const data = {
        user: user,
        navMain: [
            // {
            //     title: SIDE_BAR_SECTIONS.DASHBOARD,
            //     section: SIDE_BAR_SECTIONS.DASHBOARD,
            //     icon: LayoutDashboardIcon,
            // },
            {
                title: SIDE_BAR_SECTIONS.PDF_TO_CSV,
                section: SIDE_BAR_SECTIONS.PDF_TO_CSV,
                icon: FileCog,
            },
            {
                title: SIDE_BAR_SECTIONS.DELIVERY_RECEIPT,
                section: SIDE_BAR_SECTIONS.DELIVERY_RECEIPT,
                icon: Receipt,
            },
        ],
    };

    const handleSectionClick = (section: SidebarActiveSection) => {
        if (onSectionChange) {
            onSectionChange(section);
        }
    };

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5"
                        >
                            <button
                                onClick={() =>
                                    handleSectionClick(
                                        SIDE_BAR_SECTIONS.DASHBOARD
                                    )
                                }
                                className="w-full text-left"
                            >
                                <a
                                    href={URLS.home}
                                    className="flex items-center gap-2 text-3xl font-bold text-primary"
                                >
                                    <AppLogo />
                                    Fino
                                </a>
                            </button>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain
                    items={data.navMain}
                    onSectionClick={handleSectionClick}
                    activeSection={activeSection}
                />
            </SidebarContent>
            <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
        </Sidebar>
    );
}

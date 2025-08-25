"use client";

import * as React from "react";
import {
    IconDashboard,
    IconFile,
    IconInnerShadowTop,
} from "@tabler/icons-react";

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
import { SIDE_BAR_SECTIONS, type SidebarActiveSection } from "@/lib/constants";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    onSectionChange?: (section: SidebarActiveSection) => void;
    activeSection?: SidebarActiveSection;
}

const data = {
    user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
        {
            title: SIDE_BAR_SECTIONS.DASHBOARD,
            section: SIDE_BAR_SECTIONS.DASHBOARD,
            icon: IconDashboard,
        },
        {
            title: SIDE_BAR_SECTIONS.PDF_TO_CSV,
            section: SIDE_BAR_SECTIONS.PDF_TO_CSV,
            icon: IconFile,
        },
    ],
};

export function AppSidebar({
    onSectionChange,
    activeSection,
    ...props
}: AppSidebarProps) {
    const { user } = useAuth();

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
                                <IconInnerShadowTop className="!size-5" />
                                <span className="text-3xl font-semibold">
                                    Fino
                                </span>
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

"use client";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { type SidebarActiveSection } from "@/lib/constants";
import { LucideIcon } from "lucide-react";

export function NavMain({
    items,
    onSectionClick,
    activeSection,
}: {
    items: {
        title: string;
        section: SidebarActiveSection;
        icon?: LucideIcon;
    }[];
    onSectionClick?: (section: SidebarActiveSection) => void;
    activeSection?: SidebarActiveSection;
}) {
    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    <SidebarMenuItem className="flex items-center gap-2">
                        {/* <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <IconCirclePlusFilled />
              <span>Quick Create</span>
            </Button> */}
                        {/* <Button
                            size="icon"
                            className="size-8 group-data-[collapsible=icon]:opacity-0"
                            variant="outline"
                        >
                            <IconMail />
                            <span className="sr-only">Inbox</span>
                        </Button> */}
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                tooltip={item.title}
                                onClick={() => onSectionClick?.(item.section)}
                                className={
                                    activeSection === item.section
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground cursor-pointer"
                                        : "cursor-pointer"
                                }
                            >
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

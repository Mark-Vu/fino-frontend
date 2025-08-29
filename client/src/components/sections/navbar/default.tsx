"use client";

import { Menu } from "lucide-react";
import { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Button, type ButtonProps } from "../../ui/button";
import {
    Navbar as NavbarComponent,
    NavbarLeft,
    NavbarRight,
} from "../../ui/navbar";
import Navigation from "../../ui/navigation";
import { Sheet, SheetContent, SheetTrigger } from "../../ui/sheet";
import { URLS } from "@/lib/constants";
import LoginModal from "../../auth/login-modal";
import AppLogo from "../../logos/app";

interface NavbarLink {
    text: string;
    href: string;
}

interface NavbarActionProps {
    text: string;
    href: string;
    variant?: ButtonProps["variant"];
    icon?: ReactNode;
    iconRight?: ReactNode;
    isButton?: boolean;
}

interface NavbarProps {
    logo?: ReactNode;
    name?: string;
    homeUrl?: string;
    mobileLinks?: NavbarLink[];
    actions?: NavbarActionProps[];
    showNavigation?: boolean;
    customNavigation?: ReactNode;
    className?: string;
}

export default function Navbar({
    logo = <AppLogo />,
    name = "Fino",
    homeUrl = URLS.home,
    mobileLinks = [
        // {
        //     text: "Getting Started",
        //     href: "https://www.launchuicomponents.com/",
        // },
        // { text: "Components", href: "https://www.launchuicomponents.com/" },
        // { text: "Documentation", href: "https://www.launchuicomponents.com/" },
    ],
    actions = [
        {
            text: "Get started",
            href: "#",
            isButton: true,
            variant: "default",
        },
    ],
    showNavigation = true,
    customNavigation,
    className,
}: NavbarProps) {
    return (
        <header className={cn("sticky top-0 z-50 -mb-4 px-4 pb-4", className)}>
            <div className="fade-bottom bg-background/15 absolute left-0 h-24 w-full backdrop-blur-lg"></div>
            <div className="max-w-container relative mx-auto">
                <NavbarComponent>
                    <NavbarLeft>
                        <a
                            href={homeUrl}
                            className="flex items-center gap-2 text-xl font-bold text-primary"
                        >
                            {logo}

                            {name}
                        </a>
                        {showNavigation && (customNavigation || <Navigation />)}
                    </NavbarLeft>
                    <NavbarRight>
                        {actions.map((action, index) => (
                            <LoginModal
                                key={index}
                                trigger={
                                    <Button variant="default">
                                        {action.icon}
                                        {action.text}
                                        {action.iconRight}
                                    </Button>
                                }
                                hidden={false}
                            />
                        ))}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="shrink-0 md:hidden"
                                >
                                    <Menu className="size-5" />
                                    <span className="sr-only">
                                        Toggle navigation menu
                                    </span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right">
                                <nav className="grid gap-6 text-lg font-medium">
                                    <a
                                        href={homeUrl}
                                        className="flex items-center gap-2 text-xl font-bold"
                                    >
                                        <span>{name}</span>
                                    </a>
                                    {mobileLinks.map((link, index) => (
                                        <a
                                            key={index}
                                            href={link.href}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            {link.text}
                                        </a>
                                    ))}
                                    <LoginModal
                                        trigger={
                                            <span className="text-muted-foreground hover:text-foreground cursor-pointer">
                                                Sign in
                                            </span>
                                        }
                                        hidden={false}
                                    />
                                </nav>
                            </SheetContent>
                        </Sheet>
                    </NavbarRight>
                </NavbarComponent>
            </div>
        </header>
    );
}

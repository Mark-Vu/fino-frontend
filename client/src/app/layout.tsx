import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { createClient } from "@/utils/supabase/server";
import Providers from "../context/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import Navbar from "@/components/sections/navbar/default";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Fino",
    description:
        "All your accounting needs in one place. Create invoices, convert PDFs to CSV, Bank statement converter, and manage business finances anytime, anywhere. Try Fino free on desktop, mobile, or tablet.",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    return (
        <html lang="en" suppressHydrationWarning className="">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <Providers authUser={user}>
                        <div className="min-h-screen">
                            {!user && <Navbar />}

                            <main>{children}</main>
                        </div>
                    </Providers>
                </ThemeProvider>
                <Toaster position="top-center" />
            </body>
        </html>
    );
}

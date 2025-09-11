import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "../context/auth-context";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "@/components/sections/navbar/default";
import { TenantLayout } from "@/components/tenant/tenant-layout";
import { getCurrentUser } from "./actions/user.action";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Fino | Accounting Tools - Bank Statement, Delivery Receipt Converter",
    description:
        "All your accounting needs in one place. Create invoices, convert PDFs, JPEG, TIFF, Images to CSV, Bank statement, Delivery receipt converter, Try Fino free on desktop, mobile, or tablet.",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const user = await getCurrentUser();

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
                        <TenantLayout>
                            <div className="min-h-screen">
                                {!user && <Navbar />}

                                <main>{children}</main>
                            </div>
                        </TenantLayout>
                    </Providers>
                </ThemeProvider>
                <Toaster position="top-center" />
                <Analytics />
            </body>
        </html>
    );
}

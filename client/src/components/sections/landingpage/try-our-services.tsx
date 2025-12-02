"use client";

import { PublicBankStatementConverter } from "@/components/public-bank-statement-converter";
import { FileCog, Receipt } from "lucide-react";
import LoginModal from "../../auth/login-modal";

interface Service {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    component: React.ComponentType;
    isAvailable: boolean;
}

const services: Service[] = [
    {
        id: "bank-statement-converter",
        title: "Bank Statement Converter",
        description:
            "Convert PDF bank statements to clean, structured CSV files",
        icon: FileCog,
        component: PublicBankStatementConverter,
        isAvailable: true,
    },
    {
        id: "delivery-receipt-converter",
        title: "Delivery Receipt Converter",
        description: "Convert image receipts (JPEG, PNG, TIFF) to CSV format",
        icon: Receipt,
        component: () => (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full mb-4 border-2 border-primary/30">
                    <Receipt className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground mb-4">
                    Delivery Receipt Converter is available for logged in users
                </p>
                <LoginModal
                    trigger={
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary/20 transition-colors cursor-pointer">
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                            Sign in to access
                        </div>
                    }
                    hidden={false}
                />
            </div>
        ),
        isAvailable: false,
    },
];

export function TryOurServices() {
    return (
        <section
            id="try-services"
            className="py-16 max-w-screen-2xl mx-auto w-full"
        >
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold">
                        Try our services
                    </h2>
                </div>

                <div className="flex flex-col gap-12 mx-auto justify-center items-center w-full">
                    {services.map((service) => (
                        <div key={service.id} className="relative w-full ">
                            {/* Service Header */}
                            <div className="flex items-center gap-4 mb-6 w-full">
                                {/* Service Info */}
                                <div className="flex-1 w-full text-center">
                                    <div className="flex items-center gap-3 mb-2 w-full justify-center">
                                        <service.icon className="w-6 h-6 text-primary" />
                                        <h3 className="text-2xl font-bold text-foreground">
                                            {service.title}
                                        </h3>
                                    </div>
                                    <p className="text-muted-foreground text-lg">
                                        {service.description}
                                    </p>
                                </div>
                            </div>

                            {/* Service Component */}
                            <div className="max-w-screen-lg mx-auto w-full">
                                <service.component />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

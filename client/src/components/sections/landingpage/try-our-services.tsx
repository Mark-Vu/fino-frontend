"use client";

import { PublicBankStatementConverter } from "@/components/public-bank-statement-converter";

export function TryOurServices() {
    return (
        <section id="try-services" className="py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold">
                        Try our services
                    </h2>
                    <p className="text-muted-foreground mt-3">
                        Start with our most popular tool: Bank Statement
                        Converter. Upload your PDF and get a clean CSV in
                        seconds.
                    </p>
                </div>

                <div className="flex flex-col gap-10">
                    <div
                        id="public-converter"
                        className="max-w-5xl mx-auto w-full"
                    >
                        <PublicBankStatementConverter />
                    </div>
                </div>
            </div>
        </section>
    );
}

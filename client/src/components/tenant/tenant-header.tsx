"use client";

import { useTenant } from "@/context/tenant-context";
import { Building2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TenantRole } from "@/services/users.service";

export function TenantHeader() {
    const { tenant, user } = useTenant();

    if (!tenant) return null;

    return (
        <div className="border-b bg-muted/30 px-4 py-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">
                        {tenant.companyName}
                    </span>
                </div>

                {user?.tenantRole !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        {user.tenantRole === TenantRole.Member
                            ? "Member"
                            : "Admin"}
                    </Badge>
                )}
            </div>
        </div>
    );
}

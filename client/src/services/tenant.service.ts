import api from "@/lib/api";

export interface RequestTenantAccessRequest {
    subdomain: string;
}

export interface RequestTenantAccessResponse {
    message: string;
    tenantId: string;
    tenantName: string;
    status: string;
}

/**
 * Request access to a tenant by subdomain
 * @param subdomain - The tenant subdomain (e.g., "mediphar-usa")
 * @returns Promise with tenant access request response
 * @throws Error if request fails or user already belongs to a tenant
 */
export async function requestTenantAccess(
    subdomain: string
): Promise<RequestTenantAccessResponse> {
    try {
        const response = await api.post<RequestTenantAccessResponse>(
            "/tenant/request-access",
            {
                subdomain,
            }
        );
        return response.data;
    } catch (error) {
        console.error("Failed to request tenant access:", error);
        throw error;
    }
}

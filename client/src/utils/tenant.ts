import { SITE_URL } from "@/lib/constants";

/**
 * Extract subdomain from current URL
 * @returns subdomain string or null if not found
 */
export function getSubdomainFromUrl(): string | null {
    if (typeof window === "undefined") return null;

    const hostname = window.location.hostname;
    const siteUrl = new URL(SITE_URL);
    const mainDomain = siteUrl.hostname;

    // Handle localhost development
    if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
        // For localhost, check if there's a subdomain in the URL
        // e.g., "mediphar-usa.localhost:3000" -> "mediphar-usa"
        const parts = hostname.split(".");
        if (
            parts.length > 1 &&
            parts[0] !== "localhost" &&
            parts[0] !== "127"
        ) {
            return parts[0];
        }
        return null;
    }

    // Handle production domains
    const parts = hostname.split(".");

    // For the main domain, subdomain is the first part
    if (hostname.endsWith(mainDomain)) {
        if (parts.length >= 3) {
            return parts[0];
        }
        return null;
    }

    return null;
}

/**
 * Check if current URL is a tenant subdomain
 * @returns boolean indicating if current URL is a tenant subdomain
 */
export function isTenantSubdomain(): boolean {
    const subdomain = getSubdomainFromUrl();
    return subdomain !== null && subdomain !== "www";
}

/**
 * Get the main domain URL (redirects to main app)
 * @returns main domain URL
 */
export function getMainDomainUrl(): string {
    if (typeof window === "undefined") return SITE_URL;

    const protocol = window.location.protocol;
    const hostname = window.location.hostname;

    // Handle localhost development
    if (hostname === "localhost" || hostname === "127.0.0.1") {
        return `${protocol}//${hostname}:${window.location.port}`;
    }

    // Handle production
    return SITE_URL;
}

/**
 * Get tenant URL for a specific tenant ID
 * @param tenantId - The tenant ID/subdomain
 * @returns tenant URL
 */
export function getTenantUrl(tenantId: string): string {
    if (typeof window === "undefined") {
        const siteUrl = new URL(SITE_URL);
        return `${siteUrl.protocol}//${tenantId}.${siteUrl.hostname}`;
    }

    const protocol = window.location.protocol;
    const hostname = window.location.hostname;

    // Handle localhost development
    if (hostname === "localhost" || hostname === "127.0.0.1") {
        return `${protocol}//${tenantId}.${hostname}:${window.location.port}`;
    }

    // Handle production
    const siteUrl = new URL(SITE_URL);
    return `${siteUrl.protocol}//${tenantId}.${siteUrl.hostname}`;
}

/**
 * Redirect to a specific tenant
 * @param tenantId - The tenant ID/subdomain to redirect to
 */
export function redirectToTenant(tenantId: string): void {
    const tenantUrl = getTenantUrl(tenantId);
    window.location.href = tenantUrl;
}

/**
 * Redirect to main domain
 */
export function redirectToMainDomain(): void {
    const mainUrl = getMainDomainUrl();
    window.location.href = mainUrl;
}

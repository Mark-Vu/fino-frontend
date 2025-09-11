"use server";

import { createClient } from "@/utils/supabase/server";
import serverApi from "@/lib/server-api";

// User interface matching the backend response
interface AuthUser {
    id: string;
    name: string;
    email: string;
    globalRole: string;
    tenantId?: string;
    tenantRole?: string;
    tenantApprovalStatus?: string;
    createdAt: string;
    updatedAt: string;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
    try {
        const supabase = await createClient();

        // Get the current user from Supabase auth
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return null;
        }

        // Get full user data from C# backend with automatic auth headers
        try {
            const response = await serverApi.get<AuthUser>(`/users/${user.id}`);
            return response.data;
        } catch (backendError) {
            console.error("Error fetching user from backend:", backendError);
            return null;
        }
    } catch (error) {
        console.error("Error fetching current user:", error);
        return null;
    }
}

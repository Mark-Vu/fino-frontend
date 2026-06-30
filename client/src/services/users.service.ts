import { createClient } from "@/utils/supabase/client";
import api from "@/lib/api";

const supabase = createClient();

// Enums matching backend
export enum GlobalRole {
    User = "user",
    Developer = "developer",
    SuperAdmin = "super_admin",
}

export interface User {
    id: string;
    name: string;
    email: string;
    globalRole: GlobalRole;
}

/**
 * Get the current authenticated user ID
 * @returns Promise with the current user ID string
 * @throws Error if user is not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
    try {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user?.id) {
            return null;
        }

        return user.id;
    } catch (error) {
        console.error("Failed to get current user ID:", error);
        return null;
    }
}

export async function logOut(): Promise<void> {
    await supabase.auth.signOut();
}

export async function getUserById(userId: string): Promise<User> {
    try {
        const response = await api.get<{
            id: string;
            name: string;
            email: string;
            globalRole: GlobalRole;
        }>(`/users/${userId}`);

        return response.data;
    } catch (error) {
        console.error("Failed to get user by ID:", error);
        throw new Error("Failed to get user information");
    }
}

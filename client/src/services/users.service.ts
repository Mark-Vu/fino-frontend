import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

/**
 * Get the current authenticated user ID
 * @returns Promise with the current user ID string
 * @throws Error if user is not authenticated
 */
export async function getCurrentUserId(): Promise<string> {
    try {
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error) {
            throw new Error(`Authentication error: ${error.message}`);
        }

        if (!user?.id) {
            throw new Error("User not authenticated");
        }

        return user.id;
    } catch (error) {
        console.error("Failed to get current user ID:", error);
        throw new Error("Failed to get current user ID");
    }
}

export async function logOut(): Promise<void> {
    await supabase.auth.signOut();
}

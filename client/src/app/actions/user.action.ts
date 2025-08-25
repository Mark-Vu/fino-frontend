"use server";

import { createClient } from "@/utils/supabase/server";

export async function getCurrentUser(): Promise<User | null> {
    try {
        const supabase = await createClient();

        // Get the current user directly from Supabase
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            return null;
        }

        // Transform Supabase user to our User interface
        return user;
    } catch (error) {
        console.error("Error fetching current user:", error);
        return null;
    }
}

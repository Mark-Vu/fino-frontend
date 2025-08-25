"use server";
import { z } from "zod";
import { createClient } from "@/utils/supabase/server";
import { SITE_URL } from "@/lib/constants";

const LoginSchema = z.object({
    email: z.string().email(),
});

export type LoginActionState = {
    errors?: {
        email?: string[];
    };
    success?: boolean;
};
export async function login(_prevState: LoginActionState, formData: FormData) {
    const supabase = await createClient();

    const data = {
        email: formData.get("email") as string,
    };

    const parsedData = LoginSchema.safeParse(data);
    if (!parsedData.success) {
        return {
            errors: {
                email: ["Invalid email address"],
            },
        };
    }

    const { error } = await supabase.auth.signInWithOtp({
        email: parsedData.data.email,
        options: {
            shouldCreateUser: true,
            emailRedirectTo: `${SITE_URL}/auth/confirm`,
        },
    });

    if (error) {
        return {
            errors: {
                email: [error.message],
            },
        };
    }

    return {
        success: true,
    };
}

export async function getAccessToken(): Promise<{
    access_token: string | null;
}> {
    try {
        const supabase = await createClient();

        const {
            data: { session },
            error,
        } = await supabase.auth.getSession();

        if (error || !session) {
            return { access_token: null };
        }

        return { access_token: session.access_token };
    } catch (err) {
        console.error("Error getting access token:", err);
        return { access_token: null };
    }
}

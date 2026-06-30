import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { URLS } from "@/lib/constants";

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    let next = searchParams.get("next") ?? URLS.home;

    if (!next.startsWith("/")) {
        next = URLS.home;
    }

    const supabase = await createClient();

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        });

        if (!error) {
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    return NextResponse.redirect(`${origin}${URLS.home}?auth_error=confirm`);
}

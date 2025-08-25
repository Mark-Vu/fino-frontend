"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { LogOut } from "lucide-react";

export function SignOutButton() {
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    return (
        <Button
            variant="ghost"
            className="flex items-center gap-3 justify-start"
            onClick={handleSignOut}
            asChild
        >
            <span>
                <LogOut className="w-4 h-4" />
                Logout
            </span>
        </Button>
    );
}

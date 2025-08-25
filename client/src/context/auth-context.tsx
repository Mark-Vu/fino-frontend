"use client";

import { User } from "@supabase/supabase-js";
import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useEffect,
} from "react";
import { getCurrentUser } from "@/app/actions/user.action";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

const Providers = ({
    children,
    authUser,
}: {
    children: ReactNode;
    authUser: User | null;
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Initial load - fetch user data using server action
    useEffect(() => {
        const initializeUser = async () => {
            if (authUser) {
                try {
                    const userData = await getCurrentUser();
                    setUser(userData);
                } catch (error) {
                    console.error(
                        "Error fetching user on initial load:",
                        error
                    );
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        };

        initializeUser();
    }, [authUser]);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default Providers;

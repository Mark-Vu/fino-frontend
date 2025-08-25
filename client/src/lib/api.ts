import axios from "axios";
import { BACKEND_URL } from "@/lib/constants";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

async function getAccessToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
}

const api = axios.create({
    baseURL: BACKEND_URL,
});

// Add token to every request dynamically
api.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Handle 401 & retry once
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401 && !error.config._retry) {
            error.config._retry = true;

            const token = await getAccessToken();
            if (token) {
                error.config.headers.Authorization = `Bearer ${token}`;
                return axios.request(error.config);
            }

            // If refresh fails, log out
            await supabase.auth.signOut();
        }
        return Promise.reject(error);
    }
);

export default api;

import axios from "axios";
import { createClient } from "@/utils/supabase/server";
import { BACKEND_URL } from "@/lib/constants";

export async function getAccessToken(): Promise<string | null> {
    const supabase = await createClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
}

const serverApi = axios.create({
    baseURL: `${BACKEND_URL}/api`,
});

// Add token to every request dynamically
serverApi.interceptors.request.use(async (config) => {
    const token = await getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default serverApi;

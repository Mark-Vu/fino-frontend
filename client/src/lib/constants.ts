export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export const DEFAULT_AVATAR = "https://api.dicebear.com/9.x/initials/svg?seed=";
export const CONTACT = {
    formLink: "https://forms.gle/qDuPChJzoUBe7Svh9",
    email: "hello@cenly.com",
    NAPhone: "+1 (236)-593-5908",
    VietPhone: "+84 989184300",
};

export const URLS = {
    home: "/",
};

export const SIDE_BAR_SECTIONS = {
    DASHBOARD: "Dashboard",
    PDF_TO_CSV: "Bank Statement Converter",
} as const;

export type SidebarActiveSection =
    (typeof SIDE_BAR_SECTIONS)[keyof typeof SIDE_BAR_SECTIONS];

export const POST_PRIVACY_OPTIONS = {
    PUBLIC: "PUBLIC",
    FOLLOWERS: "FOLLOWERS",
    PRIVATE: "PRIVATE",
} as const;

export type PostPrivacy =
    (typeof POST_PRIVACY_OPTIONS)[keyof typeof POST_PRIVACY_OPTIONS];

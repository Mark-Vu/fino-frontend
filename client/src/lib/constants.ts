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
    dashboard: "#dashboard",
    bankStatementConverter: "#bankstatement-converter",
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

export const BANK_STATEMENT_FILE_STATUS = {
    PENDING: 0,
    PROCESSING: 1,
    COMPLETED: 2,
    FAILED: 3,
} as const;

export enum JobStatus {
    Pending = 0,
    Processing = 1,
    Success = 2,
    Failed = 3,
}

export type BankStatementFileStatus =
    (typeof BANK_STATEMENT_FILE_STATUS)[keyof typeof BANK_STATEMENT_FILE_STATUS];

export const UPLOAD_STATUS = {
    IDLE: "idle",
    UPLOADING: "uploading",
    ERROR: "error",
} as const;

export type UploadStatus = (typeof UPLOAD_STATUS)[keyof typeof UPLOAD_STATUS];

export const getJobStatusText = (status: JobStatus) => {
    switch (status) {
        case 0:
            return "Received";
        case 1:
            return "Processing";
        case 2:
            return "Completed";
        case 3:
            return "Failed";
        default:
            return "Unknown";
    }
};

export const getJobStatusBadgeClasses = (status: JobStatus) => {
    switch (status) {
        case 0:
            return "bg-yellow-300 text-foreground";
        case 1:
            return "bg-blue-600 text-white";
        case 2:
            return "bg-green-600 text-white";
        case 3:
            return "bg-red-600 text-white";
        default:
            return "bg-muted text-foreground";
    }
};

export const getMultipleJobStatusText = (status: JobStatus) => {
    switch (status) {
        case 0:
            return "Received";
        case 1:
            return "Processing";
        case 2:
            return "Completed";
        case 3:
            return "Failed";
        default:
            return "Unknown";
    }
};

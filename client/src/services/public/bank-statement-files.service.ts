import api from "@/lib/api";
import { JobStatus } from "@/lib/constants";

export interface UploadBankStatementResponse {
    fileId: string;
    fileKey: string;
    uploadUrl: string;
}

export interface ConversionJob {
    id: string;
    status: JobStatus;
    errorMessage?: string;
    bankStatementFileId: string;
    startedAt: string;
    finishedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UploadBankStatementConfirmResponse {
    fileId: string;
    job: ConversionJob;
}

export interface DownloadBankStatementCsvResponse {
    downloadUrl: string;
}

export class PublicBankStatementFilesService {
    /**
     * Get presigned URL for uploading a bank statement file (public, no auth)
     * @returns Promise with upload details including presigned URL
     */
    static async getUploadUrl(): Promise<UploadBankStatementResponse> {
        try {
            const response = await api.post<UploadBankStatementResponse>(
                "/public/bank-statement-files/upload"
            );

            return response.data;
        } catch (error) {
            console.error("Failed to get upload URL:", error);
            throw new Error("Failed to get upload URL for file upload");
        }
    }

    /**
     * Upload a bank statement file using the presigned URL
     * @param file - The file to upload
     * @param uploadUrl - The presigned URL from getUploadUrl
     * @param contentType - The content type of the file (defaults to application/pdf)
     * @returns Promise that resolves when upload is complete
     */
    static async uploadFile(
        file: File,
        uploadUrl: string,
        contentType: string = "application/pdf"
    ): Promise<void> {
        try {
            // Upload directly to S3 using the presigned URL
            const response = await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": contentType,
                },
                mode: "cors",
                credentials: "omit",
            });

            if (!response.ok) {
                throw new Error(
                    `Upload failed with status: ${response.status}`
                );
            }
        } catch (error) {
            console.error("Failed to upload file:", error);
            throw new Error("Failed to upload file to storage");
        }
    }

    /**
     * Confirm the upload and create conversion job (public, no auth)
     * @param fileId - The file ID from the upload response
     * @returns Promise with confirmation response including job details
     */
    static async confirmUpload(
        fileId: string,
        fileName: string
    ): Promise<UploadBankStatementConfirmResponse> {
        try {
            const response = await api.post<UploadBankStatementConfirmResponse>(
                `/public/bank-statement-files/${fileId}/confirm`,
                { fileId, fileName }
            );

            return response.data;
        } catch (error) {
            console.error("Failed to confirm upload:", error);
            throw new Error("Failed to confirm upload");
        }
    }

    /**
     * Get job status
     * @param jobId - The job ID to check
     * @returns Promise with the current job status
     */
    static async getJobStatus(jobId: string): Promise<ConversionJob> {
        try {
            const response = await api.get<ConversionJob>(
                `/conversion-jobs/${jobId}`
            );
            return response.data;
        } catch (error) {
            console.error("Failed to get job status:", error);
            throw new Error("Failed to get job status");
        }
    }

    /**
     * Complete the bank statement upload process (public version)
     * This method combines getting the upload URL and uploading the file
     * @param file - The file to upload
     * @returns Promise with the upload response details
     */
    static async uploadBankStatement(
        file: File
    ): Promise<UploadBankStatementResponse> {
        try {
            // Step 1: Get the presigned URL
            const uploadDetails = await this.getUploadUrl();

            // Step 2: Upload the file using the presigned URL
            await this.uploadFile(file, uploadDetails.uploadUrl, file.type);

            // Step 3: Return the upload details
            return uploadDetails;
        } catch (error) {
            console.error("Failed to upload bank statement:", error);
            throw new Error("Failed to upload bank statement");
        }
    }

    /**
     * Download the converted CSV file (public, no auth)
     * @param fileId - The file ID to download
     * @returns Promise with the download URL
     */
    static async downloadBankStatementCsv(
        fileId: string
    ): Promise<DownloadBankStatementCsvResponse> {
        try {
            const response = await api.get<DownloadBankStatementCsvResponse>(
                `/public/bank-statement-files/${fileId}/download`
            );
            return response.data;
        } catch (error) {
            console.error("Failed to get download URL:", error);
            throw new Error("Failed to get download URL");
        }
    }

    /**
     * Validate file before upload
     * @param file - The file to validate
     * @returns Object with validation result and any error messages
     */
    static validateFile(file: File): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Check file type
        if (file.type !== "application/pdf") {
            errors.push("Only PDF files are supported");
        }

        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            errors.push("File size must be less than 10MB");
        }

        // Check if file has a name
        if (!file.name || file.name.trim() === "") {
            errors.push("File must have a name");
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}

export default PublicBankStatementFilesService;

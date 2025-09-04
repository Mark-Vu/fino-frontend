import api from "@/lib/api";

export interface FileUploadDto {
    fileId: string;
    fileKey: string;
    uploadUrl: string;
}

export interface UploadMultipleBankStatementResponse {
    files: FileUploadDto[];
}

export interface UploadMultipleBankStatementsConfirmRequest {
    userId: string;
    fileIds: string[];
}

export interface ConversionJob {
    id: string;
    bankStatementFileId: string;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
}

export interface UploadMultipleBankStatementsConfirmResponse {
    jobs: ConversionJob[];
}

export enum JobStatus {
    Pending = 0,
    Processing = 1,
    Success = 2,
    Failed = 3,
}

export interface JobStatusResponse {
    id: string;
    bankStatementFileId: string;
    status: JobStatus;
    progress?: number;
    downloadUrl?: string;
    error?: string;
}

export class MultipleBankStatementFilesService {
    /**
     * Get upload URLs for multiple files
     * @param count - Number of files to upload (1-10)
     * @returns Promise with upload URLs for each file
     */
    static async getUploadUrls(
        userId: string,
        count: number
    ): Promise<UploadMultipleBankStatementResponse> {
        try {
            const response =
                await api.post<UploadMultipleBankStatementResponse>(
                    "private/bank-statement-files/upload-multiple",
                    { userId, count }
                );
            return response.data;
        } catch (error) {
            console.error("Failed to get upload URLs:", error);
            throw new Error("Failed to get upload URLs");
        }
    }

    /**
     * Upload a single file to S3 using presigned URL
     * @param file - The file to upload
     * @param uploadUrl - The presigned upload URL
     * @returns Promise with the upload result
     */
    static async uploadFileToS3(file: File, uploadUrl: string): Promise<void> {
        try {
            const response = await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
                },
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Failed to upload file to S3:", error);
            throw new Error("Failed to upload file to S3");
        }
    }

    /**
     * Confirm multiple file uploads and start conversion jobs
     * @param fileIds - Array of file IDs to confirm
     * @returns Promise with created conversion jobs
     */
    static async confirmMultipleUploads(
        fileIds: string[],
        userId: string,
        fileNames: string[]
    ): Promise<UploadMultipleBankStatementsConfirmResponse> {
        try {
            const response =
                await api.post<UploadMultipleBankStatementsConfirmResponse>(
                    "private/bank-statement-files/confirm-multiple",
                    { userId, fileIds, fileNames }
                );
            return response.data;
        } catch (error) {
            console.error("Failed to confirm uploads:", error);
            throw new Error("Failed to confirm uploads");
        }
    }

    /**
     * Get status of a specific job
     * @param jobId - The job ID to check
     * @returns Promise with job status
     */
    static async getJobStatus(jobId: string): Promise<JobStatusResponse> {
        try {
            const response = await api.get<JobStatusResponse>(
                `conversion-jobs/${jobId}`
            );
            return response.data;
        } catch (error) {
            console.error("Failed to get job status:", error);
            throw new Error("Failed to get job status");
        }
    }

    /**
     * Download the converted CSV file
     * @param fileId - The file ID to download
     * @returns Promise with the download URL
     */
    static async downloadBankStatementCsv(
        fileId: string,
        userId: string
    ): Promise<{ downloadUrl: string }> {
        try {
            const response = await api.get<{ downloadUrl: string }>(
                `private/bank-statement-files/${userId}/${fileId}/download`
            );
            return response.data;
        } catch (error) {
            console.error("Failed to get download URL:", error);
            throw new Error("Failed to get download URL");
        }
    }

    /**
     * Validate a file before upload
     * @param file - The file to validate
     * @returns Validation result
     */
    static validateFile(file: File): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (file.type !== "application/pdf") {
            errors.push("Only PDF files are allowed");
        }

        if (file.size > maxSize) {
            errors.push("File size must be less than 10MB");
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }
}

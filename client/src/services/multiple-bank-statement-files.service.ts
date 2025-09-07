import api from "@/lib/api";
import { JobStatus, FileType, getFileTypeFromMimeType } from "@/lib/constants";

export interface FileUploadDto {
    fileId: string;
    fileKey: string;
    uploadUrl: string;
}

export interface UploadFileSpec {
    fileType: FileType;
}

export interface UploadMultipleBankStatementRequest {
    userId: string;
    files: UploadFileSpec[];
}

export interface UploadMultipleBankStatementResponse {
    files: FileUploadDto[];
}

export interface FileConfirmSpec {
    fileId: string;
    fileName: string;
    fileKey: string;
    fileExtension: string;
}

export interface UploadMultipleBankStatementsConfirmRequest {
    userId: string;
    files: FileConfirmSpec[];
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

export interface JobStatusResponse {
    id: string;
    bankStatementFileId: string;
    status: JobStatus;
    progress?: number;
    downloadUrl?: string;
    error?: string;
}

export interface JobStatusDto {
    jobId: string;
    status: JobStatus;
    errorMessage?: string;
    finishedAt?: string;
}

export interface GetMultipleJobStatusesRequest {
    jobIds: string[];
}

export interface GetMultipleJobStatusesResponse {
    jobs: JobStatusDto[];
}

export class MultipleBankStatementFilesService {
    /**
     * Get upload URLs for multiple files
     * @param userId - User ID
     * @param files - Array of files with their types
     * @returns Promise with upload URLs for each file
     */
    static async getUploadUrls(
        userId: string,
        files: File[]
    ): Promise<UploadMultipleBankStatementResponse> {
        try {
            const fileSpecs: UploadFileSpec[] = files.map((file) => ({
                fileType: getFileTypeFromMimeType(file.type),
            }));

            const request: UploadMultipleBankStatementRequest = {
                userId,
                files: fileSpecs,
            };

            const response =
                await api.post<UploadMultipleBankStatementResponse>(
                    "private/bank-statement-files/upload-multiple",
                    request
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
     * @param files - Array of file specifications to confirm
     * @param userId - User ID
     * @returns Promise with created conversion jobs
     */
    static async confirmMultipleUploads(
        files: FileConfirmSpec[],
        userId: string
    ): Promise<UploadMultipleBankStatementsConfirmResponse> {
        try {
            const request: UploadMultipleBankStatementsConfirmRequest = {
                userId,
                files,
            };

            const response =
                await api.post<UploadMultipleBankStatementsConfirmResponse>(
                    "private/bank-statement-files/confirm-multiple",
                    request
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
     * Get status of multiple jobs in a single request
     * @param jobIds - Array of job IDs to check
     * @returns Promise with job statuses
     */
    static async getMultipleJobStatuses(
        jobIds: string[]
    ): Promise<GetMultipleJobStatusesResponse> {
        try {
            const request: GetMultipleJobStatusesRequest = {
                jobIds,
            };

            const response = await api.post<GetMultipleJobStatusesResponse>(
                "conversion-jobs/statuses",
                request
            );
            return response.data;
        } catch (error) {
            console.error("Failed to get multiple job statuses:", error);
            throw new Error("Failed to get multiple job statuses");
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

        const supportedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/tiff",
        ];

        if (!supportedTypes.includes(file.type)) {
            errors.push("Only PDF, JPEG, PNG, and TIFF files are allowed");
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

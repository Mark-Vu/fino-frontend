import api from "@/lib/api";
import { JobStatus, FileType, getFileTypeFromMimeType } from "@/lib/constants";
import { JobService } from "./job.service";

export interface FileUploadDto {
    fileId: string;
    fileKey: string;
    uploadUrl: string;
}

export interface UploadFileSpec {
    fileType: FileType;
}

export interface UploadMultipleDeliveryReceiptsRequest {
    userId: string;
    files: UploadFileSpec[];
}

export interface UploadMultipleDeliveryReceiptsResponse {
    files: FileUploadDto[];
}

export interface FileConfirmSpec {
    fileId: string;
    fileName: string;
    fileKey: string;
    fileExtension: string;
}

export interface UploadMultipleDeliveryReceiptsConfirmRequest {
    userId: string;
    files: FileConfirmSpec[];
}

export interface ConversionJob {
    id: string;
    uploadedFileId: string;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
}

export interface UploadMultipleDeliveryReceiptsConfirmResponse {
    jobs: ConversionJob[];
}

export class DeliveryReceiptFilesService {
    /**
     * Get upload URLs for multiple delivery receipt files
     * @param userId - User ID
     * @param files - Array of files with their types
     * @returns Promise with upload URLs for each file
     */
    static async getUploadUrls(
        userId: string,
        files: File[]
    ): Promise<UploadMultipleDeliveryReceiptsResponse> {
        try {
            const fileSpecs: UploadFileSpec[] = files.map((file) => ({
                fileType: getFileTypeFromMimeType(file.type),
            }));

            const request: UploadMultipleDeliveryReceiptsRequest = {
                userId,
                files: fileSpecs,
            };

            const response =
                await api.post<UploadMultipleDeliveryReceiptsResponse>(
                    "private/delivery-receipts/upload-multiple",
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
     * Confirm multiple delivery receipt file uploads and start conversion jobs
     * @param files - Array of file specifications to confirm
     * @param userId - User ID
     * @returns Promise with created conversion jobs
     */
    static async confirmMultipleUploads(
        files: FileConfirmSpec[],
        userId: string
    ): Promise<UploadMultipleDeliveryReceiptsConfirmResponse> {
        try {
            const request: UploadMultipleDeliveryReceiptsConfirmRequest = {
                userId,
                files,
            };

            const response =
                await api.post<UploadMultipleDeliveryReceiptsConfirmResponse>(
                    "private/delivery-receipts/confirm-multiple",
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
    static async getJobStatus(jobId: string) {
        return JobService.getJobStatus(jobId);
    }

    /**
     * Get status of multiple jobs in a single request
     * @param jobIds - Array of job IDs to check
     * @returns Promise with job statuses
     */
    static async getMultipleJobStatuses(jobIds: string[]) {
        return JobService.getMultipleJobStatuses(jobIds);
    }

    /**
     * Download the converted CSV file for delivery receipts
     * @param fileId - The file ID to download
     * @param userId - User ID
     * @returns Promise with the download URL
     */
    static async downloadDeliveryReceiptCsv(
        fileId: string,
        userId: string
    ): Promise<{ downloadUrl: string }> {
        try {
            const response = await api.get<{ downloadUrl: string }>(
                `private/delivery-receipts/${userId}/${fileId}/download`
            );
            return response.data;
        } catch (error) {
            console.error("Failed to get download URL:", error);
            throw new Error("Failed to get download URL");
        }
    }

    /**
     * Validate a file before upload (images only for delivery receipts)
     * @param file - The file to validate
     * @returns Validation result
     */
    static validateFile(file: File): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        const maxSize = 10 * 1024 * 1024; // 10MB

        const supportedTypes = ["image/jpeg", "image/png", "image/tiff"];

        if (!supportedTypes.includes(file.type)) {
            errors.push("Only JPEG, PNG, and TIFF images are allowed");
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

import api from "@/lib/api";
import { JobStatus } from "@/lib/constants";

export interface JobStatusResponse {
    id: string;
    bankStatementFileId?: string;
    uploadedFileId?: string;
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

export class JobService {
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
}

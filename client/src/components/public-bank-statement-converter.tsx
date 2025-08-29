"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, AlertCircle, Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoginModal from "@/components/auth/login-modal";
import {
    PublicBankStatementFilesService,
    JobStatus,
} from "@/services/public/bank-statement-files.service";

interface UploadState {
    file: File | null;
    error?: string;
    uploadResult?: {
        fileId: string;
        fileKey: string;
        uploadUrl: string;
    };
    jobId?: string;
    jobStatus?: JobStatus;
    isPolling?: boolean;
    fileId?: string; // Store the fileId for download
    isUploading?: boolean; // Track upload state
}

export function PublicBankStatementConverter() {
    const [uploadState, setUploadState] = useState<UploadState>({
        file: null,
    });

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];

        // Validate file
        const validation = PublicBankStatementFilesService.validateFile(file);
        if (!validation.isValid) {
            setUploadState({
                file: null,
                error: validation.errors.join(", "),
            });
            return;
        }

        // Just set the file, don't upload yet
        setUploadState({
            file,
        });
    }, []);

    const handleConvert = async () => {
        if (!uploadState.file) return;

        setUploadState((prev) => ({
            ...prev,
            isUploading: true,
        }));

        try {
            // Step 1: Upload to S3
            const result =
                await PublicBankStatementFilesService.uploadBankStatement(
                    uploadState.file
                );

            // Step 2: Confirm upload with backend
            const confirmResult =
                await PublicBankStatementFilesService.confirmUpload(
                    result.fileId
                );

            setUploadState({
                file: uploadState.file,
                uploadResult: result,
                jobId: confirmResult.job.id,
                jobStatus: confirmResult.job.status,
                isPolling: true,
                fileId: result.fileId,
                isUploading: false, // Upload complete
            });
        } catch (error) {
            setUploadState({
                file: uploadState.file,
                error: error instanceof Error ? error.message : "Upload failed",
                isUploading: false, // Upload failed
            });
        }
    };

    // Poll job status
    useEffect(() => {
        if (!uploadState.jobId || !uploadState.isPolling) return;

        const startTime = Date.now();
        const timeoutDuration = 60000; // 1 minute timeout

        const pollInterval = setInterval(async () => {
            try {
                // Check if we've exceeded the timeout
                if (Date.now() - startTime > timeoutDuration) {
                    clearInterval(pollInterval);
                    setUploadState((prev) => ({
                        ...prev,
                        isPolling: false,
                        error: "Polling timeout: Job status check exceeded 1 minute",
                    }));
                    return;
                }

                const job = await PublicBankStatementFilesService.getJobStatus(
                    uploadState.jobId!
                );

                setUploadState((prev) => ({
                    ...prev,
                    jobStatus: job.status,
                    isPolling:
                        job.status === JobStatus.Pending ||
                        job.status === JobStatus.Processing,
                }));

                // Stop polling if job is complete
                if (
                    job.status === JobStatus.Success ||
                    job.status === JobStatus.Failed
                ) {
                    clearInterval(pollInterval);
                }
            } catch (error) {
                console.error("Failed to poll job status:", error);
                // Stop polling on error
                clearInterval(pollInterval);
                setUploadState((prev) => ({
                    ...prev,
                    isPolling: false,
                    error: "Failed to check job status",
                }));
            }
        }, 1000); // Poll every second

        return () => clearInterval(pollInterval);
    }, [uploadState.jobId, uploadState.isPolling]);

    const handleDownload = async () => {
        if (!uploadState.fileId) return;

        try {
            const response =
                await PublicBankStatementFilesService.downloadBankStatementCsv(
                    uploadState.fileId
                );

            // Create a temporary link and trigger download
            const link = document.createElement("a");
            link.href = response.downloadUrl;
            link.download = `bank-statement-${uploadState.fileId}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to download file:", error);
            // You could show an error toast here
        }
    };

    const getJobStatusText = (status: JobStatus) => {
        switch (status) {
            case JobStatus.Pending:
                return "Received";
            case JobStatus.Processing:
                return "Processing";
            case JobStatus.Success:
                return "Completed";
            case JobStatus.Failed:
                return "Failed";
            default:
                return "Unknown";
        }
    };

    const getJobStatusBadgeClasses = (status: JobStatus) => {
        switch (status) {
            case JobStatus.Pending:
                return "bg-primary/40";
            case JobStatus.Processing:
                return "bg-primary";
            case JobStatus.Success:
                return "bg-primary";
            case JobStatus.Failed:
                return "bg-red-600 text-white";
            default:
                return "bg-muted text-foreground";
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
        },
        maxFiles: 1,
        disabled:
            uploadState.isUploading ||
            uploadState.jobStatus === JobStatus.Pending ||
            uploadState.jobStatus === JobStatus.Processing,
    });

    const resetUpload = () => {
        setUploadState({
            file: null,
        });
    };

    const getStatusText = () => {
        return "Drop your PDF here or click to browse";
    };

    return (
        <div className="px-4 lg:px-6 max-w-screen-2xl mx-auto">
            <div className="flex flex-col gap-6">
                <div className="text-center">
                    <h1 className="text-xl font-bold mb-2 flex items-center justify-center gap-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-white text-sm font-bold rounded-full">
                            1
                        </span>
                        Bank Statement Converter
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Convert your bank statements from PDF to CSV format for
                        easy analysis.
                    </p>
                </div>

                <Card className="max-w-2xl mx-auto w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Upload Bank Statement
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* File Upload Area */}
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-8 text-center border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 ${
                                uploadState.isUploading ||
                                uploadState.jobStatus === JobStatus.Pending ||
                                uploadState.jobStatus === JobStatus.Processing
                                    ? "cursor-not-allowed opacity-50"
                                    : "cursor-pointer"
                            }`}
                        >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center gap-4">
                                <div>
                                    <p className="text-lg font-medium mb-2">
                                        {getStatusText()}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Only PDF files are supported (max 10MB)
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-2">
                            <LoginModal
                                trigger={
                                    <span className="block text-right text-primary underline text-sm cursor-pointer hover:text-primary/80">
                                        Try our most accurate converter — get 10
                                        free uses here
                                    </span>
                                }
                                hidden={false}
                            />
                        </div>

                        {/* File Info */}
                        {uploadState.file && (
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="w-5 h-5 text-gray-500" />
                                        <div>
                                            <p className="font-medium">
                                                {uploadState.file.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {(
                                                    uploadState.file.size /
                                                    1024 /
                                                    1024
                                                ).toFixed(2)}{" "}
                                                MB
                                            </p>
                                        </div>
                                    </div>
                                    {uploadState.isUploading ? (
                                        <Badge className="bg-muted text-muted-foreground">
                                            Uploading
                                        </Badge>
                                    ) : uploadState.jobStatus !== undefined ? (
                                        uploadState.jobStatus ===
                                        JobStatus.Success ? (
                                            <Button
                                                onClick={handleDownload}
                                                size="sm"
                                            >
                                                <Download className="w-4 h-4 mr-2" />
                                                Download
                                            </Button>
                                        ) : (
                                            <Badge
                                                className={getJobStatusBadgeClasses(
                                                    uploadState.jobStatus
                                                )}
                                            >
                                                {getJobStatusText(
                                                    uploadState.jobStatus
                                                )}
                                                {uploadState.jobStatus ===
                                                    JobStatus.Processing && (
                                                    <Loader2 className="ml-2 w-4 h-4 animate-spin" />
                                                )}
                                            </Badge>
                                        )
                                    ) : null}
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {uploadState.error && (
                            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                    <p className="text-red-700 dark:text-red-300">
                                        {uploadState.error}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button
                                onClick={handleConvert}
                                disabled={
                                    uploadState.isUploading ||
                                    uploadState.jobStatus != undefined
                                }
                                className="bg-primary hover:bg-primary/90"
                            >
                                Convert
                            </Button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-center">
                            {uploadState.jobStatus === JobStatus.Success ||
                            uploadState.jobStatus === JobStatus.Failed ? (
                                <Button onClick={resetUpload} variant="outline">
                                    Upload Another File
                                </Button>
                            ) : uploadState.error ? (
                                <Button onClick={resetUpload} variant="outline">
                                    Try Again
                                </Button>
                            ) : null}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

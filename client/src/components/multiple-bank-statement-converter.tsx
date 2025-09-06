"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, AlertCircle, Loader2, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MultipleBankStatementFilesService } from "@/services/multiple-bank-statement-files.service";
import { JobStatus, UPLOAD_STATUS, type UploadStatus } from "@/lib/constants";
import { useAuth } from "@/context/auth-context";
import { getJobStatusBadgeClasses, getJobStatusText } from "@/lib/constants";

interface FileUploadState {
    file: File;
    fileId?: string;
    jobId?: string;
    jobStatus?: JobStatus;
    status: UploadStatus;
    error?: string;
    downloadUrl?: string;
}

interface UploadState {
    files: FileUploadState[];
    isProcessing: boolean;
    error?: string;
}

export function MultipleBankStatementConverter() {
    const { user } = useAuth();
    const [uploadState, setUploadState] = useState<UploadState>({
        files: [],
        isProcessing: false,
    });

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 0) return;

            // Check if all current files are complete (success or failed)
            const allFilesComplete =
                uploadState.files.length > 0 &&
                uploadState.files.every(
                    (file) =>
                        file.jobStatus === JobStatus.Success ||
                        file.jobStatus === JobStatus.Failed
                );

            // If all files are complete, clear them and start fresh
            if (allFilesComplete) {
                setUploadState({
                    files: [],
                    isProcessing: false,
                    error: undefined,
                });
            }

            // Check if adding these files would exceed the 10 file limit
            const currentFileCount = allFilesComplete
                ? 0
                : uploadState.files.length;
            const newFileCount = currentFileCount + acceptedFiles.length;

            if (newFileCount > 10) {
                setUploadState((prev) => ({
                    ...prev,
                    error: `Cannot add ${acceptedFiles.length} files. Maximum 10 files allowed. You currently have ${currentFileCount} files.`,
                }));
                return;
            }

            // Validate all files
            const validFiles: FileUploadState[] = [];
            const errors: string[] = [];

            acceptedFiles.forEach((file) => {
                const validation =
                    MultipleBankStatementFilesService.validateFile(file);
                if (validation.isValid) {
                    validFiles.push({
                        file,
                        status: UPLOAD_STATUS.IDLE,
                    });
                } else {
                    errors.push(
                        `${file.name}: ${validation.errors.join(", ")}`
                    );
                }
            });

            if (errors.length > 0) {
                setUploadState((prev) => ({
                    ...prev,
                    error: errors.join("; "),
                }));
            }

            if (validFiles.length > 0) {
                setUploadState((prev) => ({
                    ...prev,
                    files: allFilesComplete
                        ? validFiles
                        : [...prev.files, ...validFiles],
                    error: undefined,
                }));
            }
        },
        [uploadState.files]
    );

    const removeFile = (index: number) => {
        setUploadState((prev) => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index),
        }));
    };

    const handleConvert = async () => {
        if (uploadState.files.length === 0) return;

        setUploadState((prev) => ({
            ...prev,
            isProcessing: true,
            error: undefined,
        }));

        try {
            // Step 1: Get upload URLs for all files
            const uploadResponse =
                await MultipleBankStatementFilesService.getUploadUrls(
                    user!.id,
                    uploadState.files.length
                );

            // Step 2: Upload each file to S3
            const fileIds: string[] = [];
            const updatedFiles = uploadState.files.map((fileState, index) => {
                const uploadInfo = uploadResponse.files[index];
                fileIds.push(uploadInfo.fileId);
                return {
                    ...fileState,
                    fileId: uploadInfo.fileId,
                    status: UPLOAD_STATUS.UPLOADING,
                };
            });

            setUploadState((prev) => ({
                ...prev,
                files: updatedFiles,
            }));

            // Upload files to S3 in parallel
            await Promise.all(
                updatedFiles.map(async (fileState, index) => {
                    const uploadInfo = uploadResponse.files[index];
                    await MultipleBankStatementFilesService.uploadFileToS3(
                        fileState.file,
                        uploadInfo.uploadUrl
                    );
                })
            );

            // Step 3: Confirm uploads and start conversion jobs
            const confirmResponse =
                await MultipleBankStatementFilesService.confirmMultipleUploads(
                    fileIds,
                    user!.id,
                    updatedFiles.map((file) => file.file.name)
                );

            // Update files with job IDs
            const filesWithJobs = updatedFiles.map((fileState, index) => ({
                ...fileState,
                jobId: confirmResponse.jobs[index].id,
                jobStatus: JobStatus.Pending,
            }));

            setUploadState((prev) => ({
                ...prev,
                files: filesWithJobs,
                isProcessing: false,
            }));
        } catch (error) {
            setUploadState((prev) => ({
                ...prev,
                isProcessing: false,
                error: error instanceof Error ? error.message : "Upload failed",
            }));
        }
    };

    // Poll job status for all files
    useEffect(() => {
        const jobIds = uploadState.files
            .filter(
                (file) =>
                    file.jobId &&
                    file.jobStatus !== JobStatus.Success &&
                    file.jobStatus !== JobStatus.Failed
            )
            .map((file) => file.jobId!);

        if (jobIds.length === 0) return;

        const startTime = Date.now();
        const timeoutDuration = 60000; // 1 minute timeout

        const pollInterval = setInterval(async () => {
            try {
                // Check if we've exceeded the timeout
                if (Date.now() - startTime > timeoutDuration) {
                    clearInterval(pollInterval);
                    setUploadState((prev) => ({
                        ...prev,
                        files: prev.files.map((file) =>
                            file.jobId &&
                            file.jobStatus !== JobStatus.Success &&
                            file.jobStatus !== JobStatus.Failed
                                ? {
                                      ...file,
                                      error: "Polling timeout: Job status check exceeded 1 minute",
                                  }
                                : file
                        ),
                    }));
                    return;
                }

                // Check status for all active jobs
                const statusPromises = jobIds.map((jobId) =>
                    MultipleBankStatementFilesService.getJobStatus(jobId)
                );
                const statuses = await Promise.all(statusPromises);

                setUploadState((prev) => ({
                    ...prev,
                    files: prev.files.map((file) => {
                        if (!file.jobId) return file;
                        const status = statuses.find(
                            (s) => s.id === file.jobId
                        );
                        if (!status) return file;

                        return {
                            ...file,
                            jobStatus: status.status,
                            downloadUrl: status.downloadUrl,
                            error: status.error,
                        };
                    }),
                }));

                // Stop polling if all jobs are complete
                const allComplete = statuses.every(
                    (status) =>
                        status.status === JobStatus.Success ||
                        status.status === JobStatus.Failed
                );
                if (allComplete) {
                    clearInterval(pollInterval);
                }
            } catch (error) {
                console.error("Failed to poll job status:", error);
                clearInterval(pollInterval);
            }
        }, 1000); // Poll every second

        return () => clearInterval(pollInterval);
    }, [uploadState.files]);

    const handleDownload = async (fileId: string) => {
        try {
            const response =
                await MultipleBankStatementFilesService.downloadBankStatementCsv(
                    fileId,
                    user!.id
                );

            // Create a temporary link and trigger download
            const link = document.createElement("a");
            link.href = response.downloadUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to download file:", error);
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
        },
        maxFiles: 10,
        disabled: uploadState.isProcessing || uploadState.files.length >= 10,
    });

    const resetUpload = () => {
        setUploadState({
            files: [],
            isProcessing: false,
        });
    };

    const getStatusText = () => {
        if (uploadState.files.length >= 10) {
            return "Maximum 10 files reached";
        }
        return "Drop your PDFs here or click to browse";
    };

    const allFilesComplete =
        uploadState.files.length > 0 &&
        uploadState.files.every(
            (file) =>
                file.jobStatus === JobStatus.Success ||
                file.jobStatus === JobStatus.Failed
        );

    return (
        <div className="px-4 lg:px-6 max-w-screen-2xl mx-auto">
            <div className="flex flex-col gap-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-2">
                        Bank Statement Converter
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Upload up to 10 bank statement PDFs and convert them to
                        CSV format for easy analysis.
                    </p>
                </div>

                <Card className="max-w-4xl mx-auto w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Upload Bank Statements
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* File Upload Area */}
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-8 text-center border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 ${
                                uploadState.isProcessing ||
                                uploadState.files.length >= 10
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
                                        Up to 10 PDF files supported (max 10MB
                                        each)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* File List */}
                        {uploadState.files.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-medium">
                                    Selected Files ({uploadState.files.length}
                                    /10)
                                </h3>
                                {uploadState.files.map((fileState, index) => (
                                    <div
                                        key={index}
                                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-gray-500" />
                                                <div>
                                                    <p className="font-medium">
                                                        {fileState.file.name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {(
                                                            fileState.file
                                                                .size /
                                                            1024 /
                                                            1024
                                                        ).toFixed(2)}{" "}
                                                        MB
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {fileState.jobStatus ===
                                                JobStatus.Success ? (
                                                    <Button
                                                        onClick={() =>
                                                            handleDownload(
                                                                fileState.fileId!
                                                            )
                                                        }
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download
                                                    </Button>
                                                ) : fileState.jobStatus ===
                                                  JobStatus.Failed ? (
                                                    <Badge className="bg-red-600 text-white">
                                                        {getJobStatusText(
                                                            fileState.jobStatus
                                                        )}
                                                    </Badge>
                                                ) : fileState.jobStatus ===
                                                  JobStatus.Processing ? (
                                                    <Badge
                                                        className={getJobStatusBadgeClasses(
                                                            fileState.jobStatus
                                                        )}
                                                    >
                                                        {getJobStatusText(
                                                            fileState.jobStatus
                                                        )}
                                                        <Loader2 className="ml-2 w-4 h-4 animate-spin" />
                                                    </Badge>
                                                ) : fileState.jobStatus ===
                                                  JobStatus.Pending ? (
                                                    <Badge
                                                        className={getJobStatusBadgeClasses(
                                                            fileState.jobStatus
                                                        )}
                                                    >
                                                        {getJobStatusText(
                                                            fileState.jobStatus
                                                        )}
                                                    </Badge>
                                                ) : fileState.status ===
                                                  UPLOAD_STATUS.UPLOADING ? (
                                                    <Badge className="bg-muted text-foreground">
                                                        Uploading
                                                    </Badge>
                                                ) : fileState.status ===
                                                  UPLOAD_STATUS.IDLE ? (
                                                    <div className="flex items-center gap-2">
                                                        <Badge className="bg-muted text-foreground">
                                                            Ready
                                                        </Badge>
                                                        <Button
                                                            onClick={() =>
                                                                removeFile(
                                                                    index
                                                                )
                                                            }
                                                            size="sm"
                                                            variant="ghost"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        onClick={() =>
                                                            removeFile(index)
                                                        }
                                                        size="sm"
                                                        variant="ghost"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        {fileState.error && (
                                            <div className="mt-2 text-sm text-red-600">
                                                {fileState.error}
                                            </div>
                                        )}
                                    </div>
                                ))}
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

                        {/* Convert Button */}
                        {uploadState.files.length > 0 &&
                            !uploadState.isProcessing &&
                            uploadState.files.every(
                                (f) => f.status === UPLOAD_STATUS.IDLE
                            ) && (
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleConvert}
                                        className="bg-primary hover:bg-primary/90"
                                    >
                                        Convert All Files
                                    </Button>
                                </div>
                            )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-center">
                            {allFilesComplete && (
                                <Button onClick={resetUpload} variant="outline">
                                    Upload More Files
                                </Button>
                            )}
                            {uploadState.error && (
                                <Button onClick={resetUpload} variant="outline">
                                    Try Again
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

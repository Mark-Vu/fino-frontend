"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, AlertCircle, Loader2, Download, Eye, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicBankStatementFilesService } from "@/services/public/bank-statement-files.service";
import {
    getJobStatusText,
    JobStatus,
    UPLOAD_STATUS,
    type UploadStatus,
} from "@/lib/constants";
import { getJobStatusBadgeClasses } from "@/lib/constants";

interface UploadState {
    file: File | null;
    status: UploadStatus;
    progress: number;
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
    isProcessing?: boolean; // Add isProcessing flag like multiple converter
}

// Demo files - stored in S3 public-access folder
const DEMO_FILES = [
    {
        id: "demo-pdf-1",
        name: "sample_bank_statement.pdf",
        type: "application/pdf",
        icon: FileText,
        description: "Sample Bank Statement 1",
        size: "259.0 KB",
        url: "https://fino-bucket-production.s3.amazonaws.com/public-access/sample_bank_statement.pdf",
    },
    {
        id: "demo-pdf-2",
        name: "sample_bank_statement_2.pdf",
        type: "application/pdf",
        icon: FileText,
        description: "Sample Bank Statement 2",
        size: "250.8 KB",
        url: "https://fino-bucket-production.s3.amazonaws.com/public-access/sample_bank_statement_2.pdf",
    },
];

export function PublicBankStatementConverter() {
    const [uploadState, setUploadState] = useState<UploadState>({
        file: null,
        status: UPLOAD_STATUS.IDLE,
        progress: 0,
        isProcessing: false,
    });
    const [previewFile, setPreviewFile] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    // Handle PDF preview
    const handlePreviewClick = (
        e: React.MouseEvent,
        demoFile: (typeof DEMO_FILES)[0]
    ) => {
        e.stopPropagation(); // Prevent triggering the upload
        setPreviewFile(demoFile.url);
        setIsPreviewOpen(true);
    };

    const closePreview = () => {
        setIsPreviewOpen(false);
        setPreviewFile(null);
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];

        // Validate file
        const validation = PublicBankStatementFilesService.validateFile(file);
        if (!validation.isValid) {
            setUploadState({
                file: null,
                status: UPLOAD_STATUS.ERROR,
                progress: 0,
                error: validation.errors.join(", "),
            });
            return;
        }

        // Clear any existing state and set new file
        setUploadState({
            file,
            status: UPLOAD_STATUS.IDLE,
            progress: 0,
            error: undefined,
        });
    }, []);

    const handleDemoFileClick = async (demoFile: (typeof DEMO_FILES)[0]) => {
        try {
            // Fetch the demo file
            const response = await fetch(demoFile.url);
            const blob = await response.blob();

            const file = new File([blob], demoFile.name, {
                type: demoFile.type,
            });
            onDrop([file]);

            // Simulate dropping the file
            onDrop([file]);
        } catch (error) {
            console.error("Failed to load demo file:", error);
        }
    };

    const handleConvert = async () => {
        if (!uploadState.file) return;

        setUploadState((prev) => ({
            ...prev,
            status: UPLOAD_STATUS.UPLOADING,
            progress: 0,
            error: undefined,
            isProcessing: true,
        }));

        try {
            // Step 1: Upload to S3
            const result =
                await PublicBankStatementFilesService.uploadBankStatement(
                    uploadState.file
                );

            // Step 2: Confirm upload with backend and get job ID
            const confirmResult =
                await PublicBankStatementFilesService.confirmUpload(
                    result.fileId,
                    uploadState.file.name
                );

            // Step 3: Start polling for job status
            setUploadState((prev) => ({
                ...prev,
                status: UPLOAD_STATUS.UPLOADING,
                uploadResult: result,
                fileId: result.fileId,
                jobId: confirmResult.job.id,
                isPolling: true,
                jobStatus: JobStatus.Pending,
                isProcessing: true,
            }));
        } catch (error) {
            setUploadState({
                file: uploadState.file,
                status: UPLOAD_STATUS.ERROR,
                progress: 0,
                error: error instanceof Error ? error.message : "Upload failed",
                isProcessing: false,
            });
        }
    };

    // Poll job status
    useEffect(() => {
        if (!uploadState.jobId || !uploadState.isPolling) return;

        const startTime = Date.now();
        const timeoutDuration = 90000; // 1 minute 30 seconds timeout

        const pollInterval = setInterval(async () => {
            try {
                // Check if we've exceeded the timeout
                if (Date.now() - startTime > timeoutDuration) {
                    clearInterval(pollInterval);
                    setUploadState((prev) => ({
                        ...prev,
                        isPolling: false,
                        error: "Conversion timeout: Job status check exceeded 1 minute 30 seconds",
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
                    setUploadState((prev) => ({
                        ...prev,
                        isProcessing: false,
                    }));
                }
            } catch (error) {
                console.error("Failed to poll job status:", error);
                // Stop polling on error
                clearInterval(pollInterval);
                setUploadState((prev) => ({
                    ...prev,
                    isPolling: false,
                    isProcessing: false,
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
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to download file:", error);
            // You could show an error toast here
        }
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: {
            "application/pdf": [".pdf"],
        },
        maxFiles: 1,
        disabled: uploadState.isProcessing,
    });

    const resetUpload = () => {
        setUploadState({
            file: null,
            status: UPLOAD_STATUS.IDLE,
            progress: 0,
            error: undefined,
            uploadResult: undefined,
            jobId: undefined,
            jobStatus: undefined,
            isPolling: false,
            fileId: undefined,
            isProcessing: false,
        });
    };

    const getStatusText = () => {
        return "Drop your PDF here or click to browse";
    };

    const isConversionComplete =
        uploadState.jobStatus === JobStatus.Success ||
        uploadState.jobStatus === JobStatus.Failed;

    return (
        <div className="px-4 lg:px-6 max-w-screen-2xl mx-auto w-full ">
            <div className="flex flex-col gap-6">
                <Card className="mx-auto w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Upload Bank Statement
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Demo Section */}
                        <div className="space-y-3">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                    Try with Sample Files
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Click on a demo file below to see how it
                                    works
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {DEMO_FILES.map((demoFile) => {
                                    const IconComponent = demoFile.icon;
                                    return (
                                        <div
                                            key={demoFile.id}
                                            className="group relative p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200"
                                        >
                                            <button
                                                onClick={() =>
                                                    handleDemoFileClick(
                                                        demoFile
                                                    )
                                                }
                                                disabled={
                                                    uploadState.isProcessing
                                                }
                                                className="w-full flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <div className="flex-shrink-0">
                                                    <IconComponent className="w-8 h-8 text-primary group-hover:text-primary/80" />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary">
                                                        {demoFile.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {demoFile.description} •{" "}
                                                        {demoFile.size}
                                                    </p>
                                                </div>
                                            </button>

                                            {/* Preview Button */}
                                            <button
                                                onClick={(e) =>
                                                    handlePreviewClick(
                                                        e,
                                                        demoFile
                                                    )
                                                }
                                                className="absolute top-2 right-2 p-1.5 rounded-md bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                                title="Preview PDF"
                                            >
                                                <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            </button>

                                            <div className="absolute inset-0 rounded-lg bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                                    Or upload your own file
                                </span>
                            </div>
                        </div>

                        {/* File Upload Area */}
                        <div
                            {...getRootProps()}
                            className={`border-2 border-dashed rounded-lg p-8 text-center border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-600 ${
                                uploadState.isProcessing
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
                                    {uploadState.jobStatus ===
                                    JobStatus.Success ? (
                                        <Button
                                            onClick={handleDownload}
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download
                                        </Button>
                                    ) : uploadState.jobStatus ===
                                      JobStatus.Failed ? (
                                        <Badge className="bg-red-600 text-white">
                                            {getJobStatusText(
                                                uploadState.jobStatus
                                            )}
                                        </Badge>
                                    ) : uploadState.jobStatus ===
                                      JobStatus.Processing ? (
                                        <Badge
                                            className={getJobStatusBadgeClasses(
                                                uploadState.jobStatus
                                            )}
                                        >
                                            {getJobStatusText(
                                                uploadState.jobStatus
                                            )}
                                            <Loader2 className="ml-2 w-4 h-4 animate-spin" />
                                        </Badge>
                                    ) : uploadState.jobStatus ===
                                      JobStatus.Pending ? (
                                        <Badge
                                            className={getJobStatusBadgeClasses(
                                                uploadState.jobStatus
                                            )}
                                        >
                                            {getJobStatusText(
                                                uploadState.jobStatus
                                            )}
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-muted text-foreground">
                                            Ready
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Error Message */}
                        {uploadState.status === UPLOAD_STATUS.ERROR &&
                            uploadState.error && (
                                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                        <p className="text-red-700 dark:text-red-300">
                                            {uploadState.error}
                                        </p>
                                    </div>
                                </div>
                            )}

                        {/* Convert Button - Bottom Right */}
                        {uploadState.file &&
                            uploadState.status === UPLOAD_STATUS.IDLE && (
                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleConvert}
                                        className="bg-primary hover:bg-primary/90"
                                    >
                                        Convert
                                    </Button>
                                </div>
                            )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 justify-center">
                            {isConversionComplete && (
                                <Button onClick={resetUpload} variant="outline">
                                    Upload Another File
                                </Button>
                            )}
                            {uploadState.status === UPLOAD_STATUS.ERROR && (
                                <Button onClick={resetUpload} variant="outline">
                                    Try Again
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* PDF Preview Modal */}
            {isPreviewOpen && previewFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="relative w-full max-w-4xl h-[90vh] bg-white dark:bg-gray-900 rounded-lg shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                PDF Preview
                            </h3>
                            <button
                                onClick={closePreview}
                                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* PDF Viewer */}
                        <div className="h-[calc(100%-4rem)]">
                            <iframe
                                src={`${previewFile}#toolbar=1&navpanes=1&scrollbar=1`}
                                className="w-full h-full border-0 rounded-b-lg"
                                title="PDF Preview"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

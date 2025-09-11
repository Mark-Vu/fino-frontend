"use client";

import { useTenant } from "@/context/tenant-context";
import { Button } from "@/components/ui/button";
import { LoginPage } from "@/components/auth/login-page";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Building2, AlertCircle, CheckCircle } from "lucide-react";
import { redirectToMainDomain, redirectToTenant } from "@/utils/tenant";
import { useState, useEffect } from "react";
import { TenantApprovalStatus } from "@/services/users.service";

interface TenantValidationProps {
    children: React.ReactNode;
}

export function TenantValidation({ children }: TenantValidationProps) {
    const {
        user,
        tenant,
        loading,
        error,
        isTenantValid,
        isUserInTenant,
        requestAccess,
    } = useTenant();
    const [isRequesting, setIsRequesting] = useState(false);

    // Check if user is accessing the wrong tenant and redirect them
    useEffect(() => {
        if (user && tenant && !loading && !error) {
            // If user has a tenantId but it doesn't match the current tenant
            if (user.tenantId && user.tenantId !== tenant.id) {
                console.log(
                    `User belongs to tenant ${user.tenantId} but accessing ${tenant.id}, redirecting...`
                );
                redirectToTenant(user.tenantId);
                return;
            }
        }
    }, [user, tenant, loading, error]);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">
                        Loading tenant information...
                    </p>
                </div>
            </div>
        );
    }

    // If unauthenticated on a tenant subdomain, show centered login form
    if (!user) {
        return <LoginPage loginWithGoogle={false} />;
    }

    // Show error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <CardTitle>Error Loading Tenant</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={() => window.location.reload()}
                            className="w-full"
                        >
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Tenant not found - redirect to main domain
    if (!isTenantValid) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <CardTitle>Tenant Not Found</CardTitle>
                        <CardDescription>
                            The company you&apos;re looking for doesn&apos;t
                            exist or has been removed.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            onClick={redirectToMainDomain}
                            className="w-full"
                        >
                            Go to Main App
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // User not in tenant - show request access or status
    if (!isUserInTenant) {
        // Check if user has pending approval
        if (user?.tenantApprovalStatus === TenantApprovalStatus.Pending) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <CheckCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                            <CardTitle>Access Request Pending</CardTitle>
                            <CardDescription>
                                Your request to join {tenant?.companyName} is
                                being reviewed by administrators.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert>
                                <AlertDescription>
                                    You will be notified once your request is
                                    approved or rejected.
                                </AlertDescription>
                            </Alert>

                            <Button
                                variant="outline"
                                onClick={redirectToMainDomain}
                                className="w-full"
                            >
                                Go to Main App
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        // Check if user was rejected
        if (user?.tenantApprovalStatus === TenantApprovalStatus.Rejected) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                            <CardTitle>Access Request Rejected</CardTitle>
                            <CardDescription>
                                Your request to join {tenant?.companyName} was
                                not approved.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Alert variant="destructive">
                                <AlertDescription>
                                    Please contact the company administrators
                                    for more information.
                                </AlertDescription>
                            </Alert>

                            <Button
                                variant="outline"
                                onClick={redirectToMainDomain}
                                className="w-full"
                            >
                                Go to Main App
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            );
        }
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
                        <CardTitle>
                            Request Access to {tenant?.companyName}
                        </CardTitle>
                        <CardDescription>
                            You need permission to access this company&apos;s
                            workspace.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <AlertDescription>
                                Your request will be sent to the company
                                administrators for approval.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                            <Button
                                onClick={async () => {
                                    setIsRequesting(true);
                                    try {
                                        await requestAccess();
                                    } finally {
                                        setIsRequesting(false);
                                    }
                                }}
                                disabled={isRequesting}
                                className="w-full"
                            >
                                {isRequesting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Requesting Access...
                                    </>
                                ) : (
                                    "Request Access"
                                )}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={redirectToMainDomain}
                                className="w-full"
                            >
                                Go to Main App
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // User is in tenant - show the app
    return <>{children}</>;
}

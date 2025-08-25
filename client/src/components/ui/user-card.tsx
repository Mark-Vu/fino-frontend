"use client";

import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MapPinIcon, LinkIcon } from "lucide-react";
import { DEFAULT_AVATAR } from "@/lib/constants";

interface UserCardProps {
    user: {
        id: string;
        name?: string | null;
        username: string;
        image?: string | null;
        bio?: string | null;
        location?: string | null;
        website?: string | null;
        follower_count: number;
        following_count: number;
    };
    showLink?: boolean;
    avatarSize?: "sm" | "md" | "lg";
    compact?: boolean;
}

export default function UserCard({
    user,
    showLink = true,
    avatarSize = "lg",
    compact = false,
}: UserCardProps) {
    const avatarSizeClasses = {
        sm: "w-12 h-12",
        md: "w-16 h-16",
        lg: "w-20 h-20",
    };

    const UserInfo = () => (
        <div className="flex flex-col items-center text-center">
            <Avatar className={`${avatarSizeClasses[avatarSize]} border-2`}>
                <AvatarImage
                    src={user.image || `${DEFAULT_AVATAR}${user.name}`}
                    alt={user.name || "User"}
                />
                <AvatarFallback>
                    {user.name?.charAt(0) || user.username?.charAt(0) || "U"}
                </AvatarFallback>
            </Avatar>

            <div className="mt-4 space-y-1">
                <h3 className="font-semibold">{user.name || user.username}</h3>
                <p className="text-sm text-muted-foreground">
                    @{user.username}
                </p>
            </div>

            {user.bio && (
                <p className="mt-3 text-sm text-muted-foreground text-center">
                    {user.bio}
                </p>
            )}

            {!compact && (
                <>
                    <div className="w-full">
                        <Separator className="my-4" />
                        <div className="flex justify-between">
                            <div>
                                <p className="font-medium">
                                    {user.following_count.toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Following
                                </p>
                            </div>
                            <Separator orientation="vertical" />
                            <div>
                                <p className="font-medium">
                                    {user.follower_count.toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Followers
                                </p>
                            </div>
                        </div>
                        <Separator className="my-4" />
                    </div>

                    <div className="w-full space-y-2 text-sm">
                        <div className="flex items-center text-muted-foreground">
                            <MapPinIcon className="w-4 h-4 mr-2" />
                            {user.location || "No location"}
                        </div>
                        <div className="flex items-center text-muted-foreground">
                            <LinkIcon className="w-4 h-4 mr-2 shrink-0" />
                            {user.website ? (
                                <a
                                    href={
                                        user.website.startsWith("http")
                                            ? user.website
                                            : `https://${user.website}`
                                    }
                                    className="hover:underline truncate"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {user.website}
                                </a>
                            ) : (
                                "No website"
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );

    if (showLink) {
        return (
            <Link
                href={`/profile/${user.username}`}
                className="flex flex-col items-center justify-center block"
            >
                <UserInfo />
            </Link>
        );
    }

    return <UserInfo />;
}

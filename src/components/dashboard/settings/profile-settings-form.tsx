"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Loader2, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { updateProfile, updateAvatar, changePassword } from "@/actions/profile";
import type { Profile } from "@/types/database";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Props {
  profile: Profile;
}

export function ProfileSettingsForm({ profile }: Props) {
  const [isPending, startTransition] = useTransition();
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);

  async function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (avatarUrl && avatarUrl.trim() !== "") {
      await deleteImage(avatarUrl);
    }

    setIsAvatarUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64,
            mimeType: file.type,
            folder: "snapland/avatars",
          }),
        });
        const json = await res.json();
        if (!res.ok || json.error) {
          toast.error(json.error ?? "Upload failed");
          return;
        }
        const newUrl: string = json.data.url;
        setAvatarUrl(newUrl);

        const result = await updateAvatar(newUrl);
        if (result.success) toast.success("Avatar updated.");
        else toast.error(result.error ?? "Failed to save avatar.");
      };
      reader.readAsDataURL(file);
    } finally {
      setIsAvatarUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const deleteImage = async (imageUrl: string) => {
    const response = await fetch(
      `/api/upload?url=${encodeURIComponent(imageUrl)}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      },
    );
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error ?? "Failed to delete image");
    }

    toast.success(data.message ?? "Image deleted successfully");
  };

  function handleSaveProfile() {
    if (!fullName.trim()) {
      toast.error("Name is required.");
      return;
    }
    startTransition(async () => {
      const result = await updateProfile({ full_name: fullName.trim() });
      if (result.success) toast.success("Profile saved.");
      else toast.error(result.error ?? "Failed.");
    });
  }

  function handleChangePassword() {
    setPwError(null);
    if (!currentPassword) {
      setPwError("Enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const result = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (result.success) {
        toast.success("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPwError(result.error ?? "Failed.");
      }
    });
  }

  return (
    <div className="w-full space-y-6">
      {/* ── Profile Info ── */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your name and profile photo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar className="size-20">
                <AvatarImage src={avatarUrl || undefined} alt={fullName} />
                <AvatarFallback className="text-lg">
                  {getInitials(fullName || profile.email)}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={isAvatarUploading}
                className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:opacity-50"
              >
                {isAvatarUploading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Camera className="size-3.5" />
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFile}
              />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{profile.email}</p>
              <Badge
                variant={profile.role === "admin" ? "default" : "secondary"}
                className="capitalize text-xs"
              >
                {profile.role}
              </Badge>
              <p className="text-muted-foreground text-xs">
                Member since{" "}
                {new Date(profile.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <Separator />

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="full-name">Full Name</Label>
            <Input
              id="full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="max-w-sm"
            />
          </div>

          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <Label>Email Address</Label>
            <Input
              value={profile.email}
              disabled
              className="max-w-sm bg-muted/40"
            />
            <p className="text-muted-foreground text-xs">
              Email cannot be changed here. Contact admin if needed.
            </p>
          </div>

          {/* Quota info */}
          <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3 text-sm max-w-sm">
            <div>
              <p className="text-muted-foreground text-xs">Products quota</p>
              <p className="font-semibold">{profile.max_products}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">
                Landing pages quota
              </p>
              <p className="font-semibold">{profile.max_landing_pages}</p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSaveProfile} disabled={isPending}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Change Password ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password. Choose something strong and unique.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pwError && (
            <Alert variant="destructive">
              <AlertDescription>{pwError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="current-pw">Current Password</Label>
            <Input
              id="current-pw"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="max-w-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-pw">New Password</Label>
            <Input
              id="new-pw"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="max-w-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-pw">Confirm New Password</Label>
            <Input
              id="confirm-pw"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="max-w-sm"
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button
              onClick={handleChangePassword}
              disabled={
                isPending ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
              variant="outline"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ShieldCheck className="size-4" />
              )}
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

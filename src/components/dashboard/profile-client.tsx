"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/api/axiosInstance";
import axios from "axios"; // Keeping for type definitions if needed, but using axiosInstance for calls
import {
  UserIcon,
  PhotoIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { DashboardSidebar, DashboardMobileNav } from "@/components/dashboard/dashboard-sidebar";

type Props = {
  fullName: string;
  role: string;
  email: string;
};

export function ProfileClient({ fullName, role, email }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    bio: "",
    birthdate: "",
    organisation: "",
    address: "",
    pfpUrl: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/profile");
      if (res.data) {
        setFormData({
          bio: res.data.bio || "",
          birthdate: res.data.birthdate ? new Date(res.data.birthdate).toISOString().split("T")[0] : "",
          organisation: res.data.organisation || "",
          address: res.data.address || "",
          pfpUrl: res.data.pfpUrl || "",
        });
        setPreviewUrl(res.data.pfpUrl || "");
      }
    } catch (err: any) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axiosInstance.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data.link;
    } catch (err: any) {
      console.error("Upload Error:", err.response?.data || err.message);
      throw new Error("Failed to upload image to server");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let finalPfpUrl = formData.pfpUrl;

      if (selectedFile) {
        finalPfpUrl = await uploadFile(selectedFile);
      }

      await axiosInstance.post(
        "/profile",
        { ...formData, pfpUrl: finalPfpUrl }
      );

      setSuccess("Profile updated successfully!");
      setFormData(prev => ({ ...prev, pfpUrl: finalPfpUrl }));
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-dvh bg-[#232427] p-0 sm:p-2">
      <section className="mx-auto flex min-h-dvh w-full max-w-none flex-col overflow-hidden rounded-none bg-[#f1f2f4] lg:flex-row lg:h-[calc(100dvh-16px)] sm:min-h-[calc(100dvh-16px)] sm:rounded-2xl">
        <DashboardSidebar fullName={fullName} role={role} />

        <section className="w-full p-3 sm:p-4 lg:p-6 overflow-y-auto">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm lg:hidden">
            <DashboardMobileNav role={role} />
          </div>

          <header className="fade-slide rounded-xl border border-slate-200 bg-white px-3 py-3 sm:px-4 mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">User Profile</p>
                <h2 className="font-[var(--font-space-grotesk)] text-2xl font-semibold text-slate-900 sm:text-3xl">Manage Account</h2>
              </div>
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Overview
              </Link>
            </div>
          </header>

          <article className="fade-slide delay-1 mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden text-pretty">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 h-32 w-full relative" />
            
            <div className="px-8 flex flex-col items-start gap-4 -mt-20 relative z-10">
              <div className="relative h-32 w-32 sm:h-34 sm:w-34 rounded-3xl border-4 border-white bg-slate-100 shadow-lg group overflow-hidden shrink-0">
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-full w-full p-4 text-slate-300" />
                )}
                <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                  <PhotoIcon className="h-8 w-8 text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>

              <div className="flex flex-col gap-1.5 animation-delay-75">
                <div className="flex items-center gap-3">
                  <h3 className="font-[var(--font-space-grotesk)] text-3xl font-bold text-slate-900 leading-tight tracking-tight">{fullName}</h3>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    {role}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <EnvelopeIcon className="h-4 w-4" />
                  <span className="text-base font-medium">{email}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 pt-8">
              {success && (
                <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 animate-in fade-in zoom-in duration-300">
                  <CheckCircleIcon className="h-5 w-5" />
                  {success}
                </div>
              )}

              {error && (
                <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800 animate-in fade-in slide-in-from-top-2 duration-300">
                  <ExclamationCircleIcon className="h-5 w-5" />
                  {error}
                </div>
              )}

              <div className="fade-slide delay-2 mb-8">
                <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                <textarea
                  placeholder="Write a short bio about yourself..."
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none min-h-[100px]"
                />
                <p className="mt-1 text-right text-xs text-slate-400 font-medium">
                  {formData.bio.length} characters
                </p>
              </div>

              <div className="fade-slide delay-3 grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Organisation</label>
                    <div className="relative">
                      <BuildingOfficeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. Acme Corp"
                        value={formData.organisation}
                        onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="e.g. 123 Main St, New York"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Birthdate</label>
                    <div className="relative">
                      <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type="date"
                        value={formData.birthdate}
                        onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 pl-10 pr-4 py-2 text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="fade-slide delay-4 mt-10 flex items-center justify-between border-t border-slate-100 pt-8">
                <p className="text-xs text-slate-400">
                  Last updated: {new Date().toLocaleDateString()}
                </p>
                <button
                  type="submit"
                  disabled={saving || loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-700 hover:shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {saving ? "Saving Changes..." : "Update Profile"}
                </button>
              </div>
            </form>
          </article>
        </section>
      </section>
    </main>
  );
}

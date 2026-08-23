"use client";

import { toast } from "@/components/ui/toast";

export type ToastType = "success" | "info" | "warning" | "error" | "loading";

export interface ToastOptions {
  title: string;
  description?: string;
  type?: ToastType;
  timeout?: number;
}

export function useToast() {
  const showToast = ({
    title,
    description,
    type = "info",
    timeout = 5000,
  }: ToastOptions) => {
    toast.add({
      title,
      description,
      type,
      timeout,
    });
  };

  return {
    toast: showToast,
    success: (title: string, description?: string) =>
      showToast({ title, description, type: "success" }),
    error: (title: string, description?: string) =>
      showToast({ title, description, type: "error" }),
    warning: (title: string, description?: string) =>
      showToast({ title, description, type: "warning" }),
    info: (title: string, description?: string) =>
      showToast({ title, description, type: "info" }),
    loading: (title: string, description?: string) =>
      showToast({ title, description, type: "loading" }),
  };
}

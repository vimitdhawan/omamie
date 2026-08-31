"use client";

import * as React from "react";
import { Dialog as DialogNamespace } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogNamespace.Root;
const DialogTrigger = DialogNamespace.Trigger;
const DialogPortal = DialogNamespace.Portal;
const DialogClose = DialogNamespace.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogNamespace.Backdrop>,
  React.ComponentPropsWithoutRef<typeof DialogNamespace.Backdrop>
>(({ className, ...props }, ref) => (
  <DialogNamespace.Backdrop
    ref={ref}
    className={cn(
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogNamespace.Backdrop.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogNamespace.Popup>,
  React.ComponentPropsWithoutRef<typeof DialogNamespace.Popup>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogNamespace.Popup
      ref={ref}
      className={cn(
        "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed top-[50%] left-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogNamespace.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogNamespace.Close>
    </DialogNamespace.Popup>
  </DialogPortal>
));
DialogContent.displayName = DialogNamespace.Popup.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogNamespace.Title>,
  React.ComponentPropsWithoutRef<typeof DialogNamespace.Title>
>(({ className, ...props }, ref) => (
  <DialogNamespace.Title
    ref={ref}
    className={cn(
      "text-lg leading-none font-semibold tracking-tight",
      className
    )}
    {...props}
  />
));
DialogTitle.displayName = DialogNamespace.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogNamespace.Description>,
  React.ComponentPropsWithoutRef<typeof DialogNamespace.Description>
>(({ className, ...props }, ref) => (
  <DialogNamespace.Description
    ref={ref}
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogNamespace.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};

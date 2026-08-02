"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

import { submitContactAction } from "../actions";
import {
  CONTACT_SUBJECT_OPTIONS,
  contactSchema,
  type ContactActionState,
  type ContactFormData,
} from "../schema";

export function ContactForm() {
  // Track submission count to force effect re-runs
  const [submissionCount, setSubmissionCount] = useState(0);

  const [state, action, isPending] = useActionState<
    ContactActionState,
    FormData
  >(submitContactAction, { errors: {} });

  const { toast, dismiss } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur", // Validate on blur
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      subject: "general",
      message: "",
    },
  });

  const {
    formState: { isValid },
  } = form;

  // Determine if button should be disabled
  // Disabled only when there are validation errors OR form is invalid
  const hasServerFieldErrors =
    state?.errors && Object.keys(state.errors).length > 0;
  const isButtonDisabled = isPending || hasServerFieldErrors || !isValid;

  // Success effect - clear form and show toast
  useEffect(() => {
    if (state?.success && submissionCount > 0) {
      // Dismiss all existing toasts first
      dismiss();

      // Reset form immediately
      form.reset({
        fullName: "",
        email: "",
        phone: "",
        subject: "general",
        message: "",
      });

      // Show success toast
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.success, submissionCount]);

  // Error effects - handle both field and network errors
  useEffect(() => {
    if (submissionCount > 0) {
      // Field validation errors from server
      if (state?.errors && Object.keys(state.errors).length > 0) {
        // Dismiss all toasts
        dismiss();

        // Set field errors in the form
        Object.entries(state.errors).forEach(([key, messages]) => {
          if (messages && messages.length > 0) {
            form.setError(key as keyof ContactFormData, {
              type: "server",
              message: messages[0],
            });
          }
        });

        // Show validation error toast
        toast({
          variant: "destructive",
          title: "Please check your input",
          description: "Some fields have errors that need to be fixed.",
        });
      }

      // Network or general errors (no field errors)
      if (state?.errorMessage && !state?.errors) {
        dismiss();

        toast({
          variant: "destructive",
          title: "Error",
          description: state.errorMessage,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.errors, state?.errorMessage, submissionCount]);

  return (
    <Form {...form}>
      <form
        action={async (formData) => {
          setSubmissionCount((prev) => prev + 1);
          await action(formData);
        }}
        className="space-y-6"
      >
        {/* Form Fields with Better Spacing */}
        <div className="space-y-6">
          {/* Name & Email Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Full Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="John Doe"
                      className="h-11"
                      {...field}
                      onBlur={() => {
                        field.onBlur(); // Call react-hook-form's onBlur
                        form.trigger("fullName"); // Trigger validation
                      }}
                      onFocus={() => {
                        form.clearErrors("fullName"); // Clear error on focus
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      className="h-11"
                      {...field}
                      onBlur={() => {
                        field.onBlur();
                        form.trigger("email");
                      }}
                      onFocus={() => {
                        form.clearErrors("email");
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Phone & Subject Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone (optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      className="h-11"
                      {...field}
                      onBlur={() => {
                        field.onBlur();
                        form.trigger("phone");
                      }}
                      onFocus={() => {
                        form.clearErrors("phone");
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Reason for Contact{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    name={field.name}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full" size="lg">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CONTACT_SUBJECT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Message Field */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Message <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="How can we help you?"
                    className="min-h-[120px] resize-none"
                    rows={5}
                    {...field}
                    onBlur={() => {
                      field.onBlur();
                      form.trigger("message");
                    }}
                    onFocus={() => {
                      form.clearErrors("message");
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            size="lg"
            className="h-12 w-full text-base"
            disabled={isButtonDisabled}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </Button>
        </div>

        {/* Helper Text */}
        <p className="text-muted-foreground text-center text-sm">
          We typically respond within 24 hours during business days.
        </p>
      </form>
    </Form>
  );
}

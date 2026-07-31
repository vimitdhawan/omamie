"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
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

import { submitContactAction } from "../actions";
import {
  CONTACT_SUBJECT_OPTIONS,
  contactSchema,
  type ContactActionState,
  type ContactFormData,
} from "../schema";

export function ContactForm() {
  const [state, action, isPending] = useActionState<
    ContactActionState,
    FormData
  >(submitContactAction, { errors: {} });

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      subject: "general",
      message: "",
    },
  });

  useEffect(() => {
    if (state?.errors) {
      Object.entries(state.errors).forEach(([key, messages]) => {
        if (messages && messages.length > 0) {
          form.setError(key as keyof ContactFormData, {
            type: "server",
            message: messages[0],
          });
        }
      });
    }
  }, [state, form]);

  useEffect(() => {
    if (state?.success) {
      form.reset({
        fullName: "",
        email: "",
        phone: "",
        subject: "general",
        message: "",
      });
    }
  }, [state?.success, form]);

  return (
    <Form {...form}>
      <form action={action} className="space-y-[var(--sp-lg)]">
        {state?.errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{state.errorMessage}</AlertDescription>
          </Alert>
        )}

        {state?.success && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Thanks for reaching out! We&apos;ll get back to you within
              24 hours.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 gap-[var(--sp-base)] md:grid-cols-2">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="John Doe"
                    {...field}
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
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-[var(--sp-base)] md:grid-cols-2">
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
                    {...field}
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
                <FormLabel>Reason for Contact</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  name={field.name}
                >
                  <FormControl>
                    <SelectTrigger className="h-9 w-full">
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

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="How can we help you?"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-[var(--sp-base)]">
          <Button
            type="submit"
            className="h-12 w-full"
            disabled={isPending}
          >
            {isPending && (
              <Loader2 className="mr-[var(--sp-sm)] h-4 w-4 animate-spin" />
            )}
            Send Message
          </Button>
        </div>

        <p className="text-muted text-center text-sm">
          Typical response time is within 24 hours.
        </p>
      </form>
    </Form>
  );
}

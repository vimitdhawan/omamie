"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { toast } from "sonner";
import type { Contact } from "../types";
import { sendReplyAction } from "../actions";

type ReplyDialogProps = {
  message: Contact;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ReplyDialog({ message, open, onOpenChange }: ReplyDialogProps) {
  const [state, formAction, isPending] = useActionState(sendReplyAction, null);
  const formRef = useRef<HTMLFormElement>(null);

  // Handle success
  useEffect(() => {
    if (state?.success) {
      toast.success("Reply sent successfully");
      onOpenChange(false);
      formRef.current?.reset();
    }
  }, [state?.success, onOpenChange]);

  // Handle errors
  useEffect(() => {
    if (state?.errorMessage) {
      toast.error(state.errorMessage);
    }
  }, [state?.errorMessage]);

  const defaultSubject = `Re: ${message.subject}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Reply to {message.fullName}</DialogTitle>
          <DialogDescription>
            Send an email reply to this contact message
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={formAction} className="space-y-4">
          {/* Hidden field for original message ID */}
          <input type="hidden" name="originalMessageId" value={message.id} />

          {/* To field */}
          <Field>
            <FieldLabel htmlFor="to">To</FieldLabel>
            <Input
              id="to"
              name="to"
              type="email"
              defaultValue={message.email}
              placeholder="recipient@example.com"
              required
            />
            {state?.errors?.to?.[0] && (
              <FieldError>{state.errors.to[0]}</FieldError>
            )}
          </Field>

          {/* Subject field */}
          <Field>
            <FieldLabel htmlFor="subject">Subject</FieldLabel>
            <Input
              id="subject"
              name="subject"
              type="text"
              defaultValue={defaultSubject}
              placeholder="Email subject"
              required
            />
            {state?.errors?.subject?.[0] && (
              <FieldError>{state.errors.subject[0]}</FieldError>
            )}
          </Field>

          {/* Message field */}
          <Field>
            <FieldLabel htmlFor="message">Message</FieldLabel>
            <Textarea
              id="message"
              name="message"
              rows={8}
              placeholder="Type your reply here..."
              required
            />
            {state?.errors?.message?.[0] && (
              <FieldError>{state.errors.message[0]}</FieldError>
            )}
          </Field>

          {/* Original message reference */}
          <div className="bg-muted rounded-md p-4 text-sm">
            <p className="mb-2 font-medium">Original message:</p>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {message.message}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Sending..." : "Send Reply"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

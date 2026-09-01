"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import type { Contact } from "../types";
import { formatDateTime } from "../utils";
import { ReplyDialog } from "./reply-dialog";

type ContactMessageListProps = {
  messages: Contact[];
};

const SUBJECT_LABELS: Record<string, string> = {
  listing: "Listing a Property",
  finding: "Finding a Property",
  partnership: "Partnership Opportunity",
  general: "General Question",
  feedback: "Feedback or Suggestion",
  issue: "Report an Issue",
  other: "Other",
};

export function ContactMessageList({ messages }: ContactMessageListProps) {
  const [selectedMessage, setSelectedMessage] = useState<Contact | null>(null);

  if (messages.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center">
        No contact messages yet
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {messages.map((message) => (
          <Card key={message.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <CardTitle className="text-lg">{message.fullName}</CardTitle>
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <span>{message.email}</span>
                    {message.phone && (
                      <>
                        <span>•</span>
                        <span>{message.phone}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {SUBJECT_LABELS[message.subject] || message.subject}
                    </Badge>
                    <span className="text-muted-foreground text-xs">
                      {formatDateTime(message.createdAt)}
                    </span>
                  </div>
                </div>
                <Button size="sm" onClick={() => setSelectedMessage(message)}>
                  <Mail className="mr-1 h-4 w-4" />
                  Reply
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{message.message}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedMessage && (
        <ReplyDialog
          message={selectedMessage}
          open={!!selectedMessage}
          onOpenChange={(open) => !open && setSelectedMessage(null)}
        />
      )}
    </>
  );
}

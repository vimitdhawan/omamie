import { ContactMessageList } from "@/features/admin/components/contact-message-list";
import { getAllContactMessages } from "@/features/admin/service";

export default async function AdminMessagesPage() {
  const messages = await getAllContactMessages();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Contact Messages</h1>
        <p className="text-muted-foreground">
          View and reply to contact form submissions ({messages.length} total)
        </p>
      </div>

      {/* Messages List */}
      <ContactMessageList messages={messages} />
    </div>
  );
}

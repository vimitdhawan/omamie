import { getOpenContactMessages } from "@/features/admin/contact-messages/service";
import { AdminContactMessagesTable } from "@/features/admin/contact-messages/components/admin-contact-messages-table";

export default async function AdminContactMessagesPage() {
  const messages = await getOpenContactMessages();

  return (
    <div className="flex-1 space-y-8 p-8">
      <AdminContactMessagesTable openMessages={messages} />
    </div>
  );
}

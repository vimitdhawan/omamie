import { Home, MessageCircleHeart, CheckCircle2, XCircle } from "lucide-react";
import type { ActivityItem, ActivityType } from "../types";
import { EmptyState } from "./empty-state";

const ACTIVITY_ICON: Record<ActivityType, React.ReactNode> = {
  property_listed: <Home className="size-4" />,
  match_interested: <MessageCircleHeart className="size-4" />,
  match_approved: <CheckCircle2 className="size-4" />,
  match_rejected: <XCircle className="size-4" />,
};

const ACTIVITY_COLOR: Record<ActivityType, string> = {
  property_listed: "bg-gray-100 text-gray-600",
  match_interested: "bg-blue-50 text-blue-600",
  match_approved: "bg-green-50 text-green-600",
  match_rejected: "bg-red-50 text-red-600",
};

function timeAgo(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

type ActivityFeedProps = {
  items: ActivityItem[];
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  if (items.length === 0) {
    return <EmptyState message="No recent activity yet." />;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3">
          <div
            className={`${ACTIVITY_COLOR[item.type]} flex size-8 flex-shrink-0 items-center justify-center rounded-full`}
          >
            {ACTIVITY_ICON[item.type]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate text-[14px] font-semibold">
              {item.title}
            </p>
            <p className="text-muted-foreground text-[13px]">{item.subtitle}</p>
          </div>
          <span className="text-muted-foreground flex-shrink-0 text-[12px]">
            {timeAgo(item.createdAt)}
          </span>
        </div>
      ))}
    </div>
  );
}

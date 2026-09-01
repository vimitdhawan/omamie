import {
  Users,
  Building2,
  Clock,
  MessageSquare,
  UserCheck,
  UserCog,
  UserRound,
  Shield,
  Eye,
  CheckCircle2,
  XCircle,
  Key,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/features/admin/components/stat-card";
import { getDashboardStats } from "@/features/admin/service";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Platform overview and statistics
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          description="Registered platform users"
        />
        <StatCard
          title="Total Properties"
          value={stats.totalProperties}
          icon={Building2}
          description="All property listings"
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pendingReviews}
          icon={Clock}
          description="Properties awaiting approval"
        />
        <StatCard
          title="Contact Messages"
          value={stats.unreadMessages}
          icon={MessageSquare}
          description="Unread contact submissions"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserRound className="text-muted-foreground h-4 w-4" />
                <span className="text-sm font-medium">Tenants</span>
              </div>
              <span className="text-2xl font-bold">
                {stats.usersByRole.tenant}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="text-muted-foreground h-4 w-4" />
                <span className="text-sm font-medium">Agents</span>
              </div>
              <span className="text-2xl font-bold">
                {stats.usersByRole.agent}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCog className="text-muted-foreground h-4 w-4" />
                <span className="text-sm font-medium">Owners</span>
              </div>
              <span className="text-2xl font-bold">
                {stats.usersByRole.owner}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="text-muted-foreground h-4 w-4" />
                <span className="text-sm font-medium">Admins</span>
              </div>
              <span className="text-2xl font-bold">
                {stats.usersByRole.admin}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Properties by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Properties by Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground h-4 w-4" />
                <span className="text-sm font-medium">Pending</span>
              </div>
              <span className="text-2xl font-bold">
                {stats.propertiesByStatus.pending}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="text-muted-foreground h-4 w-4" />
                <span className="text-sm font-medium">Under Review</span>
              </div>
              <span className="text-2xl font-bold">
                {stats.propertiesByStatus.review}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-muted-foreground h-4 w-4" />
                <span className="text-sm font-medium">Active</span>
              </div>
              <span className="text-2xl font-bold">
                {stats.propertiesByStatus.active}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="text-muted-foreground h-4 w-4" />
                <span className="text-sm font-medium">Rented</span>
              </div>
              <span className="text-2xl font-bold">
                {stats.propertiesByStatus.rented}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="text-muted-foreground h-4 w-4" />
                <span className="text-sm font-medium">Inactive</span>
              </div>
              <span className="text-2xl font-bold">
                {stats.propertiesByStatus.inactive}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

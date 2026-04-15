import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — SubPilot" },
      { name: "description", content: "Manage your subscriptions, contracts, and cancellations from your SubPilot dashboard." },
    ],
  }),
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardTopbar />
        <main className="flex-1 p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

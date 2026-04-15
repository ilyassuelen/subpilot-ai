import { createFileRoute } from "@tanstack/react-router";
import { RemindersPage } from "@/components/dashboard/RemindersPage";

export const Route = createFileRoute("/dashboard/reminders")({
  component: RemindersPage,
});

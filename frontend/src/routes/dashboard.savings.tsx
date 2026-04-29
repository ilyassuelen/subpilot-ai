import { createFileRoute } from "@tanstack/react-router";
import { SavingsPage } from "@/components/dashboard/SavingsPage";

export const Route = createFileRoute("/dashboard/savings")({
  component: SavingsPage,
});

import { createFileRoute } from "@tanstack/react-router";
import { ContractsPage } from "@/components/dashboard/ContractsPage";

export const Route = createFileRoute("/dashboard/contracts")({
  component: ContractsPage,
});

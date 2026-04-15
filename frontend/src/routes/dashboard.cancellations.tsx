import { createFileRoute } from "@tanstack/react-router";
import { CancellationsPage } from "@/components/dashboard/CancellationsPage";

export const Route = createFileRoute("/dashboard/cancellations")({
  component: CancellationsPage,
});

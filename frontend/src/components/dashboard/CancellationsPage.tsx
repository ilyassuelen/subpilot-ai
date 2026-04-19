import { useEffect, useMemo, useState } from "react";
import {
  BrainCircuit,
  FileText,
  Check,
  XCircle,
  Globe,
  Mail,
  Copy,
  ExternalLink,
  Edit,
  Clock,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useApproveCancellation,
  useCancelCancellation,
  useCancellations,
  useEmailPreview,
  useGenerateCancellation,
  useMarkCancellationSent,
} from "@/hooks/useCancellations";
import { useContracts } from "@/hooks/useContracts";
import type { Cancellation, Contract } from "@/lib/types";

const statusColors: Record<string, string> = {
  draft: "bg-warning/10 text-warning",
  approved: "bg-primary/10 text-primary",
  sent: "bg-success/10 text-success",
  cancelled: "bg-muted text-muted-foreground",
};

const cancellationFormSchema = z.object({
  contract_id: z.coerce.number().positive("Please select a contract"),
  language: z.enum(["de", "en"]),
  customer_name: z.string().min(1, "Name is required").max(255),
  customer_number: z.string().max(255).optional().or(z.literal("")),
  customer_address: z.string().min(1, "Address is required").max(500),
  customer_email: z.string().email("Invalid email").max(255),
  provider_email: z.string().email("Invalid email").max(255),
  provider_address: z.string().max(500).optional().or(z.literal("")),
});

type CancellationFormData = z.infer<typeof cancellationFormSchema>;

function formatDateTime(date: string | null) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatLanguage(language: string) {
  if (language === "de") return "German";
  if (language === "en") return "English";
  return language;
}

export function CancellationsPage() {
  const [filter, setFilter] = useState("all");
  const [generateOpen, setGenerateOpen] = useState(false);
  const [step, setStep] = useState<"form" | "preview" | "email">("form");
  const [activeCancellation, setActiveCancellation] =
    useState<Cancellation | null>(null);
  const [emailPreviewId, setEmailPreviewId] = useState(0);

  const {
    data: cancellations = [],
    isLoading,
    error,
  } = useCancellations();

  const {
    data: contracts = [],
    isLoading: contractsLoading,
  } = useContracts();

  const activeContracts = useMemo(
    () => contracts.filter((contract) => contract.status === "active"),
    [contracts],
  );

  const generateMutation = useGenerateCancellation();
  const approveMutation = useApproveCancellation();
  const cancelMutation = useCancelCancellation();
  const markSentMutation = useMarkCancellationSent();

  const { data: emailPreview, isLoading: loadingEmail } =
    useEmailPreview(emailPreviewId);

  const contractMap = useMemo(() => {
    return new Map<number, Contract>(
      contracts.map((contract) => [contract.id, contract]),
    );
  }, [contracts]);

  const filtered = useMemo(() => {
    return cancellations.filter((cancellation) => {
      if (filter === "all") return true;
      return cancellation.status === filter;
    });
  }, [cancellations, filter]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CancellationFormData>({
    resolver: zodResolver(cancellationFormSchema),
    defaultValues: {
      contract_id: 0,
      language: "de",
      customer_name: "",
      customer_number: "",
      customer_address: "",
      customer_email: "",
      provider_email: "",
      provider_address: "",
    },
  });

  const selectedContractId = watch("contract_id");
  const selectedContract =
    selectedContractId > 0 ? contractMap.get(Number(selectedContractId)) : null;

  useEffect(() => {
    if (!selectedContract) {
      setValue("provider_email", "", { shouldValidate: true });
      return;
    }

    setValue("provider_email", selectedContract.provider_email ?? "", {
      shouldValidate: true,
      shouldDirty: false,
    });
  }, [selectedContract, setValue]);

  const openGenerateModal = () => {
    setGenerateOpen(true);
    setStep("form");
    setActiveCancellation(null);
    setEmailPreviewId(0);
    reset({
      contract_id: 0,
      language: "de",
      customer_name: "",
      customer_number: "",
      customer_address: "",
      customer_email: "",
      provider_email: "",
      provider_address: "",
    });
  };

  const openPreviewForExisting = (cancellation: Cancellation) => {
    setActiveCancellation(cancellation);
    setEmailPreviewId(0);
    setStep("preview");
    setGenerateOpen(true);
  };

  const openEmailPreviewForExisting = (cancellation: Cancellation) => {
    setActiveCancellation(cancellation);
    setEmailPreviewId(cancellation.id);
    setStep("email");
    setGenerateOpen(true);
  };

  const onGenerate = async (data: CancellationFormData) => {
    const result = await generateMutation.mutateAsync({
      contractId: data.contract_id,
      data: {
        language: data.language,
        customer_name: data.customer_name,
        customer_number: data.customer_number || null,
        customer_address: data.customer_address,
        customer_email: data.customer_email,
        provider_email: data.provider_email,
        provider_address: data.provider_address || null,
      },
    });

    setActiveCancellation(result);
    setEmailPreviewId(0);
    setStep("preview");
  };

  const onApprove = async () => {
    if (!activeCancellation) return;

    const result = await approveMutation.mutateAsync(activeCancellation.id);
    setActiveCancellation(result);
    setEmailPreviewId(result.id);
    setStep("email");
  };

  const onMarkSent = async () => {
    if (!activeCancellation) return;

    await markSentMutation.mutateAsync(activeCancellation.id);
    setGenerateOpen(false);
    setActiveCancellation(null);
    setEmailPreviewId(0);
    reset();
  };

  const onCancel = async () => {
    if (activeCancellation) {
      await cancelMutation.mutateAsync(activeCancellation.id);
    }

    setGenerateOpen(false);
    setActiveCancellation(null);
    setEmailPreviewId(0);
    reset();
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const emailTo = emailPreview?.to ?? activeCancellation?.provider_email ?? "";
  const emailSubject =
    emailPreview?.subject ?? activeCancellation?.subject ?? "";
  const emailBody =
    emailPreview?.body ?? activeCancellation?.final_message ?? "";
  const mailtoLink =
    emailPreview?.mailto_link ??
    `mailto:${encodeURIComponent(emailTo)}?subject=${encodeURIComponent(
      emailSubject,
    )}&body=${encodeURIComponent(emailBody)}`;

  const openEmailApp = () => {
    window.location.href = mailtoLink;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-bold">
            Cancellations
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your AI-generated cancellation requests.
          </p>
        </div>

        <Button variant="hero" size="sm" onClick={openGenerateModal}>
          <BrainCircuit className="h-4 w-4" />
          Generate Cancellation
        </Button>
      </div>

      <div className="flex gap-2">
        {["all", "draft", "approved", "sent", "cancelled"].map((value) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load cancellations.
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border/50 bg-card p-10 text-center shadow-card">
          <h2 className="text-lg font-semibold">No cancellations found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Generate your first cancellation request to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((cancellation) => {
            const relatedContract = contractMap.get(cancellation.contract_id);

            return (
              <div
                key={cancellation.id}
                className="rounded-2xl border border-border/50 bg-card p-5 shadow-card transition-all hover:shadow-card-hover"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-card-purple">
                      <FileText className="h-5 w-5 text-chart-4" />
                    </div>

                    <div>
                      <div className="font-[var(--font-display)] font-semibold">
                        {relatedContract?.title ??
                          `Contract #${cancellation.contract_id}`}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{cancellation.provider_name ?? "-"}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {formatLanguage(cancellation.language)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden text-right sm:block">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(cancellation.created_at)}
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        statusColors[cancellation.status]
                      }`}
                    >
                      {cancellation.status}
                    </span>

                    <div className="flex gap-1">
                      {cancellation.status === "draft" && (
                        <>
                          <button
                            onClick={() => openPreviewForExisting(cancellation)}
                            className="cursor-pointer rounded-lg p-1.5 hover:bg-muted"
                          >
                            <Edit className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>

                          <button
                            onClick={async () => {
                              const result = await approveMutation.mutateAsync(
                                cancellation.id,
                              );
                              setActiveCancellation(result);
                              setEmailPreviewId(result.id);
                              setStep("email");
                              setGenerateOpen(true);
                            }}
                            className="cursor-pointer rounded-lg p-1.5 hover:bg-muted"
                          >
                            <Check className="h-3.5 w-3.5 text-success" />
                          </button>
                        </>
                      )}

                      {cancellation.status === "approved" && (
                        <button
                          onClick={() =>
                            openEmailPreviewForExisting(cancellation)
                          }
                          className="cursor-pointer rounded-lg p-1.5 hover:bg-muted"
                        >
                          <Mail className="h-3.5 w-3.5 text-primary" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-2xl">
          {step === "form" && (
            <>
              <div className="border-b border-border bg-gradient-card-purple p-6">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 font-[var(--font-display)]">
                    <BrainCircuit className="h-5 w-5 text-chart-4" />
                    Generate Cancellation Draft
                  </DialogTitle>
                </DialogHeader>
              </div>

              <form
                onSubmit={handleSubmit(onGenerate)}
                className="space-y-4 p-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label className="text-xs">Contract</Label>
                    <select
                      {...register("contract_id")}
                      className="h-9 w-full rounded-xl border border-input bg-background px-3 text-sm"
                      disabled={contractsLoading}
                    >
                      <option value={0}>Select a contract</option>
                      {activeContracts.map((contract) => (
                        <option key={contract.id} value={contract.id}>
                          {contract.title} — {contract.provider_name}
                        </option>
                      ))}
                    </select>
                    {errors.contract_id && (
                      <p className="text-xs text-destructive">
                        {errors.contract_id.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Language</Label>
                    <select
                      {...register("language")}
                      className="h-9 w-full rounded-xl border border-input bg-background px-3 text-sm"
                    >
                      <option value="de">German</option>
                      <option value="en">English</option>
                    </select>
                    {errors.language && (
                      <p className="text-xs text-destructive">
                        {errors.language.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Provider</Label>
                    <Input
                      value={selectedContract?.provider_name ?? ""}
                      readOnly
                      className="h-9 rounded-xl bg-muted/30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Your Name</Label>
                    <Input
                      {...register("customer_name")}
                      placeholder="Ilyas Sülen"
                      className="h-9 rounded-xl"
                    />
                    {errors.customer_name && (
                      <p className="text-xs text-destructive">
                        {errors.customer_name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Customer Number</Label>
                    <Input
                      {...register("customer_number")}
                      placeholder="CUS-12345"
                      className="h-9 rounded-xl"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label className="text-xs">Your Address</Label>
                    <Input
                      {...register("customer_address")}
                      placeholder="Street, ZIP code, City"
                      className="h-9 rounded-xl"
                    />
                    {errors.customer_address && (
                      <p className="text-xs text-destructive">
                        {errors.customer_address.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Your Email</Label>
                    <Input
                      {...register("customer_email")}
                      placeholder="you@example.com"
                      className="h-9 rounded-xl"
                    />
                    {errors.customer_email && (
                      <p className="text-xs text-destructive">
                        {errors.customer_email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Provider Email</Label>
                    <Input
                      {...register("provider_email")}
                      placeholder="support@example.com"
                      className="h-9 rounded-xl"
                    />
                    {errors.provider_email && (
                      <p className="text-xs text-destructive">
                        {errors.provider_email.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label className="text-xs">
                      Provider Address (optional)
                    </Label>
                    <Input
                      {...register("provider_address")}
                      placeholder="Provider street, ZIP code, City"
                      className="h-9 rounded-xl"
                    />
                  </div>
                </div>

                {activeContracts.length === 0 && (
                  <div className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
                    No active contracts available. Create an active contract
                    first.
                  </div>
                )}

                {generateMutation.error && (
                  <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                    {generateMutation.error.message}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={
                    generateMutation.isPending || activeContracts.length === 0
                  }
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <BrainCircuit className="h-4 w-4" />
                  )}
                  {generateMutation.isPending
                    ? "Generating..."
                    : "Generate Draft"}
                </Button>
              </form>
            </>
          )}

          {step === "preview" && activeCancellation && (
            <>
              <div className="border-b border-border bg-gradient-card-blue p-6">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 font-[var(--font-display)]">
                    <FileText className="h-5 w-5 text-primary" />
                    Review Cancellation Draft
                  </DialogTitle>
                </DialogHeader>
              </div>

              <div className="grid divide-y divide-border lg:grid-cols-2 lg:divide-x lg:divide-y-0">
                <div className="space-y-3 p-5">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                    Details
                  </h4>

                  {[
                    [
                      "Contract",
                      contractMap.get(activeCancellation.contract_id)?.title ??
                        "-",
                    ],
                    ["Provider", activeCancellation.provider_name ?? "-"],
                    ["Language", formatLanguage(activeCancellation.language)],
                    ["Customer", activeCancellation.customer_name ?? "-"],
                    ["Number", activeCancellation.customer_number ?? "-"],
                    ["Email", activeCancellation.customer_email ?? "-"],
                    ["Provider Email", activeCancellation.provider_email ?? "-"],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 p-5">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground">
                    Generated Draft
                  </h4>

                  <div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                    <p className="mb-2 font-semibold">
                      Subject: {activeCancellation.subject}
                    </p>

                    <div className="mb-4">
                      <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                        Neutral AI-generated message
                      </p>
                      <p>{activeCancellation.generated_message}</p>
                    </div>

                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                        Final composed letter
                      </p>
                      <p>{activeCancellation.final_message}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 border-t border-border p-5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                      if (!activeCancellation) return;

                      reset({
                        contract_id: activeCancellation.contract_id,
                        language: activeCancellation.language as "de" | "en",
                        customer_name: activeCancellation.customer_name ?? "",
                        customer_number: activeCancellation.customer_number ?? "",
                        customer_address: activeCancellation.customer_address ?? "",
                        customer_email: activeCancellation.customer_email ?? "",
                        provider_email: activeCancellation.provider_email ?? "",
                        provider_address: activeCancellation.provider_address ?? "",
                      });

                      setEmailPreviewId(0);
                      setStep("form");
                  }}
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>

                <Button
                  variant="hero"
                  size="sm"
                  className="flex-1"
                  onClick={onApprove}
                  disabled={approveMutation.isPending}
                >
                  {approveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Approve
                </Button>

                <Button variant="ghost" size="sm" onClick={onCancel}>
                  <XCircle className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </>
          )}

          {step === "email" && activeCancellation && (
            <>
              <div className="border-b border-border bg-gradient-card-green p-6">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 font-[var(--font-display)]">
                    <Mail className="h-5 w-5 text-success" />
                    Send-Ready Email
                  </DialogTitle>
                </DialogHeader>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your cancellation is approved and ready to send.
                </p>
              </div>

              <div className="space-y-4 p-6">
                {loadingEmail ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="w-12 text-muted-foreground">To:</span>
                      <span className="font-medium">{emailTo}</span>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <span className="w-12 text-muted-foreground">
                        Subject:
                      </span>
                      <span className="font-medium">{emailSubject}</span>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-muted/30 p-4 text-sm leading-relaxed whitespace-pre-wrap">
                      {emailBody}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="coral"
                    className="w-full"
                    onClick={openEmailApp}
                    disabled={!emailTo || !emailSubject || !emailBody}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Email App
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => copyToClipboard(emailSubject)}
                  >
                    <Copy className="h-4 w-4" />
                    Copy Subject
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => copyToClipboard(emailBody)}
                  >
                    <Copy className="h-4 w-4" />
                    Copy Body
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={onMarkSent}
                    disabled={markSentMutation.isPending}
                  >
                    {markSentMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Mark as Sent
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

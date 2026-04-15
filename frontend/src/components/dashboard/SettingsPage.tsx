import {
  User,
  Bell,
  Globe,
  Shield,
  BrainCircuit,
  Mail,
  Database,
  Trash2,
  Download,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const sections = [
  {
    icon: User,
    title: "Profile",
    content: (
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-xs">Full Name</Label>
          <Input
            placeholder="John Doe"
            className="h-9 rounded-xl"
            defaultValue="John Doe"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Email</Label>
          <Input
            placeholder="john@example.com"
            className="h-9 rounded-xl"
            defaultValue="john@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Address</Label>
          <Input
            placeholder="123 Main St"
            className="h-9 rounded-xl"
            defaultValue="123 Main St, Berlin"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Phone</Label>
          <Input
            placeholder="+49 123 456 7890"
            className="h-9 rounded-xl"
          />
        </div>
      </div>
    ),
  },
  {
    icon: Bell,
    title: "Notification Preferences",
    content: (
      <div className="space-y-4">
        {[
          [
            "Email notifications",
            "Receive renewal and deadline reminders via email.",
            true,
          ],
          [
            "Push notifications",
            "Browser push notifications for urgent deadlines.",
            false,
          ],
          [
            "Weekly digest",
            "Get a weekly summary of your subscription status.",
            true,
          ],
        ].map(([title, description, defaultChecked]) => (
          <div
            key={title as string}
            className="flex items-center justify-between"
          >
            <div>
              <div className="text-sm font-medium">{title as string}</div>
              <div className="text-xs text-muted-foreground">
                {description as string}
              </div>
            </div>
            <Switch defaultChecked={defaultChecked as boolean} />
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Globe,
    title: "Language Preferences",
    content: (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs">Default Language</Label>
          <select className="h-9 w-full max-w-xs rounded-xl border border-input bg-background px-3 text-sm">
            <option>English</option>
            <option>German</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs">Default Cancellation Language</Label>
          <select className="h-9 w-full max-w-xs rounded-xl border border-input bg-background px-3 text-sm">
            <option>Same as interface</option>
            <option>English</option>
            <option>German</option>
          </select>
        </div>
      </div>
    ),
  },
  {
    icon: Shield,
    title: "Privacy & Security",
    content: (
      <div className="space-y-4">
        {[
          [
            "Two-factor authentication",
            "Add an extra layer of security to your account.",
            false,
          ],
          [
            "Anonymous analytics sharing",
            "Help improve SubPilot with anonymous product usage data.",
            true,
          ],
        ].map(([title, description, defaultChecked]) => (
          <div
            key={title as string}
            className="flex items-center justify-between"
          >
            <div>
              <div className="text-sm font-medium">{title as string}</div>
              <div className="text-xs text-muted-foreground">
                {description as string}
              </div>
            </div>
            <Switch defaultChecked={defaultChecked as boolean} />
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: BrainCircuit,
    title: "AI Settings",
    content: (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs">AI Generation Mode</Label>
          <select className="h-9 w-full max-w-xs rounded-xl border border-input bg-background px-3 text-sm">
            <option>Standard (faster)</option>
            <option>Enhanced (more detailed)</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium">Auto-generate reminders</div>
            <div className="text-xs text-muted-foreground">
              Automatically create reminders when adding contracts.
            </div>
          </div>
          <Switch defaultChecked />
        </div>
      </div>
    ),
  },
  {
    icon: Mail,
    title: "Future Integrations",
    content: (
      <div className="space-y-4">
        {[
          {
            name: "Gmail",
            description: "Auto-detect subscriptions from your inbox.",
            status: "Coming Soon",
          },
          {
            name: "Outlook",
            description: "Connect your Microsoft email for scanning.",
            status: "Coming Soon",
          },
          {
            name: "Apple Mail",
            description: "Import subscription data from Apple Mail.",
            status: "Planned",
          },
        ].map((integration) => (
          <div
            key={integration.name}
            className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/40 p-3"
          >
            <div>
              <div className="text-sm font-medium">{integration.name}</div>
              <div className="text-xs text-muted-foreground">
                {integration.description}
              </div>
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              {integration.status}
            </span>
          </div>
        ))}
      </div>
    ),
  },
];

export function SettingsPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-[var(--font-display)] text-2xl font-bold">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, preferences, and integrations.
        </p>
      </div>

      {sections.map((section) => (
        <div
          key={section.title}
          className="rounded-2xl border border-border/50 bg-card p-6 shadow-card"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <section.icon className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-[var(--font-display)] font-bold">
              {section.title}
            </h2>
          </div>

          {section.content}
        </div>
      ))}

      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-card">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Database className="h-5 w-5 text-primary" />
          </div>
          <h2 className="font-[var(--font-display)] font-bold">
            Data Management
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Export All Data
          </Button>

          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4" />
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}

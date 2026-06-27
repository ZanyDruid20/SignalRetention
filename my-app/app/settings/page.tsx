"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import {
  BellDot,
  Check,
  Monitor,
  Moon,
  Palette,
  Save,
  Sun,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/components/Theme/theme-provider";

type ThemeOption = "light" | "dark" | "system";

type NotificationKey =
  | "criticalRiskAlerts"
  | "datasetProcessingUpdates"
  | "predictionCompletionUpdates"
  | "weeklySummary";

const themeOptions: {
  value: ThemeOption;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  {
    value: "light",
    label: "Light",
    description: "Bright workspace",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Low-light mode",
    icon: Moon,
  },
  {
    value: "system",
    label: "System",
    description: "Match device",
    icon: Monitor,
  },
];

const notificationOptions: {
  key: NotificationKey;
  label: string;
  description: string;
}[] = [
  {
    key: "criticalRiskAlerts",
    label: "Critical risk alerts",
    description: "Highlight future high-risk customer events inside the app.",
  },
  {
    key: "datasetProcessingUpdates",
    label: "Dataset processing updates",
    description: "Track future dataset import and processing status changes.",
  },
  {
    key: "predictionCompletionUpdates",
    label: "Prediction completion updates",
    description: "Show when future churn prediction jobs finish processing.",
  },
  {
    key: "weeklySummary",
    label: "Weekly summary",
    description: "Prepare a weekly in-app overview of retention activity.",
  },
];

function PreferenceToggle({
  checked,
  label,
  onCheckedChange,
}: {
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center">
      <span className="sr-only">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        className="h-7 w-12 rounded-full bg-[#E7DED1] transition peer-checked:bg-[#5A3B26]"
        aria-hidden="true"
      />
      <span
        className="absolute left-1 size-5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-5"
        aria-hidden="true"
      />
    </label>
  );
}

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState({
    fullName: "Maya Chen",
    email: "maya@signalretention.com",
    company: "SignalRetention",
    role: "admin",
  });

  const [notifications, setNotifications] = useState<
    Record<NotificationKey, boolean>
  >({
    criticalRiskAlerts: true,
    datasetProcessingUpdates: true,
    predictionCompletionUpdates: false,
    weeklySummary: true,
  });

  function updateProfile(field: keyof typeof profile, value: string) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateNotification(key: NotificationKey, checked: boolean) {
    setNotifications((current) => ({
      ...current,
      [key]: checked,
    }));
  }

  return (
    <div className="min-h-screen bg-[#FCFAF7] dark:bg-background">
      <header className="border-b border-[#E7DED1] bg-[#FCFAF7] px-6 py-8 dark:border-border dark:bg-background md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#A53D13]">
            SignalRetention
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#2F2118] dark:text-foreground md:text-4xl">
            Settings
          </h1>
          <p className="mt-2 max-w-2xl text-base text-muted-foreground md:text-lg">
            Manage your profile, preferences, and application appearance.
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:px-12 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-xl border-[#E7DED1] bg-white shadow-none dark:border-border dark:bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#F5ECE4] dark:bg-muted">
                <UserRound className="size-5 text-[#5A3B26]" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">
                  Profile Settings
                </CardTitle>
                <CardDescription>
                  Keep your workspace identity up to date.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#2F2118] dark:text-foreground">
                  Full Name
                </label>
                <Input
                  value={profile.fullName}
                  onChange={(event) =>
                    updateProfile("fullName", event.target.value)
                  }
                  className="h-12 rounded-xl border-[#E7DED1] bg-[#FCFAF7] dark:border-border dark:bg-input/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#2F2118] dark:text-foreground">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(event) =>
                    updateProfile("email", event.target.value)
                  }
                  className="h-12 rounded-xl border-[#E7DED1] bg-[#FCFAF7] dark:border-border dark:bg-input/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#2F2118] dark:text-foreground">
                  Company Name
                </label>
                <Input
                  value={profile.company}
                  onChange={(event) =>
                    updateProfile("company", event.target.value)
                  }
                  className="h-12 rounded-xl border-[#E7DED1] bg-[#FCFAF7] dark:border-border dark:bg-input/30"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#2F2118] dark:text-foreground">
                  Role
                </label>
                <Select
                  value={profile.role}
                  onValueChange={(value) => updateProfile("role", value)}
                >
                  <SelectTrigger className="h-12 w-full rounded-xl border-[#E7DED1] bg-[#FCFAF7] dark:border-border dark:bg-input/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Customer Success Manager</SelectItem>
                    <SelectItem value="analyst">Retention Analyst</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button className="h-11 rounded-xl bg-[#5A3B26] px-5 hover:bg-[#4A2F1E]">
              <Save className="size-4" />
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-[#E7DED1] bg-white shadow-none dark:border-border dark:bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#FCEEE8] dark:bg-destructive/20">
                <BellDot className="size-5 text-[#A53D13]" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure future in-app event preferences.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <p className="rounded-xl border border-[#E7DED1] bg-[#FCFAF7] p-4 text-sm leading-6 text-muted-foreground dark:border-border dark:bg-muted/40">
              These are application preference settings for future backend
              events. They do not send messages or connect to notification
              infrastructure in this MVP.
            </p>

            <div className="space-y-4">
              {notificationOptions.map((option) => (
                <div
                  key={option.key}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[#E7DED1] bg-[#FCFAF7] p-4 dark:border-border dark:bg-muted/40"
                >
                  <div>
                    <p className="font-semibold text-[#2F2118] dark:text-foreground">
                      {option.label}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                  <PreferenceToggle
                    checked={notifications[option.key]}
                    label={option.label}
                    onCheckedChange={(checked) =>
                      updateNotification(option.key, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-[#E7DED1] bg-white shadow-none dark:border-border dark:bg-card lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#F5ECE4] dark:bg-muted">
                <Palette className="size-5 text-[#5A3B26]" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Appearance</CardTitle>
                <CardDescription>
                  Choose how SignalRetention looks on this device.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const selected = theme === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    className={`rounded-xl border p-5 text-left transition ${
                      selected
                        ? "border-[#5A3B26] bg-[#F5ECE4] dark:border-primary dark:bg-muted"
                        : "border-[#E7DED1] bg-[#FCFAF7] hover:bg-[#F8F4EE] dark:border-border dark:bg-muted/40 dark:hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex size-11 items-center justify-center rounded-xl bg-white dark:bg-background">
                        <Icon className="size-5 text-[#5A3B26]" />
                      </div>
                      {selected && (
                        <span className="flex size-7 items-center justify-center rounded-full bg-[#5A3B26]">
                          <Check className="size-4 text-white" />
                        </span>
                      )}
                    </div>
                    <p className="mt-4 text-base font-bold text-[#2F2118] dark:text-foreground">
                      {option.label}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <Button className="h-11 rounded-xl bg-[#5A3B26] px-5 hover:bg-[#4A2F1E]">
              <Save className="size-4" />
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

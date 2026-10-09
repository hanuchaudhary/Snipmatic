import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { motion } from "motion/react";

import type { AdminModel } from "@snipmatic/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminApi } from "@/lib/api/admin";
import { cn } from "@/lib/utils";

const tabs = [
  { key: "USERS", label: "Users" },
  { key: "PROJECTS", label: "Projects" },
] as const;

type Tab = (typeof tabs)[number]["key"];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const planLabel: Record<string, string> = {
  STARTER: "Starter",
  INFLUENCER: "Influencer",
  STUDIO: "Studio",
};

const statusVariant = (status: string) => {
  if (status === "COMPLETED") return "secondary" as const;
  if (status === "FAILED") return "destructive" as const;
  return "outline" as const;
};

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescriptionLabel>{label}</CardDescriptionLabel>
        <CardTitle className="font-jost text-2xl">{value}</CardTitle>
      </CardHeader>
      {hint ? (
        <CardContent>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}

function CardDescriptionLabel({ children }: { children: string }) {
  return (
    <p className="text-xs text-muted-foreground font-jost">{children}</p>
  );
}

function BreakdownList({
  title,
  items,
}: {
  title: string;
  items: { label: string; count: number }[];
}) {
  const max = Math.max(1, ...items.map((item) => item.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground">No data yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>{item.label}</span>
                <span className="text-muted-foreground">
                  {formatNumber(item.count)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function AdminPage() {
  const [overview, setOverview] = useState<AdminModel["overviewResponse"] | null>(
    null
  );
  const [users, setUsers] = useState<AdminModel["usersResponse"] | null>(null);
  const [projects, setProjects] = useState<AdminModel["projectsResponse"] | null>(null);
  const [tab, setTab] = useState<Tab>("USERS");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPage(1);
      setQuery(search.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let mounted = true;
    setLoadingOverview(true);
    AdminApi.overview()
      .then((data) => {
        if (mounted) setOverview(data);
      })
      .catch(() => {
        toast.error("Could not load admin stats.");
      })
      .finally(() => {
        if (mounted) setLoadingOverview(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    setLoadingList(true);

    const params = { page, limit: 20, q: query || undefined };

    const request =
      tab === "USERS" ? AdminApi.users(params) : AdminApi.projects(params);

    request
      .then((data) => {
        if (!mounted) return;
        if (tab === "USERS") {
          setUsers(data as AdminModel["usersResponse"]);
        } else {
          setProjects(data as AdminModel["projectsResponse"]);
        }
      })
      .catch(() => {
        toast.error("Could not load admin records.");
      })
      .finally(() => {
        if (mounted) setLoadingList(false);
      });

    return () => {
      mounted = false;
    };
  }, [tab, page, query]);

  const maxActivity = useMemo(() => {
    if (!overview) return 1;
    return Math.max(
      1,
      ...overview.activity.map((day) => Math.max(day.projects, day.users))
    );
  }, [overview]);

  const listTotal = tab === "USERS" ? users?.total ?? 0 : projects?.total ?? 0;
  const listLimit = tab === "USERS" ? users?.limit ?? 20 : projects?.limit ?? 20;
  const pageCount = Math.max(1, Math.ceil(listTotal / listLimit));

  return (
    <div className="w-full px-8 pt-20 pb-16">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="font-jost text-2xl">Admin</h1>
          <p className="text-sm text-muted-foreground">
            Platform data and statistics. Read only.
          </p>
        </div>
      </div>

      {loadingOverview || !overview ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Users"
            value={formatNumber(overview.users.total)}
            hint={`${formatNumber(overview.users.last7d)} in 7d · ${formatNumber(overview.users.last30d)} in 30d`}
          />
          <StatCard
            label="Projects"
            value={formatNumber(overview.projects.total)}
            hint={`${formatNumber(overview.projects.processing)} processing`}
          />
          <StatCard
            label="Credits held"
            value={formatNumber(overview.billing.creditsInCirculation)}
            hint={`${formatNumber(overview.billing.creditsUsed)} used`}
          />
          <StatCard
            label="Completed"
            value={formatNumber(overview.projects.completed)}
            hint={`${formatNumber(overview.projects.failed)} failed`}
          />
        </div>
      )}

      {overview ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Activity · last 14 days</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1.5 h-28">
              {overview.activity.map((day) => (
                <div
                  key={day.date}
                  className="flex-1 flex items-end gap-0.5 h-full"
                  title={`${day.date}: ${day.projects} projects, ${day.users} users`}
                >
                  <div
                    className="flex-1 rounded-t-sm bg-primary/80"
                    style={{
                      height: `${(day.projects / maxActivity) * 100}%`,
                      minHeight: day.projects > 0 ? 4 : 0,
                    }}
                  />
                  <div
                    className="flex-1 rounded-t-sm bg-muted-foreground/30"
                    style={{
                      height: `${(day.users / maxActivity) * 100}%`,
                      minHeight: day.users > 0 ? 4 : 0,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary/80" />
                Projects
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-muted-foreground/30" />
                New users
              </span>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {overview ? (
        <div className="grid md:grid-cols-3 gap-3 mb-8">
          <BreakdownList
            title="Plans"
            items={overview.billing.byPlan.map((item) => ({
              label: planLabel[item.planTier] ?? item.planTier,
              count: item.count,
            }))}
          />
          <BreakdownList
            title="Sources"
            items={overview.projects.bySource.map((item) => ({
              label: item.source === "YOUTUBE" ? "YouTube" : "Upload",
              count: item.count,
            }))}
          />
          <BreakdownList
            title="Project status"
            items={overview.projects.byStatus.map((item) => ({
              label: item.status.toLowerCase().replaceAll("_", " "),
              count: item.count,
            }))}
          />
        </div>
      ) : null}

      <div className="flex items-center justify-between mb-3 gap-3">
        <div
          className={cn(
            "relative flex md:h-11 h-10 rounded-full bg-secondary p-1 font-jost ring-1 ring-border"
          )}
        >
          {tabs.map(({ key, label }) => {
            const isActive = tab === key;
            return (
              <button
                type="button"
                key={key}
                className="relative rounded-full cursor-pointer"
                onClick={() => {
                  setTab(key);
                  setPage(1);
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeAdminTab"
                    className="absolute inset-0 rounded-full bg-primary shadow-[inset_0_0_3px_rgba(255,255,255,1)]"
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <span
                  className={cn(
                    "relative m-auto md:px-4 px-2 md:text-sm text-xs",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>
        <span className="text-sm text-muted-foreground">
          {formatNumber(listTotal)} {tab === "USERS" ? "users" : "projects"}
        </span>
      </div>

      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder={
          tab === "USERS"
            ? "Search name or email"
            : "Search title, name, or email"
        }
        className="mb-4 h-9"
      />

      {loadingList ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : tab === "USERS" ? (
        <div className="space-y-2">
          {users?.users.length ? (
            users.users.map((user) => (
              <Card key={user.id} size="sm">
                <CardContent className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline">{user.role}</Badge>
                    <Badge variant="secondary">
                      {planLabel[user.planTier ?? ""] ?? "No plan"}
                    </Badge>
                    <span className="text-xs text-muted-foreground hidden md:inline">
                      {user.projectCount} projects · {formatNumber(user.creditsBalance)}{" "}
                      credits
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-12">
              No users found.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {projects?.projects.length ? (
            projects.projects.map((project) => (
              <Card key={project.id} size="sm">
                <CardContent className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {project.title || "Untitled project"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {project.user.name} · {project.user.email} · {formatDate(project.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={statusVariant(project.status)}>
                      {project.status.toLowerCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground hidden md:inline">
                      {project.source === "YOUTUBE" ? "YouTube" : "Upload"} ·{" "}
                      {formatNumber(project.clipCount)} clips
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-12">
              No projects found.
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full"
          disabled={page <= 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
        >
          Previous
        </Button>
        <span className="text-xs text-muted-foreground">
          Page {page} of {pageCount}
        </span>
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full"
          disabled={page >= pageCount}
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

import { SiteShell } from "@/components/site/SiteShell";
import { StatusBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, formatMoney, initials } from "@/lib/format";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowRight,
  Check,
  CreditCard,
  Loader2,
  LogOut,
  Package,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const orders = useQuery(api.orders.listMine);
  const payments = useQuery(api.payments.listMine);
  const updateProfile = useMutation(api.profile.updateProfile);

  const [name, setName] = useState(user?.name ?? "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user?.name]);

  const spent = (orders ?? [])
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({ name });
      toast.success("Profile updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update your profile",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <SiteShell>
      <div className="mx-auto w-full max-w-4xl px-5 pt-12 sm:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Account
        </p>
        <h1 className="mt-3 font-display text-4xl tracking-tight sm:text-[2.75rem]">
          Profile
        </h1>

        {/* Identity */}
        <div className="mt-8 overflow-hidden rounded-[1.75rem] border hairline bg-card shadow-soft">
          <div className="relative h-24 bg-sand">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_120%,rgba(32,56,47,0.22),transparent_55%)]" />
          </div>
          <div className="px-6 pb-6">
            <div className="-mt-9 flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-end gap-4">
                <span className="flex size-[72px] items-center justify-center rounded-2xl border-4 border-card bg-primary text-xl font-medium tracking-wide text-primary-foreground">
                  {initials(user?.name ?? user?.email)}
                </span>
                <div className="pb-1">
                  <h2 className="text-lg font-medium leading-tight">
                    {user?.name ?? "Demo customer"}
                  </h2>
                  <p className="mt-0.5 text-[12px] text-muted-foreground">
                    {user?.email ?? "Guest session · add an email on sign-in"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pb-1">
                <StatusBadge
                  status={user?.isAnonymous ? "guest" : "customer"}
                  className="bg-sand text-primary ring-primary/10"
                />
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t hairline pt-5 sm:grid-cols-4">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Orders
                </dt>
                <dd className="mt-1 text-lg font-medium tabular-nums">
                  {orders?.length ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Total value
                </dt>
                <dd className="mt-1 text-lg font-medium tabular-nums">
                  {orders ? formatMoney(spent) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Receipts
                </dt>
                <dd className="mt-1 text-lg font-medium tabular-nums">
                  {payments?.length ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Member since
                </dt>
                <dd className="mt-1 text-lg font-medium tabular-nums">
                  {user?._creationTime
                    ? formatDate(user._creationTime).split(",")[0]
                    : "—"}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Name form */}
          <form
            onSubmit={handleSave}
            className="rounded-2xl border hairline bg-card p-6"
          >
            <div className="flex items-center gap-2.5">
              <UserRound className="size-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Display name</h3>
            </div>
            <p className="mt-2 text-[12px] leading-5 text-muted-foreground">
              Used on your receipts and shipping label.
            </p>
            <div className="mt-4 flex gap-2">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                className="h-10 rounded-xl bg-background text-sm"
              />
              <Button
                type="submit"
                variant="outline"
                disabled={isSaving || !name.trim() || name === user?.name}
                className="h-10 shrink-0 rounded-xl border-foreground/15"
              >
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <>
                    <Check className="mr-1.5 size-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
            {user?.email && (
              <p className="mt-3 text-[11px] text-muted-foreground">
                Signed in as {user.email}
              </p>
            )}
          </form>

          {/* Shortcuts */}
          <div className="rounded-2xl border hairline bg-card p-6">
            <h3 className="text-sm font-medium">Shortcuts</h3>
            <div className="mt-3 divide-y hairline">
              {[
                { to: "/orders", icon: Package, label: "Your orders" },
                { to: "/payments", icon: CreditCard, label: "Payment receipts" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group flex items-center justify-between py-3 text-[13px]"
                >
                  <span className="flex items-center gap-2.5 text-foreground/80 group-hover:text-foreground">
                    <item.icon className="size-4 text-muted-foreground" />
                    {item.label}
                  </span>
                  <ArrowRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="mt-2 w-full justify-start rounded-lg px-2 text-[13px] text-muted-foreground hover:text-destructive"
            >
              <LogOut className="mr-2 size-4" />
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

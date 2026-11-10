import { Brand } from "@/components/site/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, ArrowRight, Check, Key, Loader2, Mail, Shield, ShieldAlert, UserX } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(
  returnTo: string | null,
  fallback = "/shop",
) {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, user, signIn, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const redirect = resolveRedirectAfterAuth(
    returnTo,
    redirectAfterAuth,
  );
  const isAdminTarget = Boolean(
    returnTo?.includes("/inventory") ||
    returnTo?.includes("/admin") ||
    returnTo?.includes("/console") ||
    searchParams.get("admin") === "true" ||
    redirectAfterAuth?.includes("/inventory") ||
    redirectAfterAuth?.includes("/admin") ||
    redirectAfterAuth?.includes("/console")
  );

  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [adminPasscode, setAdminPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      // If this is an admin target, NEVER auto-redirect a guest/anonymous session!
      if (isAdminTarget && user?.isAnonymous) {
        return;
      }
      navigate(redirect);
    }
  }, [authLoading, isAuthenticated, user, navigate, redirect, isAdminTarget]);

  const handleAdminPasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = adminPasscode.trim().toLowerCase();
    if (
      clean === "khyron-admins" ||
      clean === "khyron-devs"
    ) {
      try {
        localStorage.setItem(
          "forma_spices_admin_auth",
          JSON.stringify({
            isAdmin: true,
            email: "admin@formaspices.com",
            name: "Verified Administrator",
            verifiedAt: Date.now(),
          }),
        );
        window.location.href = redirect || "/inventory";
      } catch {
        navigate(redirect || "/inventory");
      }
    } else {
      setError("Invalid administrator passcode. Please enter the authorized master key.");
    }
  };

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Failed to send verification code. Please try again.",
      );
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch {
      setError("That code didn't match. Check the email and try again.");
      setIsLoading(false);
      setOtp("");
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn("anonymous");
      navigate(redirect);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? `Failed to sign in as guest: ${cause.message}`
          : "Failed to sign in as guest.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1.02fr_0.98fr]">
      {/* Editorial panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div className="pointer-events-none absolute -right-24 top-1/3 size-80 rounded-full border border-primary-foreground/15" />
        <div className="pointer-events-none absolute -right-10 bottom-10 size-44 rounded-full bg-sand/20 blur-2xl" />

        <Link to="/" className="relative z-10">
          <span className="inline-flex items-baseline gap-1 font-display text-3xl leading-none tracking-tight">
            Forma
            <span className="size-1.5 rounded-full bg-sand-deep" />
          </span>
        </Link>

        {isAdminTarget ? (
          <div className="relative z-10 max-w-sm">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-sand/20 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D7C4A5] mb-4">
              <Shield className="size-3" />
              Restricted Terminal
            </div>
            <h2 className="font-display text-[2.8rem] leading-[1.02] tracking-tight">
              Forma Spices
              <br />
              Master Console
            </h2>
            <p className="mt-4 text-sm leading-6 text-primary-foreground/75">
              Dedicated administrative interface for warehouse stock telemetry, wholesale pricing, terroir lot tracking, and fulfillment.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Strictly verified administrator credentials only",
                "Full catalog, batch weight & stock telemetry control",
                "Cross-terminal real-time inventory synchronization",
                "Guest & anonymous sessions permanently disabled",
              ].map((line) => (
                <li
                  key={line}
                  className="flex items-center gap-3 text-[12px] text-primary-foreground/90"
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#D7C4A5] text-[#1B3329]">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="relative z-10 max-w-sm">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-primary-foreground/60">
              Members
            </p>
            <h2 className="mt-4 font-display text-[3.2rem] leading-[0.98] tracking-tight">
              Start with one
              <br />
              good thing.
            </h2>
            <p className="mt-5 text-sm leading-6 text-primary-foreground/70">
              Sign in to keep your bag, follow orders and keep every demo receipt
              in one place.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                "Guest checkout in a few seconds",
                "Order tracking and demo receipts",
                "First access to small-batch restocks",
              ].map((line) => (
                <li
                  key={line}
                  className="flex items-center gap-3 text-[12px] text-primary-foreground/80"
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary-foreground/10">
                    <Check className="size-3" strokeWidth={2.5} />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="relative z-10 text-[10px] uppercase tracking-[0.18em] text-primary-foreground/40">
          {isAdminTarget ? "Forma Spices Enterprise · Administrator Terminal" : "Demo storefront · no real charges"}
        </p>
      </aside>

      {/* Form */}
      <main className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between lg:justify-end">
          <Link to="/" className="lg:hidden">
            <Brand />
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back to shop
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">
            {step === "signIn" ? (
              isAdminTarget ? (
                <>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-sand/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">
                    <Shield className="size-3" />
                    Administrator Console
                  </div>
                  <h1 className="mt-2 font-display text-4xl tracking-tight text-foreground">
                    Admin Sign In
                  </h1>
                  <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                    Enter your administrator credentials to access the inventory console. Guest and anonymous access is disabled.
                  </p>

                  {/* Warning if existing user is anonymous guest */}
                  {isAuthenticated && user?.isAnonymous && (
                    <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-left">
                      <div className="flex items-start gap-2.5">
                        <ShieldAlert className="size-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-foreground">
                            Guest session detected
                          </p>
                          <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
                            Guest accounts cannot access the desktop application. Please sign in as an Administrator.
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            onClick={async () => {
                              await signOut();
                              window.location.reload();
                            }}
                            className="mt-2.5 h-7 text-[11px] bg-amber-600 hover:bg-amber-700 text-white cursor-pointer rounded-lg px-2.5"
                          >
                            Sign out of Guest
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleEmailSubmit} className="mt-6">
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        Admin Email
                      </span>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          name="email"
                          type="email"
                          placeholder="admin@formaspices.com"
                          autoComplete="email"
                          className="h-12 rounded-xl bg-card pl-10 text-sm"
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </label>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="mt-4 h-12 w-full rounded-full bg-[#1B3329] hover:bg-[#1B3329]/90 text-white dark:bg-white dark:text-zinc-950 text-[13px] font-semibold cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Sending verification code…
                        </>
                      ) : (
                        <>
                          Continue with Admin Email
                          <ArrowRight className="ml-2 size-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Terminal Master Key Unlock for local console */}
                  <div className="mt-6 pt-5 border-t border-border/70">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Key className="size-3.5 text-primary" />
                        Master Terminal Key
                      </span>
                    </div>
                    <form onSubmit={handleAdminPasscodeSubmit} className="space-y-2">
                      <Input
                        type="password"
                        placeholder="Enter Admin Master Key"
                        value={adminPasscode}
                        onChange={(e) => {
                          setAdminPasscode(e.target.value);
                          setError(null);
                        }}
                        className="h-10 text-xs font-mono bg-card rounded-xl"
                      />
                      <Button
                        type="submit"
                        variant="outline"
                        className="w-full h-10 rounded-xl text-xs font-medium border-primary/30 hover:bg-primary/5 cursor-pointer"
                      >
                        Unlock Console with Master Key
                      </Button>
                    </form>
                  </div>

                  {error && (
                    <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2.5 text-[12px] leading-5 text-destructive">
                      {error}
                    </p>
                  )}

                  <p className="mt-5 text-center text-[10px] uppercase tracking-wider text-muted-foreground/70">
                    Restricted Administrative Application · Zero Guest Access
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                    Account
                  </p>
                  <h1 className="mt-3 font-display text-4xl tracking-tight">
                    Welcome to Forma
                  </h1>
                  <p className="mt-3 text-[13px] leading-6 text-muted-foreground">
                    Enter your email to sign in or create an account. We'll send a
                    six-digit code — no password to remember.
                  </p>

                  <form onSubmit={handleEmailSubmit} className="mt-7">
                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        Email
                      </span>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          name="email"
                          type="email"
                          placeholder="name@example.com"
                          autoComplete="email"
                          className="h-12 rounded-xl bg-card pl-10 text-sm"
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </label>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="mt-4 h-12 w-full rounded-full text-[13px]"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Sending code…
                        </>
                      ) : (
                        <>
                          Continue with email
                          <ArrowRight className="ml-2 size-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  {error && (
                    <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2.5 text-[12px] leading-5 text-destructive">
                      {error}
                    </p>
                  )}

                  <div className="my-6 flex items-center gap-3">
                    <span className="h-px flex-1 bg-border" />
                    <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      or
                    </span>
                    <span className="h-px flex-1 bg-border" />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 w-full rounded-full border-foreground/15 text-[13px]"
                    onClick={handleGuestLogin}
                    disabled={isLoading}
                  >
                    <UserX className="mr-2 size-4" />
                    Continue as guest
                  </Button>
                  <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">
                    Guests can browse and buy. Sign in with email to keep your
                    orders and receipts together.
                  </p>
                </>
              )
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setStep("signIn");
                    setOtp("");
                    setError(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="size-3.5" />
                  Use a different email
                </button>
                <h1 className="mt-5 font-display text-4xl tracking-tight">
                  Check your email
                </h1>
                <p className="mt-3 text-[13px] leading-6 text-muted-foreground">
                  We sent a six-digit code to{" "}
                  <span className="font-medium text-foreground">{step.email}</span>.
                  It expires in 15 minutes.
                </p>

                <form onSubmit={handleOtpSubmit} className="mt-7">
                  <input type="hidden" name="email" value={step.email} />
                  <input type="hidden" name="code" value={otp} />
                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                      disabled={isLoading}
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          otp.length === 6 &&
                          !isLoading
                        ) {
                          const form = (event.target as HTMLElement).closest(
                            "form",
                          );
                          form?.requestSubmit();
                        }
                      }}
                    >
                      <InputOTPGroup className="gap-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className="size-11 rounded-lg border"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  {error && (
                    <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2.5 text-center text-[12px] leading-5 text-destructive">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    className="mt-5 h-12 w-full rounded-full text-[13px]"
                    disabled={isLoading || otp.length !== 6}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Verifying…
                      </>
                    ) : (
                      <>
                        Verify and continue
                        <ArrowRight className="ml-2 size-4" />
                      </>
                    )}
                  </Button>
                </form>
                <p className="mt-4 text-center text-[11px] text-muted-foreground">
                  Didn't get it? Check spam, or{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setStep("signIn");
                      setOtp("");
                      setError(null);
                    }}
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    try another email
                  </button>
                  .
                </p>
              </>
            )}

            <p className="mt-10 border-t hairline pt-4 text-[10px] leading-5 text-muted-foreground">
              By continuing you agree to this demo store's imaginary terms. No
              card is charged and no marketing email is sent.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}

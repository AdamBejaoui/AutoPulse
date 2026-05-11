"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Zap, Mail, Lock, Loader2, AlertCircle, Sun, Moon, Globe, Bell, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";

export default function LoginPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/search");
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Theme Toggle (Absolute Corner) */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-6 right-6 z-50 h-10 w-10 flex items-center justify-center rounded-xl bg-surface border border-border text-muted-foreground hover:text-foreground transition-all shadow-sm"
      >
        {mounted && (theme === "dark" ? <Sun size={18} /> : <Moon size={18} />)}
      </button>

      {/* Left Side: Brand & Info (Hidden on small mobile) */}
      <div className="relative hidden lg:flex flex-1 flex-col justify-between p-12 bg-surface border-r border-border overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-blue">
            <Zap size={20} className="fill-current" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-foreground">
            Auto<span className="text-primary">Pulse</span>
          </span>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-lg">
          <h2 className="text-5xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
            The future of <span className="text-primary">vehicle sourcing</span> is here.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-10">
            AutoPulse monitors Facebook Marketplace across the entire USA in real-time. 
            Stop manually searching and start getting alerted the second a deal hits.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 gap-6">
            {[
              { icon: Globe, title: "Nationwide Coverage", desc: "Scrape all major US cities and regions simultaneously." },
              { icon: Bell, title: "Instant Alerts", desc: "Get email notifications immediately when a match is found." },
              { icon: Sparkles, title: "Smart Matching", desc: "Powerful filters ensure you only see the cars you want." },
            ].map((f, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background border border-border group-hover:border-primary/50 group-hover:text-primary transition-all">
                  <f.icon size={22} />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground text-base mb-1">{f.title}</h4>
                  <p className="text-sm text-muted-foreground leading-snug">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 pt-8 border-t border-border/50 text-sm text-muted-foreground/60 flex justify-between items-center">
          <span>&copy; 2026 AutoPulse Technologies</span>
          <div className="flex gap-4">
            <span>Privately Scoped</span>
            <span>Secure Access</span>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-background relative">
        <div className="w-full max-w-sm">
          {/* Logo (Mobile Only) */}
          <div className="lg:hidden flex flex-col items-center mb-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-blue mb-4">
              <Zap size={26} className="fill-current" />
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Auto<span className="text-primary">Pulse</span>
            </h1>
          </div>

          <div className="space-y-2 mb-8">
            <h3 className="text-2xl font-bold text-foreground">Welcome back</h3>
            <p className="text-muted-foreground">Please enter your credentials to access the platform.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground ml-1" htmlFor="login-email">
                Email Address
              </label>
              <div className="relative group">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  autoComplete="email"
                  className="w-full h-12 pl-11 pr-4 bg-surface border border-border rounded-xl focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-medium text-foreground" htmlFor="login-password">
                  Password
                </label>
              </div>
              <div className="relative group">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full h-12 pl-11 pr-4 bg-surface border border-border rounded-xl focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-sm"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={18} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:bg-primary/90 disabled:opacity-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <Zap size={18} className="fill-current" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              By invitation only. Contact admin for access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

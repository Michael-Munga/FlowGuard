"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Fuel,
  ShieldCheck,
  Radio,
  Lock,
  User as UserIcon,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { loginRequest, setSession } from "@/lib/api";

/** Role → default landing route (matches your ROLES_CONFIG) */
const ROLE_LANDING: Record<string, string> = {
  super_admin: "/operations/network",
  manager: "/operations/network",
  executive: "/executive/overview",
  omc: "/omc/overview",
  kpc_depot_operator: "/depot/overview",
  kpc_engineer: "/engineer/decisions",
  driver: "/driver",
};

/** Demo credentials — change these to match your seeded users. */
const DEMO_ACCOUNTS: { label: string; username: string; password: string }[] = [
  { label: "Super Admin", username: "superadmin", password: "superadmin123" },
  { label: "Manager",     username: "manager",    password: "manager123" },
  { label: "Executive",   username: "executive",  password: "executive123" },
  { label: "OMC",         username: "omc",        password: "omc123" },
  { label: "Depot Op",    username: "operator",   password: "operator123" },
  { label: "Engineer",    username: "engineer",   password: "engineer123" },
  { label: "Driver",      username: "driver",     password: "driver123" },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (u = username, p = password) => {
    setError(null);
    setLoading(true);
    try {
      const data = await loginRequest(u, p);
      setSession(data.access_token, data.user);
      const landing = ROLE_LANDING[data.user.role] ?? "/operations/network";
      router.replace(landing);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login failed");
      setLoading(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submit();
  };

  const useDemo = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    void submit(u, p);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070D15] via-[#0B1420] to-[#0F1B2B] text-white flex flex-col justify-between p-4 sm:p-8">
      {/* Top Bar */}
      <header className="max-w-6xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1B7A3D] text-white flex items-center justify-center shadow-md">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">
                KPC FLOWGUARD
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#1B7A3D]/30 text-[#3DAA63] border border-[#1B7A3D]/50 uppercase">
                SECURE GATEWAY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous Dynamic Route &amp; Demurrage Prevention Control Plane
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#152234] border border-[#243447] text-xs font-mono text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1B7A3D] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1B7A3D]"></span>
          </span>
          <span>Backend Online</span>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl w-full mx-auto my-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left — Brand panel */}
        <section className="lg:col-span-2 space-y-6 flex flex-col justify-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Sign in to your workspace
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            FlowGuard enforces role-bounded operational workspaces. Authenticate
            with your credentials to enter the console for your role.
          </p>
          <ul className="text-xs text-slate-400 space-y-2">
            <li className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              JWT-secured sessions with role-based access
            </li>
            <li className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-500" />
              Live telemetry from 5 connected terminals
            </li>
            <li className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500" />
              All actions written to immutable audit trail
            </li>
          </ul>
        </section>

        {/* Right — Login card */}
        <section className="lg:col-span-3">
          <form
            onSubmit={onSubmit}
            className="p-6 sm:p-8 rounded-xl bg-[#0F1B2B]/90 border border-[#1C2C42] space-y-5"
          >
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">Authentication</h2>
              <p className="text-xs text-slate-400">
                Enter your KPC FlowGuard credentials.
              </p>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-red-950/40 border border-red-900/60 text-xs text-red-300">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Username
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#152234] border border-[#243447] focus-within:border-emerald-500/60">
                <UserIcon className="w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder-slate-600"
                  placeholder="your.username"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Password
              </label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#152234] border border-[#243447] focus-within:border-emerald-500/60">
                <Lock className="w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#1B7A3D] hover:bg-[#229049] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Demo credentials */}
            <div className="pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Demo access
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  ONE-CLICK LOGIN
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.username}
                    type="button"
                    onClick={() => useDemo(acc.username, acc.password)}
                    disabled={loading}
                    className="px-2.5 py-1 rounded bg-[#152234] hover:bg-[#1C2C42] text-slate-200 border border-slate-700 text-[11px] font-medium transition-all disabled:opacity-50"
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>
          </form>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl w-full mx-auto pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Kenya Pipeline Company Limited • Operational Technology Control Sub-System</span>
        </div>
        <span>EPRA Regulatory Baseline • TSA Demurrage Model</span>
      </footer>
    </div>
  );
}
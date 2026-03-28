import { LoginForm } from "@/components/login/login-form";
import { ThreatPulseChart } from "@/components/login/threat-pulse-chart";
import { SiteLogo } from "@/components/common/site-logo";

export default function Home() {
  return (
    <main className="veritrace-shell">
      <section className="veritrace-grid">
        <aside className="brand-panel">
          <span className="spark-star left-[18%] top-[34%]" />
          <span className="spark-star left-[74%] top-[20%] [animation-delay:1.1s]" />
          <span className="spark-star left-[58%] top-[70%] [animation-delay:2.3s]" />
          <span className="spark-star left-[30%] top-[78%] [animation-delay:3.1s]" />

          <div className="fade-slide">
            <p className="text-sm tracking-[0.25em] text-emerald-100/80">ANALYTICS SUITE</p>
            <SiteLogo className="mt-4 h-24 w-auto" width={360} height={120} priority />
            <p className="mt-7 max-w-md text-emerald-50/90">
              Real-time misinformation intelligence for policy, media, and crisis response teams.
            </p>
          </div>

          <div className="fade-slide delay-2 mt-16 max-w-sm rounded-2xl border border-emerald-200/20 bg-black/20 p-5 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-100/75">Live Threat Pulse</p>
            <ThreatPulseChart />
            <p className="mt-2 text-xs text-emerald-50/75">Updated every 30 minutes from verified streams</p>
          </div>
        </aside>

        <section className="auth-panel flex items-center justify-center">
          <div className="w-full max-w-xl space-y-7">
            <div className="fade-slide delay-1">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Admin Portal</p>
              <h2 className="mt-2 font-[var(--font-space-grotesk)] text-4xl font-semibold text-slate-900">
                Secure Login
              </h2>
              <p className="mt-2 max-w-lg text-slate-600">
                Sign in with your VeriTrace admin credentials to access the dashboard.
              </p>
            </div>

            <div className="entry-card fade-slide delay-3 p-6 sm:p-8">
              <LoginForm />
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

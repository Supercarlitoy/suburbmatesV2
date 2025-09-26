import { motion } from "framer-motion";

export default function SuburbMates() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <a href="/" className="text-2xl font-semibold tracking-tight">
            <span className="bg-gradient-to-r from-white via-neutral-200 to-white bg-clip-text text-transparent">
              SuburbMates
            </span>
          </a>
          <nav className="hidden gap-8 md:flex text-sm text-neutral-300">
            <a className="hover:text-white" href="/">
              Home
            </a>
            <a className="hover:text-white" href="/suburbs">
              Suburbs
            </a>
            <a className="hover:text-white" href="/categories">
              Categories
            </a>
            <a className="hover:text-white" href="/pricing">
              Pricing
            </a>
            <a className="hover:text-white" href="/ads">
              Advertise
            </a>
            <a className="hover:text-white" href="/join">
              Join
            </a>
          </nav>
          <a
            href="/auth/sign-in"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-neutral-300 hover:bg-white/5"
          >
            Sign in
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -inset-[20%] rounded-[100%] bg-gradient-to-tr from-indigo-500/20 via-sky-400/10 to-emerald-400/20 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-20 md:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="md:col-span-7"
          >
            <h1 className="text-balance text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
              Find <span className="text-white">verified</span> businesses in
              your suburb
            </h1>
            <p className="mt-4 max-w-xl text-neutral-300">
              ABN-verified listings. Curated by suburb. Built for Melbourne.
            </p>
            <div className="mt-6 flex w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              <input
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-neutral-400"
                placeholder="Search ‘plumber’, ‘cafe’, or a suburb…"
              />
              <button className="rounded-none bg-white/10 px-5 text-sm hover:bg-white/20">
                Search
              </button>
            </div>
            <div className="mt-4 text-xs text-neutral-400">
              Trusted signals: ABN verified • Last checked Sept 2025 • Community
              reviews
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="md:col-span-5"
          >
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_0_1px_#fff_inset]">
              <div className="rounded-2xl bg-neutral-900 p-4">
                <div className="mb-3 flex items-center justify-between text-xs text-neutral-400">
                  <span>Featured suburb</span>
                  <span>Brunswick • 3056</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    "Plumbers",
                    "Cafes",
                    "Electricians",
                    "Physios",
                    "Cleaners",
                    "Barbers",
                  ].map((t) => (
                    <a
                      key={t}
                      href="#"
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center text-xs text-neutral-200 hover:bg-white/10"
                    >
                      {t}
                    </a>
                  ))}
                </div>
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-neutral-300">
                  Tip: Filter by ‘Verified only’ to see ABN-checked businesses
                  first.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Partner ads band */}
      <section className="border-y border-white/10 bg-neutral-900/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4 text-xs text-neutral-400">
          <span>Partners</span>
          <div className="flex flex-1 items-center justify-center gap-4">
            <a
              href="#"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
            >
              Promote your brand
            </a>
            <a
              href="#"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
            >
              Advertise here
            </a>
          </div>
          <a
            href="/ads"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 hover:bg-white/10"
          >
            View plans
          </a>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">
          Browse by category
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-neutral-300">
          Seven core groups tuned for Melbourne.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            "Professional Services",
            "Health & Wellness",
            "Food & Hospitality",
            "Home & Construction",
            "Retail & Shopping",
            "Technology",
            "Personal Services",
            "Trades & Repairs",
          ].map((cat) => (
            <a
              key={cat}
              href={`/category/${encodeURIComponent(cat.toLowerCase())}`}
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:bg-white/10"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-100">
                  {cat}
                </span>
                <span className="translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100">
                  →
                </span>
              </div>
              <div className="mt-3 h-1 w-full rounded bg-gradient-to-r from-white/20 to-transparent" />
            </a>
          ))}
        </div>
      </section>

      {/* Suburb grid */}
      <section className="bg-neutral-900/60">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">
            Explore suburbs
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              "Brunswick",
              "Fitzroy",
              "Carlton",
              "Northcote",
              "Melton",
              "Wyndham",
              "Casey",
              "Hume",
            ].map((s) => (
              <a
                key={s}
                href={`/suburb/${s.toLowerCase()}`}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-100">
                    {s}
                  </span>
                  <span className="text-xs text-neutral-400">VIC</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              h: "ABN verified",
              p: "Badge + last-checked date on cards and profiles",
            },
            {
              h: "Curated density",
              p: "≥ 3 businesses per suburb–category ensures choice",
            },
            {
              h: "Local-first",
              p: "Hubs per suburb with maps, hours, and late-open filters",
            },
          ].map((b) => (
            <div
              key={b.h}
              className="rounded-2xl border border-white/10 bg-white/5 p-5"
            >
              <h3 className="text-sm font-semibold">{b.h}</h3>
              <p className="mt-1 text-sm text-neutral-300">{b.p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lead capture section */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl mb-8">
          Own your presence on SuburbMates
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-600/20 to-emerald-400/10 p-6 hover:border-emerald-400/40"
          >
            <h3 className="text-xl font-semibold text-white">
              Claim your business
            </h3>
            <p className="mt-2 text-sm text-neutral-300">
              If your business is already listed, secure your profile to manage
              details, track interactions, and convert local leads.
            </p>
            <a
              href="/claim"
              className="mt-4 inline-block rounded-lg border border-emerald-400/30 bg-emerald-400/20 px-5 py-2 text-sm font-medium text-emerald-100 hover:bg-emerald-400/30"
            >
              Claim now
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-600/20 to-indigo-400/10 p-6 hover:border-indigo-400/40"
          >
            <h3 className="text-xl font-semibold text-white">
              Register your business
            </h3>
            <p className="mt-2 text-sm text-neutral-300">
              New to SuburbMates? Add your verified details to appear in suburb
              and category hubs, and start receiving quality leads from locals.
            </p>
            <a
              href="/join"
              className="mt-4 inline-block rounded-lg border border-indigo-400/30 bg-indigo-400/20 px-5 py-2 text-sm font-medium text-indigo-100 hover:bg-indigo-400/30"
            >
              Register now
            </a>
          </motion.div>
        </div>
        <p className="mt-8 text-center text-xs text-neutral-400">
          Every profile click, call, or site visit is logged for proof of local
          reach.
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-10 md:flex-row">
          <div className="text-sm text-neutral-400">© 2025 SuburbMates</div>
          <div className="flex gap-6 text-sm text-neutral-300">
            <a href="/page/privacy" className="hover:text-white">
              Privacy
            </a>
            <a href="/page/terms" className="hover:text-white">
              Terms
            </a>
            <a href="/ads" className="hover:text-white">
              Advertise
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { motion } from "framer-motion";

export default function SuburbMatesLeads() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16">
      <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl mb-8">
        Own your presence on SuburbMates
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Claim your business card */}
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

        {/* Register new business card */}
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
  );
}

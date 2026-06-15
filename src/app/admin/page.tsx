import { createAdminClient } from "@/lib/supabase/admin";
import { ModerationList } from "./ModerationList";

export const metadata = { title: "Moderation" };
export const dynamic = "force-dynamic";

type SP = Promise<{ token?: string }>;

export default async function AdminPage({ searchParams }: { searchParams: SP }) {
  const { token } = await searchParams;
  const authed = !!token && token === process.env.ADMIN_TOKEN;

  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-4 py-20">
        <h1 className="text-xl font-bold">Moderation</h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Add <code>?token=…</code> to the URL to access the queue. (MVP gate — replace with real
          auth + admin roles in phase 2.)
        </p>
      </div>
    );
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("submissions")
    .select("id, created_at, payload")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">Moderation queue</h1>
      <p className="mb-6 text-[var(--color-muted)]">
        {(data ?? []).length} pending submission{(data ?? []).length === 1 ? "" : "s"}.
      </p>
      <ModerationList submissions={data ?? []} token={token!} />
    </div>
  );
}

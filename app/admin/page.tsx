import { AdminClient } from "./AdminClient";
import { PageShell } from "@/components/PageShell";
import { currentAdmin } from "@/lib/auth";
import { getListings, getOrders, getSiteContent } from "@/lib/store";

export default async function AdminPage() {
  const [adminName, listings, content] = await Promise.all([
    currentAdmin(),
    getListings(),
    getSiteContent(),
  ]);
  // Orders contain buyer details — only ship them to the browser for a
  // logged-in admin session.
  const orders = adminName ? await getOrders() : [];

  return (
    <PageShell>
      <section className="bg-cream py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <AdminClient
            initialListings={listings}
            initialContent={content}
            initialOrders={orders}
            adminName={adminName}
          />
        </div>
      </section>
    </PageShell>
  );
}

import { getPrisma } from "@ghom/db";
import { requireAdmin } from "@/auth/guard";
import { MobileNav } from "@/components/mobile-nav";
import { Sidebar } from "@/components/sidebar";
import { PUBLIC_URLS } from "@/lib/env";

// Pages privées et toujours à jour : jamais de rendu statique.
export const dynamic = "force-dynamic";

async function unreadCount() {
  try {
    return await getPrisma().contactMessage.count({ where: { readAt: null, handled: false } });
  } catch {
    return 0;
  }
}

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const unread = await unreadCount();
  return (
    <div className="flex min-h-dvh">
      <Sidebar
        unread={unread}
        sites={[
          { label: "ghom.fr", href: PUBLIC_URLS.HUB },
          { label: "Studio", href: PUBLIC_URLS.STUDIO },
        ]}
      />
      <div className="min-w-0 flex-1">
        <MobileNav />
        <main className="mx-auto max-w-6xl px-4 py-8 md:px-10 md:py-10">{children}</main>
      </div>
    </div>
  );
}

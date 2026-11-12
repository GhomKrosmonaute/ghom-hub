import { getProfile } from "@/content/profile";
import { getDictionary, getLocale } from "@/i18n/server";
import { sectionCode } from "../hud/sections";
import { ContactForm } from "./contact-form";
import { Panel, SectionHeader } from "./section-header";

export async function Comms() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const profile = await getProfile(locale);
  return (
    <section
      id="comms"
      className="relative scroll-mt-10 px-6 py-28 md:px-28 lg:px-40"
      style={{ "--glow": "var(--neon-2)" } as React.CSSProperties}
    >
      <SectionHeader code={sectionCode("comms")} kicker={t.comms.kicker} title={t.comms.title} />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr]">
        <Panel className="p-6 md:p-8">
          <p className="hud-label text-neon-2">{t.comms.open}</p>
          <p className="mt-4 text-lg leading-relaxed text-foreground/80">{t.comms.body}</p>
          <ul className="mt-8 space-y-3 font-mono text-sm">
            {profile.links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 text-foreground/80 transition-colors hover:text-neon-2"
                >
                  <span className="grid size-8 place-items-center border border-neon-2/40 text-[0.65rem] text-neon-2 transition-colors group-hover:bg-neon-2 group-hover:text-black">
                    {l.code}
                  </span>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel className="p-6 md:p-8">
          <ContactForm />
        </Panel>
      </div>
    </section>
  );
}

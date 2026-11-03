"use client";

import { FUNDING_URLS } from "@ghom/content";
import { type SubscribeInput, subscribeSchemaFor } from "@ghom/core";
import { Button } from "@ghom/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ghom/ui/components/form";
import { Input } from "@ghom/ui/components/input";
import { CurrencyIcon } from "@ghom/ui/cyber/currency-icon";
import { playSfx } from "@ghom/ui/hooks/use-sfx";
import { zodResolver } from "@hookform/resolvers/zod";
import { Coins, Loader2 } from "lucide-react";
import { useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { subscribe } from "@/app/actions";
import { useI18n } from "@/i18n/client";
import { addCredit, addScore } from "../arcade/score";

export function InsertCoin() {
  const { t, locale } = useI18n();
  const schema = useMemo(() => subscribeSchemaFor(locale), [locale]);
  const [pending, start] = useTransition();
  const form = useForm<SubscribeInput>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", website: "" },
  });

  const onSubmit = (values: SubscribeInput) =>
    start(async () => {
      const res = await subscribe(locale, values);
      if (res.status === "success") {
        playSfx("coin");
        addCredit();
        addScore(1000);
        toast.success(res.message);
        form.reset();
      } else if (res.status === "error") {
        playSfx("error");
        toast.error(res.message);
        const msg = res.fieldErrors?.email?.[0];
        if (msg) form.setError("email", { message: msg });
      }
    });

  return (
    <section id="insert-coin" className="relative scroll-mt-16 px-8 py-28 md:px-20 lg:px-28">
      <div className="mx-auto max-w-3xl border-2 border-neon-1 bg-black/80 p-8 text-center shadow-[8px_8px_0_var(--neon-2)] backdrop-blur md:p-12">
        <p className="pixel-font text-xs text-neon-2">{t.insertCoin.stage}</p>
        <h2 className="extrude mt-2 font-display text-4xl uppercase md:text-6xl">
          {t.insertCoin.title}
        </h2>
        <p className="mx-auto mt-4 max-w-md text-foreground/80">{t.insertCoin.body}</p>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, () => playSfx("error"))}
            className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row sm:items-start"
            noValidate
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1 text-left">
                  <FormLabel className="sr-only">{t.insertCoin.email}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder={t.insertCoin.placeholder}
                      className="h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="pixel-font text-[0.6rem]" />
                </FormItem>
              )}
            />
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="hidden"
              {...form.register("website")}
            />
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Coins />}
              {t.insertCoin.submit}
            </Button>
          </form>
        </Form>
      </div>

      {/* Soutien : jeux gratuits et open source, le studio ne gagne rien */}
      <aside
        aria-labelledby="support-title"
        className="mx-auto mt-8 grid max-w-3xl items-center gap-6 border-2 border-dashed border-neon-2/70 bg-black/70 p-6 backdrop-blur md:grid-cols-[1fr_auto] md:p-8"
      >
        <div>
          <p className="pixel-font text-xs text-neon-2 animate-[press-start_1.1s_steps(1)_infinite]">
            {t.support.kicker}
          </p>
          <h3 id="support-title" className="mt-2 font-display text-2xl uppercase md:text-3xl">
            {t.support.title}
          </h3>
          <p className="mt-3 text-foreground/80">{t.support.body}</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Button asChild size="lg" style={{ "--glow": "var(--neon-2)" } as React.CSSProperties}>
            <a
              href={FUNDING_URLS.studio}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                playSfx("coin");
                addScore(500);
              }}
            >
              <CurrencyIcon locale={locale} /> {t.support.cta}
            </a>
          </Button>
          <p className="pixel-font text-[0.55rem] text-muted-foreground">{t.support.note}</p>
        </div>
      </aside>
    </section>
  );
}

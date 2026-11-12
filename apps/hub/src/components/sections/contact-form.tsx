"use client";

import { type ContactInput, contactSchemaFor, type FormState } from "@ghom/core";
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
import { Textarea } from "@ghom/ui/components/textarea";
import { playSfx } from "@ghom/ui/hooks/use-sfx";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useMemo, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { sendContact } from "@/app/actions";
import { useI18n } from "@/i18n/client";

const labelClass = "hud-label text-foreground/70 data-[error=true]:text-destructive";

export function ContactForm() {
  const { t, locale } = useI18n();
  const schema = useMemo(() => contactSchemaFor(locale), [locale]);
  const [pending, startTransition] = useTransition();
  const form = useForm<ContactInput>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", subject: "", message: "", website: "" },
    mode: "onTouched",
  });

  const onSubmit = (values: ContactInput) =>
    startTransition(async () => {
      const res: FormState = await sendContact(locale, values);
      if (res.status === "success") {
        playSfx("lock");
        toast.success(res.message);
        form.reset();
      } else if (res.status === "error") {
        playSfx("error");
        toast.error(res.message);
        for (const [field, msgs] of Object.entries(res.fieldErrors ?? {})) {
          form.setError(field as keyof ContactInput, { message: msgs[0] });
        }
      }
    });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, () => playSfx("error"))}
        className="grid gap-5"
        noValidate
      >
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>{t.contact.name}</FormLabel>
                <FormControl>
                  <Input autoComplete="name" placeholder={t.contact.namePlaceholder} {...field} />
                </FormControl>
                <FormMessage className="font-mono text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>{t.contact.email}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder={t.contact.emailPlaceholder}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="font-mono text-xs" />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>{t.contact.subject}</FormLabel>
              <FormControl>
                <Input placeholder={t.contact.subjectPlaceholder} {...field} />
              </FormControl>
              <FormMessage className="font-mono text-xs" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>{t.contact.message}</FormLabel>
              <FormControl>
                <Textarea rows={6} placeholder="> ..." {...field} />
              </FormControl>
              <FormMessage className="font-mono text-xs" />
            </FormItem>
          )}
        />
        {/* Honeypot : invisible pour les humains */}
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          className="hidden"
          {...form.register("website")}
        />

        <div className="flex items-center justify-between gap-4">
          <p className="hud-label hidden text-foreground/70 sm:block">{t.contact.cipher}</p>
          <Button type="submit" size="lg" disabled={pending} data-lock={t.contact.send}>
            {pending ? <Loader2 className="animate-spin" /> : <Send />}
            {pending ? t.contact.sending : t.contact.send}
          </Button>
        </div>
      </form>
    </Form>
  );
}

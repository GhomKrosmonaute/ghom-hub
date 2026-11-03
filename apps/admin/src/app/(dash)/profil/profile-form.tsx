"use client";

import { type ProfileData, type ProfileInput, profileSchema } from "@ghom/content";
import { LOCALE_META, LOCALES, type Locale } from "@ghom/core";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, RotateCcw, Save, X } from "lucide-react";
import { useTransition } from "react";
import { type FieldPath, useFieldArray, useForm, useFormContext, useWatch } from "react-hook-form";
import { DeleteButton } from "@/components/delete-button";
import { Card } from "@/components/page-header";
import { toastResult } from "@/lib/toast-result";
import { resetProfile, saveProfile } from "./actions";

const labelClass = "hud-label text-foreground/70";

function Field({
  name,
  label,
  rows,
}: {
  name: FieldPath<ProfileInput>;
  label: string;
  rows?: number;
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={labelClass}>{label}</FormLabel>
          <FormControl>
            {rows ? (
              <Textarea rows={rows} {...field} value={(field.value as string) ?? ""} />
            ) : (
              <Input {...field} value={(field.value as string | number) ?? ""} />
            )}
          </FormControl>
          <FormMessage className="font-mono text-xs" />
        </FormItem>
      )}
    />
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="size-8 shrink-0"
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </Button>
  );
}

function Section({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="hud-label text-neon-2">{title}</h2>
        {action}
      </div>
      {children}
    </Card>
  );
}

/** Paragraphes de bio : un tableau de chaînes, édité champ par champ. */
function BioEditor({ locale }: { locale: Locale }) {
  const form = useFormContext<ProfileInput>();
  const bio = useWatch({ control: form.control, name: `texts.${locale}.bio` }) ?? [];
  return (
    <div className="space-y-2">
      <p className={labelClass}>Bio</p>
      {bio.map((_, i) => (
        <div key={i} className="flex gap-2">
          <Textarea rows={4} {...form.register(`texts.${locale}.bio.${i}`)} />
          <IconButton
            label={`Retirer le paragraphe ${i + 1}`}
            onClick={() =>
              form.setValue(
                `texts.${locale}.bio`,
                bio.filter((__, j) => j !== i),
                { shouldDirty: true },
              )
            }
          >
            <X />
          </IconButton>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => form.setValue(`texts.${locale}.bio`, [...bio, ""], { shouldDirty: true })}
      >
        <Plus /> Paragraphe
      </Button>
    </div>
  );
}

function LogbookEditor({ locale }: { locale: Locale }) {
  const form = useFormContext<ProfileInput>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `texts.${locale}.logbook`,
  });
  return (
    <div className="space-y-2">
      <p className={labelClass}>Journal de bord</p>
      {fields.map((f, i) => (
        <div key={f.id} className="flex gap-2">
          <Input
            className="w-20 shrink-0"
            aria-label="Année"
            {...form.register(`texts.${locale}.logbook.${i}.year`)}
          />
          <Input aria-label="Entrée" {...form.register(`texts.${locale}.logbook.${i}.entry`)} />
          <IconButton label={`Retirer l'entrée ${i + 1}`} onClick={() => remove(i)}>
            <X />
          </IconButton>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => append({ year: "", entry: "" })}
      >
        <Plus /> Entrée
      </Button>
    </div>
  );
}

export function ProfileForm({ defaults, custom }: { defaults: ProfileData; custom: boolean }) {
  const [pending, start] = useTransition();
  const form = useForm<ProfileInput, unknown, ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaults,
    mode: "onTouched",
  });
  const systems = useFieldArray({ control: form.control, name: "systems" });
  const links = useFieldArray({ control: form.control, name: "links" });
  const loadout = useWatch({ control: form.control, name: "loadout" }) ?? [];

  const onSubmit = (data: ProfileData) =>
    start(async () => {
      if (toastResult(await saveProfile(data))) form.reset(data);
    });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, () =>
          toastResult({ ok: false, message: "Certains champs sont invalides" }),
        )}
        className="space-y-6"
        noValidate
      >
        <Section title="Identité">
          <div className="grid gap-5 md:grid-cols-2">
            <Field name="handle" label="Pseudo" />
            <Field name="unit" label="Unité" />
          </div>
        </Section>

        <div className="grid gap-6 xl:grid-cols-2">
          {LOCALES.map((l) => (
            <Section key={l} title={`Textes · ${LOCALE_META[l].name}`}>
              <div className="space-y-5">
                <Field name={`texts.${l}.role`} label="Rôle" />
                <Field name={`texts.${l}.location`} label="Base" />
                <Field name={`texts.${l}.tagline`} label="Accroche" rows={3} />
                <BioEditor locale={l} />
                <LogbookEditor locale={l} />
              </div>
            </Section>
          ))}
        </div>

        <Section
          title="Systèmes embarqués (compétences)"
          action={
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() =>
                systems.append({
                  code: `SYS.${String(systems.fields.length + 1).padStart(2, "0")}`,
                  label: "",
                  level: 50,
                })
              }
            >
              <Plus /> Système
            </Button>
          }
        >
          <div className="space-y-2">
            {systems.fields.map((f, i) => (
              <div key={f.id} className="grid grid-cols-[90px_1fr_80px_auto] gap-2">
                <Input aria-label="Code" {...form.register(`systems.${i}.code`)} />
                <Input aria-label="Compétence" {...form.register(`systems.${i}.label`)} />
                <Input
                  aria-label="Niveau (0–100)"
                  type="number"
                  min={0}
                  max={100}
                  {...form.register(`systems.${i}.level`)}
                />
                <IconButton
                  label={`Retirer ${f.label || "ce système"}`}
                  onClick={() => systems.remove(i)}
                >
                  <X />
                </IconButton>
              </div>
            ))}
            <FormMessage className="font-mono text-xs" />
          </div>
        </Section>

        <div className="grid gap-6 xl:grid-cols-2">
          <Section title="Équipement">
            <FormField
              name="loadout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Outils (séparés par des virgules)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      key={loadout.join("|")}
                      defaultValue={loadout.join(", ")}
                      onBlur={(e) =>
                        field.onChange(
                          e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage className="font-mono text-xs" />
                </FormItem>
              )}
            />
          </Section>

          <Section
            title="Liens"
            action={
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => links.append({ label: "", href: "https://", code: "" })}
              >
                <Plus /> Lien
              </Button>
            }
          >
            <div className="space-y-2">
              {links.fields.map((f, i) => (
                <div key={f.id} className="grid grid-cols-[60px_110px_1fr_auto] gap-2">
                  <Input aria-label="Code" {...form.register(`links.${i}.code`)} />
                  <Input aria-label="Libellé" {...form.register(`links.${i}.label`)} />
                  <Input aria-label="URL" {...form.register(`links.${i}.href`)} />
                  <IconButton
                    label={`Retirer ${f.label || "ce lien"}`}
                    onClick={() => links.remove(i)}
                  >
                    <X />
                  </IconButton>
                </div>
              ))}
              <p className="font-mono text-[0.65rem] text-muted-foreground">
                Code « ¤ » = symbole monétaire de la langue (€ en français, $ en anglais).
              </p>
              {form.formState.errors.links && (
                <p className="font-mono text-xs text-destructive">
                  Un lien est invalide (URL http(s):// ou mailto:).
                </p>
              )}
            </div>
          </Section>
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-white/8 bg-void/95 py-4 backdrop-blur">
          <Button type="submit" size="lg" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Save />}
            Enregistrer
          </Button>
          {form.formState.isDirty && (
            <span className="font-mono text-xs text-neon-3">Modifications non enregistrées</span>
          )}
          <span className="ml-auto font-mono text-xs text-muted-foreground">
            {custom ? "Profil personnalisé" : "Valeurs par défaut (code)"}
          </span>
          {custom && (
            <DeleteButton
              name="le profil personnalisé"
              confirmLabel="Réinitialiser"
              description="Le profil revient aux valeurs par défaut du code. Tes modifications seront perdues."
              onConfirm={() =>
                start(async () => {
                  if (toastResult(await resetProfile())) window.location.reload();
                })
              }
            >
              <Button type="button" variant="ghost">
                <RotateCcw /> Revenir aux valeurs par défaut
              </Button>
            </DeleteButton>
          )}
        </div>
      </form>
    </Form>
  );
}

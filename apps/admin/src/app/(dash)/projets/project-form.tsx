"use client";

import {
  type DomainConfig,
  KIND_META,
  OWNERS,
  PROJECT_KINDS,
  PROJECT_STATUSES,
  type ProjectFormData,
  type ProjectFormInput,
  productRef,
  projectInputSchema,
  projectUrl,
  STATUS_META,
} from "@ghom/core";
import { Button } from "@ghom/ui/components/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@ghom/ui/components/form";
import { Input } from "@ghom/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ghom/ui/components/select";
import { Switch } from "@ghom/ui/components/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ghom/ui/components/tabs";
import { Textarea } from "@ghom/ui/components/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { type FieldPath, useForm, useWatch } from "react-hook-form";
import { DeleteButton } from "@/components/delete-button";
import { toastResult } from "@/lib/toast-result";
import { removeProject, saveProject } from "./actions";

const OWNER_LABEL = { PERSONAL: "Perso · ghom.fr", STUDIO: "Studio · No Brain No Game" };
const labelClass = "hud-label text-foreground/70";

function TextField({
  name,
  label,
  placeholder,
  description,
  rows,
}: {
  name: FieldPath<ProjectFormInput>;
  label: string;
  placeholder?: string;
  description?: string;
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
              <Textarea
                rows={rows}
                placeholder={placeholder}
                {...field}
                value={field.value ?? ""}
              />
            ) : (
              <Input placeholder={placeholder} {...field} value={field.value ?? ""} />
            )}
          </FormControl>
          {description && <FormDescription className="text-xs">{description}</FormDescription>}
          <FormMessage className="font-mono text-xs" />
        </FormItem>
      )}
    />
  );
}

function SelectField<T extends string>({
  name,
  label,
  options,
}: {
  name: FieldPath<ProjectFormInput>;
  label: string;
  options: readonly { value: T; label: string }[];
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={labelClass}>{label}</FormLabel>
          <Select value={field.value as string} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger className="w-full min-w-0 [&>span]:truncate">
                <SelectValue />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage className="font-mono text-xs" />
        </FormItem>
      )}
    />
  );
}

function SwitchField({
  name,
  label,
  description,
}: {
  name: FieldPath<ProjectFormInput>;
  label: string;
  description: string;
}) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center justify-between gap-4 border border-white/8 p-3">
          <div>
            <FormLabel className={labelClass}>{label}</FormLabel>
            <FormDescription className="text-xs">{description}</FormDescription>
          </div>
          <FormControl>
            <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

/** Aperçu en direct : référence produit, état de stock et URL publique résolue. */
function Preview({ domains }: { domains: DomainConfig }) {
  const [owner, kind, status, subdomain, externalUrl, accent, name, sortOrder] = useWatch<
    ProjectFormInput,
    ["owner", "kind", "status", "subdomain", "externalUrl", "accent", "name", "sortOrder"]
  >({
    name: ["owner", "kind", "status", "subdomain", "externalUrl", "accent", "name", "sortOrder"],
  });

  let url: string | null = null;
  let urlError: string | null = null;
  try {
    url = projectUrl(
      {
        owner,
        subdomain: subdomain?.trim().toLowerCase() || null,
        externalUrl: externalUrl || null,
      },
      domains,
    );
  } catch (error) {
    urlError = (error as Error).message;
  }
  const color = /^#[0-9a-f]{6}$/i.test(accent ?? "") ? accent : "#00f0ff";

  return (
    <aside
      className="sticky top-6 border border-white/8 bg-[#05060b]/80 p-5"
      style={{ "--glow": color } as React.CSSProperties}
    >
      <p className="hud-label mb-3">Aperçu</p>
      <div className="cyber-clip border border-[var(--glow)]/50 bg-black/60 p-4 shadow-[0_0_30px_-12px_var(--glow)]">
        <div className="flex items-center justify-between font-mono text-[0.6rem] tracking-[0.18em]">
          <span className="text-muted-foreground">
            {productRef({ owner, kind, sortOrder: Number(sortOrder) || 0 })}
          </span>
          <span className="border border-[var(--glow)]/60 px-1.5 py-0.5 text-[var(--glow)]">
            {STATUS_META[status].stock.fr}
          </span>
        </div>
        <p className="mt-4 font-display text-2xl font-bold text-[var(--glow)]">
          {name || "Sans nom"}
        </p>
        <p className="hud-label mt-1">
          {KIND_META[kind].label.fr} / {KIND_META[kind].label.en}
        </p>
      </div>
      <dl className="mt-4 space-y-2 font-mono text-xs">
        <div>
          <dt className="text-muted-foreground">URL publique</dt>
          <dd className={urlError ? "text-destructive" : "break-all text-neon-1"}>
            {urlError ?? url ?? "— (aucune : pas de bouton « Lancer »)"}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Listé sur</dt>
          <dd>
            {owner === "STUDIO" ? "Portail studio + section Studio du hub" : "ghom.fr · Arsenal"}
          </dd>
        </div>
      </dl>
    </aside>
  );
}

export function ProjectForm({
  id,
  defaults,
  domains,
}: {
  id: string | null;
  defaults: ProjectFormInput;
  domains: DomainConfig;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  // Création : on verrouille après le premier envoi (la redirection suit), contre le double clic.
  const [locked, setLocked] = useState(false);
  const schema = useMemo(() => projectInputSchema(domains), [domains]);
  const form = useForm<ProjectFormInput, unknown, ProjectFormData>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
    mode: "onTouched",
  });
  const owner = useWatch({ control: form.control, name: "owner" });

  const onSubmit = () => {
    if (locked) return;
    if (!id) setLocked(true);
    start(async () => {
      const result = await saveProject(id, form.getValues());
      if (!toastResult(result) && !result.ok) {
        for (const [field, msgs] of Object.entries(result.fieldErrors ?? {})) {
          form.setError(field as FieldPath<ProjectFormInput>, { message: msgs[0] });
        }
        setLocked(false);
      } else {
        form.reset(form.getValues());
      }
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-6 lg:grid-cols-[1fr_300px]"
        noValidate
      >
        <div className="space-y-6">
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="links">Liens</TabsTrigger>
              <TabsTrigger value="game">Jeu</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-6 grid gap-5">
              <div className="grid gap-5 md:grid-cols-2">
                <TextField name="name" label="Nom" placeholder="Neon Ledger" />
                <TextField
                  name="slug"
                  label="Slug"
                  placeholder="neon-ledger"
                  description="Identifiant unique, minuscules et tirets."
                />
              </div>
              <TextField name="tagline" label="Accroche (FR)" />
              <TextField name="description" label="Description (FR)" rows={5} />
              <div className="grid gap-5 md:grid-cols-3 [&>*]:min-w-0">
                <SelectField
                  name="owner"
                  label="Propriétaire"
                  options={OWNERS.map((o) => ({ value: o, label: OWNER_LABEL[o] }))}
                />
                <SelectField
                  name="kind"
                  label="Type"
                  options={PROJECT_KINDS.map((k) => ({ value: k, label: KIND_META[k].label.fr }))}
                />
                <SelectField
                  name="status"
                  label="Statut"
                  options={PROJECT_STATUSES.map((s) => ({
                    value: s,
                    label: `${STATUS_META[s].label.fr} · ${STATUS_META[s].stock.fr}`,
                  }))}
                />
              </div>
              <div className="grid gap-5 md:grid-cols-3 [&>*]:min-w-0">
                <TextField name="year" label="Année" placeholder="2026" />
                <TextField name="sortOrder" label="Ordre" description="Plus petit = plus haut." />
                <FormField
                  name="accent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Couleur néon</FormLabel>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          aria-label="Choisir la couleur"
                          value={
                            /^#[0-9a-f]{6}$/i.test(field.value ?? "") ? field.value : "#00f0ff"
                          }
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-9 w-12 shrink-0 cursor-pointer border border-white/10 bg-transparent"
                        />
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </div>
                      <FormMessage className="font-mono text-xs" />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <TextField
                  name="stack"
                  label="Stack"
                  placeholder="Next.js, Prisma"
                  description="Séparée par des virgules."
                />
                <TextField
                  name="tags"
                  label="Tags (FR)"
                  placeholder="finance, dashboard"
                  description="Séparés par des virgules."
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <SwitchField name="published" label="Publié" description="Visible sur les sites." />
                <SwitchField
                  name="featured"
                  label="Mis en avant"
                  description="★ Sélection, en tête de liste."
                />
              </div>
            </TabsContent>

            <TabsContent value="links" className="mt-6 grid gap-5">
              <TextField
                name="subdomain"
                label="Sous-domaine"
                placeholder="ledger"
                description={
                  owner === "STUDIO"
                    ? `Servi sur <label>.${domains.studioLabel}.${domains.rootDomain}`
                    : `Servi sur <label>.${domains.rootDomain}`
                }
              />
              <TextField
                name="externalUrl"
                label="URL externe"
                placeholder="https://…"
                description="Utilisée seulement sans sous-domaine."
              />
              <TextField name="repoUrl" label="Code source" placeholder="https://github.com/…" />
              <TextField
                name="coverUrl"
                label="Visuel"
                placeholder="https://…/cover.webp"
                description="Sinon un glyphe généré est affiché."
              />
            </TabsContent>

            <TabsContent value="game" className="mt-6 grid gap-5">
              <p className="text-sm text-muted-foreground">
                Affiché sur l&apos;écran « Select your game » du studio.
              </p>
              <div className="grid gap-5 md:grid-cols-2">
                <TextField
                  name="genre"
                  label="Genre (FR)"
                  placeholder="Tactique au tour par tour"
                />
                <TextField name="players" label="Joueurs (FR)" placeholder="1 joueur" />
              </div>
              <TextField
                name="platforms"
                label="Plateformes"
                placeholder="Web, PC"
                description="Séparées par des virgules."
              />
            </TabsContent>

            <TabsContent value="en" className="mt-6 grid gap-5">
              <p className="text-sm text-muted-foreground">
                Version anglaise (/en). Un champ vide affiche le texte français.
              </p>
              <TextField
                name="translations.en.name"
                label="Name"
                description="Seulement si le nom change en anglais."
              />
              <TextField name="translations.en.tagline" label="Tagline" />
              <TextField name="translations.en.description" label="Description" rows={5} />
              <div className="grid gap-5 md:grid-cols-3 [&>*]:min-w-0">
                <TextField name="translations.en.genre" label="Genre" />
                <TextField name="translations.en.players" label="Players" />
                <TextField name="translations.en.tags" label="Tags" />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex flex-wrap items-center gap-3 border-t border-white/8 pt-5">
            <Button type="submit" size="lg" disabled={pending || locked}>
              {pending ? <Loader2 className="animate-spin" /> : <Save />}
              {id ? "Enregistrer" : "Créer"}
            </Button>
            {form.formState.isDirty && (
              <span className="font-mono text-xs text-neon-3">Modifications non enregistrées</span>
            )}
            {id && (
              <span className="ml-auto">
                <DeleteButton
                  name={form.getValues("name")}
                  description="Cette action est définitive. Pour simplement le cacher des sites, désactive plutôt « Publié »."
                  onConfirm={() =>
                    start(async () => {
                      if (toastResult(await removeProject(id))) router.push("/projets");
                    })
                  }
                >
                  <Button type="button" variant="ghost" className="hover:text-destructive">
                    <Trash2 /> Supprimer
                  </Button>
                </DeleteButton>
              </span>
            )}
          </div>
        </div>
        <Preview domains={domains} />
      </form>
    </Form>
  );
}

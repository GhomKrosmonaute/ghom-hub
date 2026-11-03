"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@ghom/ui/components/command";
import { playSfx } from "@ghom/ui/hooks/use-sfx";
import type { NavGroup } from "@ghom/ui/lib/nav";
import { Volume2, VolumeX } from "lucide-react";
import { Fragment } from "react";
import { useI18n } from "@/i18n/client";

/** Terminal ⌘K : même modèle de navigation que le menu du clic droit. */
export function CommandPalette({
  open,
  onOpenChange,
  groups,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  groups: NavGroup[];
}) {
  const { t } = useI18n();
  const run = (fn: () => void) => {
    playSfx("click");
    onOpenChange(false);
    fn();
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t.palette.title}
      description={t.palette.description}
      closeLabel={t.palette.close}
      className="max-w-xl font-mono [&_[cmdk-group-heading]]:text-[0.6rem] [&_[cmdk-group-heading]]:tracking-[0.3em] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:text-neon-2"
    >
      <CommandInput placeholder={t.palette.placeholder} />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>{t.palette.empty}</CommandEmpty>
        {groups.map((group, gi) => (
          <Fragment key={group.id}>
            {gi > 0 && <CommandSeparator />}
            <CommandGroup heading={group.heading}>
              {group.items
                .filter((item) => item.id !== "terminal")
                .map((item) => (
                  <CommandItem
                    key={item.id}
                    value={`${item.label} ${item.keywords ?? ""} ${item.hint ?? ""}`}
                    disabled={item.disabled}
                    onSelect={() => run(item.run)}
                  >
                    {item.checked === undefined ? (
                      item.icon
                    ) : item.checked ? (
                      <Volume2 />
                    ) : (
                      <VolumeX />
                    )}
                    <span>{item.label}</span>
                    {item.hint && (
                      <span className="ml-auto truncate text-[0.65rem] text-muted-foreground">
                        {item.hint}
                      </span>
                    )}
                    {item.checked !== undefined && (
                      <CommandShortcut>{item.checked ? "ON" : "OFF"}</CommandShortcut>
                    )}
                    {item.shortcut && <CommandShortcut>{item.shortcut}</CommandShortcut>}
                  </CommandItem>
                ))}
            </CommandGroup>
          </Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

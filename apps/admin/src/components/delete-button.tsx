"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@ghom/ui/components/alert-dialog";
import { Button } from "@ghom/ui/components/button";
import { Trash2 } from "lucide-react";

/** Bouton de suppression avec confirmation. `children` remplace le bouton icône par défaut. */
export function DeleteButton({
  name,
  description = "Cette action est définitive.",
  confirmLabel = "Supprimer",
  onConfirm,
  children,
}: {
  name: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
  children?: React.ReactNode;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children ?? (
          <Button
            size="icon"
            variant="ghost"
            className="size-7 hover:text-destructive"
            aria-label={`Supprimer ${name}`}
          >
            <Trash2 />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {confirmLabel} « {name} » ?
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

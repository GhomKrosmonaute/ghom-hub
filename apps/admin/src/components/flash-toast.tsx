"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

/** Toast affiché après une redirection (ex. création), puis retiré de l'URL. */
export function FlashToast({ message, cleanHref }: { message: string; cleanHref: string }) {
  const router = useRouter();
  useEffect(() => {
    toast.success(message);
    router.replace(cleanHref, { scroll: false });
  }, [message, cleanHref, router]);
  return null;
}

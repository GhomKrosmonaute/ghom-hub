import { fieldBase } from "@ghom/ui/components/input";
import { cn } from "@ghom/ui/lib/utils";
import type * as React from "react";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldBase, "field-sizing-content min-h-28 resize-none py-2.5", className)}
      {...props}
    />
  );
}

export { Textarea };

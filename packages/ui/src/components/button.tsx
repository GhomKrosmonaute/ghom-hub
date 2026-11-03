import { cn } from "@ghom/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

/**
 * Bouton shadcn re-skinné : coins biseautés, typo mono, halo néon au survol.
 * La couleur suit `--glow` (par défaut la couleur primaire de l'app).
 */
const buttonVariants = cva(
  "group/btn relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap font-mono text-xs font-semibold uppercase tracking-[0.18em] transition-[color,background,box-shadow,transform] duration-200 outline-none active:translate-y-px disabled:pointer-events-none disabled:opacity-40 aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "cyber-clip bg-[var(--glow,var(--primary))] text-primary-foreground hover:brightness-125 hover:shadow-[0_0_28px_-4px_var(--glow,var(--primary))]",
        outline:
          "cyber-clip bg-[color-mix(in_oklab,var(--glow,var(--primary))_8%,transparent)] text-[var(--glow,var(--primary))] shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--glow,var(--primary))_65%,transparent)] hover:bg-[color-mix(in_oklab,var(--glow,var(--primary))_20%,transparent)] hover:shadow-[inset_0_0_0_1px_var(--glow,var(--primary)),0_0_24px_-6px_var(--glow,var(--primary))]",
        secondary: "cyber-clip bg-secondary text-secondary-foreground hover:bg-secondary/70",
        destructive: "cyber-clip bg-destructive text-white hover:brightness-110",
        ghost: "text-muted-foreground hover:text-[var(--glow,var(--primary))]",
        link: "text-[var(--glow,var(--primary))] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5",
        xs: "h-6 gap-1 px-2 text-[0.6rem] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3",
        lg: "h-12 px-7 text-sm",
        icon: "size-10",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };

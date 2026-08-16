import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[transform,opacity,background-color,box-shadow] duration-150 ease-out select-none disabled:pointer-events-none disabled:opacity-40 active:not-disabled:scale-[0.96] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-foreground shadow-[var(--shadow-border)]",
        secondary: "bg-card-2 text-foreground",
        ghost: "bg-transparent text-foreground hover:bg-card-2",
        outline: "bg-transparent text-foreground shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]",
        danger: "bg-destructive/15 text-destructive",
        ink: "bg-ink/15 text-ink",
      },
      size: {
        sm: "h-9 rounded-lg px-3 text-sm",
        md: "h-11 rounded-xl px-4 text-sm",
        lg: "h-12 rounded-xl px-5 text-[0.95rem]",
        icon: "size-11 rounded-xl",
        "icon-sm": "size-9 rounded-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

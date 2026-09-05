import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        chips: "border-blue-400/40 bg-blue-950/80 text-[#009dff] font-bold shadow-sm shadow-blue-500/20",
        mult: "border-red-400/40 bg-red-950/80 text-[#fe5f55] font-bold shadow-sm shadow-red-500/20",
        money: "border-amber-400/40 bg-amber-950/80 text-[#f7c844] font-bold shadow-sm shadow-amber-500/20",
        tarot: "border-purple-400/40 bg-purple-950/80 text-[#a855f7] font-bold shadow-sm shadow-purple-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

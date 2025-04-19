import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/libs/tailwind/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary-700 hover:shadow-md transition-colors",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md transition-colors",
        outline:
          "border border-input bg-transparent shadow-sm hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-colors",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary-muted hover:text-primary-600 hover:shadow-md transition-colors",
        ghost:
          "text-foreground hover:bg-primary-50 hover:text-primary-700 transition-colors",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-700 transition-colors",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-sm px-3 text-xs",
        lg: "h-12 rounded-xl px-8",
        icon: "h-11 w-11",
        smIcon: "h-6 w-6 rounded-[4px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

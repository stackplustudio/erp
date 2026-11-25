import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-brand-line bg-brand-background px-3 py-1.5 text-sm text-brand-ink-dark transition-colors outline-none",
        "placeholder:text-brand-ink-muted/70",
        "focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary/20",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-brand-surface-alt",
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "aria-invalid:border-brand-danger aria-invalid:ring-2 aria-invalid:ring-brand-danger/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }

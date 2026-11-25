import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent font-semibold whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-brand-primary text-white hover:bg-brand-primary-hover active:bg-brand-primary-dark shadow-sm",
        outline:
          "border-brand-line bg-brand-surface text-brand-ink hover:bg-brand-surface-alt hover:text-brand-ink-dark",
        ghost:
          "text-brand-ink hover:bg-brand-surface-alt hover:text-brand-ink-dark",
        secondary:
          "bg-brand-surface-alt text-brand-ink-dark border-brand-line hover:bg-brand-line",
        destructive:
          "bg-brand-danger-soft text-brand-danger border-brand-danger/20 hover:bg-brand-danger/15",
        success:
          "bg-brand-success text-white hover:bg-brand-success/90",
        link: "text-brand-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-9 px-4 text-sm",
        xs:      "h-6 px-2 text-xs rounded-md",
        sm:      "h-8 px-3 text-xs",
        lg:      "h-11 px-6 text-sm",
        xl:      "h-12 px-7 text-base",
        icon:    "size-9",
        "icon-sm": "size-8",
        "icon-xs": "size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

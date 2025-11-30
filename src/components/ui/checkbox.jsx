import * as React from "react"
import { cn } from "@/lib/utils"

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
  const [isChecked, setIsChecked] = React.useState(checked || false)

  React.useEffect(() => {
    if (checked !== undefined) setIsChecked(checked)
  }, [checked])

  const handleClick = () => {
    const newValue = !isChecked
    setIsChecked(newValue)
    onCheckedChange?.(newValue)
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isChecked}
      data-state={isChecked ? "checked" : "unchecked"}
      onClick={handleClick}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        isChecked ? "bg-primary text-primary-foreground" : "bg-background",
        className
      )}
      ref={ref}
      {...props}
    >
      {isChecked && (
        <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 12 10">
          <polyline points="1.5 6 4.5 9 10.5 1" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      )}
    </button>
  )
})
Checkbox.displayName = "Checkbox"

export { Checkbox }

import * as React from "react"
import { cn } from "../../lib/utils"

const TabsContext = React.createContext({
  currentValue: null,
  onValueChange: () => {}
})

const Tabs = React.forwardRef(({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || value)
  const currentValue = value !== undefined ? value : internalValue

  const handleValueChange = (newValue) => {
    if (value === undefined) {
      setInternalValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <TabsContext.Provider value={{ currentValue, onValueChange: handleValueChange }}>
      <div ref={ref} className={cn("w-full", className)} {...props}>
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { currentValue, onValueChange: handleValueChange })
          }
          return child
        })}
      </div>
    </TabsContext.Provider>
  )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef(({ className, currentValue, onValueChange, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  const effectiveCurrentValue = currentValue ?? context.currentValue
  const effectiveOnValueChange = onValueChange ?? context.onValueChange

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {React.Children.map(props.children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { currentValue: effectiveCurrentValue, onValueChange: effectiveOnValueChange })
        }
        return child
      })}
    </div>
  )
})
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value, currentValue, onValueChange, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  const effectiveCurrentValue = currentValue ?? context.currentValue
  const effectiveOnValueChange = onValueChange ?? context.onValueChange
  const isActive = effectiveCurrentValue === value
  
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-background/50",
        className
      )}
      onClick={() => effectiveOnValueChange?.(value)}
      {...props}
    />
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value, currentValue, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  const effectiveCurrentValue = currentValue ?? context.currentValue
  
  if (effectiveCurrentValue !== value) return null
  return (
    <div
      ref={ref}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }

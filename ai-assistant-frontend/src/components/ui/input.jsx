import React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
    return (
        <input
            type={type}
            className={cn(
                "flex h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-500",
                "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50 dark:placeholder:text-neutral-400",
                "transition-all duration-200",
                className
            )}
            ref={ref}
            {...props}
        />
    );
});

Input.displayName = "Input";

export { Input };

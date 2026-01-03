import React from "react";
import { cn } from "../../lib/utils";

const Badge = ({ className, variant = "default", children, ...props }) => {
    const variants = {
        default: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
        success: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        warning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
        danger: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
        secondary: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};

export { Badge };

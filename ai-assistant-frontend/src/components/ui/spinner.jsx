import React from "react";
import { cn } from "../../lib/utils";

export const Spinner = ({ className, size = "default" }) => {
    const sizes = {
        sm: "h-4 w-4 border-2",
        default: "h-8 w-8 border-2",
        lg: "h-12 w-12 border-3",
    };

    return (
        <div
            className={cn(
                "inline-block animate-spin rounded-full border-solid border-indigo-600 border-r-transparent",
                sizes[size],
                className
            )}
            role="status"
        >
            <span className="sr-only">Loading...</span>
        </div>
    );
};

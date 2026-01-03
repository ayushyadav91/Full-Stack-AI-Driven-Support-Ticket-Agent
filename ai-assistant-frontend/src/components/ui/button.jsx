import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const Button = React.forwardRef(
    ({ className, variant = "default", size = "default", children, ...props }, ref) => {
        const variants = {
            default:
                "bg-black text-white hover:bg-gray-900 shadow-lg hover:shadow-xl border border-gray-800",
            outline:
                "border-2 border-black text-black hover:bg-gray-100 dark:border-white dark:text-white dark:hover:bg-gray-900",
            ghost:
                "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-gray-50",
            link: "text-black underline-offset-4 hover:underline dark:text-white",
        };

        const sizes = {
            default: "h-10 px-4 py-2",
            sm: "h-9 rounded-md px-3",
            lg: "h-11 rounded-md px-8",
            icon: "h-10 w-10",
        };

        return (
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </motion.button>
        );
    }
);

Button.displayName = "Button";

export { Button };

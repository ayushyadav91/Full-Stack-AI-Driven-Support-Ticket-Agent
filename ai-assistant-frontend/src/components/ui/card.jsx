import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const Card = ({ className, children, ...props }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300",
                "dark:border-neutral-800 dark:bg-neutral-900",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const CardHeader = ({ className, children, ...props }) => {
    return (
        <div className={cn("mb-4", className)} {...props}>
            {children}
        </div>
    );
};

export const CardTitle = ({ className, children, ...props }) => {
    return (
        <h3
            className={cn(
                "text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100",
                className
            )}
            {...props}
        >
            {children}
        </h3>
    );
};

export const CardDescription = ({ className, children, ...props }) => {
    return (
        <p
            className={cn(
                "text-sm text-neutral-600 dark:text-neutral-400",
                className
            )}
            {...props}
        >
            {children}
        </p>
    );
};

export const CardContent = ({ className, children, ...props }) => {
    return (
        <div className={cn("", className)} {...props}>
            {children}
        </div>
    );
};

export const CardFooter = ({ className, children, ...props }) => {
    return (
        <div className={cn("mt-4 flex items-center gap-2", className)} {...props}>
            {children}
        </div>
    );
};

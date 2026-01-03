import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const Tabs = ({ defaultValue, children, className, onValueChange }) => {
    const [activeTab, setActiveTab] = useState(defaultValue);

    const handleTabChange = (value) => {
        setActiveTab(value);
        onValueChange?.(value);
    };

    return (
        <div className={cn("w-full", className)}>
            {React.Children.map(children, (child) => {
                if (child.type === TabsList) {
                    return React.cloneElement(child, { activeTab, onTabChange: handleTabChange });
                }
                if (child.type === TabsContent) {
                    return React.cloneElement(child, { activeTab });
                }
                return child;
            })}
        </div>
    );
};

export const TabsList = ({ children, activeTab, onTabChange, className }) => {
    return (
        <div
            className={cn(
                "inline-flex h-12 items-center justify-center rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800",
                className
            )}
        >
            {React.Children.map(children, (child) =>
                React.cloneElement(child, { activeTab, onTabChange })
            )}
        </div>
    );
};

export const TabsTrigger = ({ value, children, activeTab, onTabChange, className }) => {
    const isActive = activeTab === value;

    return (
        <button
            onClick={() => onTabChange(value)}
            className={cn(
                "relative inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                isActive
                    ? "text-neutral-900 dark:text-neutral-50"
                    : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50",
                className
            )}
        >
            {isActive && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg bg-white shadow-sm dark:bg-neutral-900"
                    transition={{ type: "spring", duration: 0.5 }}
                />
            )}
            <span className="relative z-10">{children}</span>
        </button>
    );
};

export const TabsContent = ({ value, children, activeTab, className }) => {
    if (value !== activeTab) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className={cn("mt-6", className)}
        >
            {children}
        </motion.div>
    );
};

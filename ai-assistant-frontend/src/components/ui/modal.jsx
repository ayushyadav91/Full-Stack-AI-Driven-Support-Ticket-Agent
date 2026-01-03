import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export const Modal = ({ isOpen, onClose, children, className }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className={cn(
                                "relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl",
                                "dark:bg-neutral-900",
                                className
                            )}
                        >
                            {children}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};

export const ModalHeader = ({ children, onClose }) => {
    return (
        <div className="mb-6 flex items-start justify-between">
            <div className="flex-1">{children}</div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50"
                >
                    <X className="h-5 w-5" />
                </button>
            )}
        </div>
    );
};

export const ModalTitle = ({ children, className }) => {
    return (
        <h2 className={cn("text-2xl font-bold text-neutral-900 dark:text-neutral-50", className)}>
            {children}
        </h2>
    );
};

export const ModalDescription = ({ children, className }) => {
    return (
        <p className={cn("mt-2 text-sm text-neutral-600 dark:text-neutral-400", className)}>
            {children}
        </p>
    );
};

export const ModalBody = ({ children, className }) => {
    return <div className={cn("", className)}>{children}</div>;
};

export const ModalFooter = ({ children, className }) => {
    return (
        <div className={cn("mt-6 flex items-center justify-end gap-3", className)}>
            {children}
        </div>
    );
};

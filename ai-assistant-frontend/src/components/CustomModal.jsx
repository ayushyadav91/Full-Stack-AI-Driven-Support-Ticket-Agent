import React from 'react';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody } from './ui/modal';
import { X } from 'lucide-react';

export default function CustomModal({ isOpen, onClose, title, subtitle, children, size = 'md' }) {
    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className={sizeClasses[size]}>
            {/* Always show close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-50 rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 transition-colors"
            >
                <X className="h-5 w-5" />
            </button>

            {(title || subtitle) && (
                <ModalHeader>
                    {title && <ModalTitle>{title}</ModalTitle>}
                    {subtitle && <ModalDescription>{subtitle}</ModalDescription>}
                </ModalHeader>
            )}
            <ModalBody>{children}</ModalBody>
        </Modal>
    );
}

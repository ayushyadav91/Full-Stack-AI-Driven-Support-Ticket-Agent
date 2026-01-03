import React from 'react';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody } from './ui/modal';

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
            {(title || subtitle) && (
                <ModalHeader onClose={onClose}>
                    {title && <ModalTitle>{title}</ModalTitle>}
                    {subtitle && <ModalDescription>{subtitle}</ModalDescription>}
                </ModalHeader>
            )}
            <ModalBody>{children}</ModalBody>
        </Modal>
    );
}

import React from 'react';
import { X } from 'lucide-react';

export default function CustomModal({ isOpen, onClose, title, subtitle, children, size = 'md' }) {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
                {/* Header */}
                {(title || subtitle) && (
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                {title && (
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        {title}
                                    </h3>
                                )}
                                {subtitle && (
                                    <p className="text-sm text-gray-600">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={onClose}
                                className="ml-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Body */}
                <div className="px-6 py-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

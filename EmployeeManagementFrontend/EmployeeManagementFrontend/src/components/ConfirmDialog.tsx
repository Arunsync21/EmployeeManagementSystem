import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    isLoading = false
}) => {
    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: 'text-red-600',
                    confirmButton: 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                };
            case 'warning':
                return {
                    icon: 'text-yellow-600',
                    confirmButton: 'bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400'
                };
            case 'info':
                return {
                    icon: 'text-blue-600',
                    confirmButton: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
                };
            default:
                return {
                    icon: 'text-red-600',
                    confirmButton: 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Background overlay */}
            {/* <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            ></div> */}

            {/* Modal panel */}
            <div className="relative bg-white rounded-lg shadow-xl border border-gray-200 max-w-md w-full mx-auto">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 z-10"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-start">
                        <div className={`flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-red-100`}>
                            <AlertTriangle className={`h-5 w-5 ${styles.icon}`} />
                        </div>
                        <div className="ml-4 flex-1">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {title}
                            </h3>
                            <p className="text-sm text-gray-600">
                                {message}
                            </p>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${styles.confirmButton}`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Processing...
                                </>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
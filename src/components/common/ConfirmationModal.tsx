import React from 'react';
import Button from './Button';
import Card from './Card';
import { TrashIcon } from '../Icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm Delete',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-0">
        <div className="flex flex-col items-center text-center p-8">
            <div className="p-3 bg-red-100 rounded-full mb-4">
                <TrashIcon className="w-8 h-8 text-error" />
            </div>
            <h3 className="text-xl font-bold text-neutral mb-2">{title}</h3>
            <p className="text-secondary mb-6">{message}</p>
            <div className="flex justify-center gap-4 w-full">
                <Button variant="secondary" onClick={onClose} className="flex-1">
                    Cancel
                </Button>
                <Button variant="danger" onClick={onConfirm} className="flex-1">
                    {confirmText}
                </Button>
            </div>
        </div>
      </Card>
    </div>
  );
};

export default ConfirmationModal;
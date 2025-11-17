
import React, { useEffect } from 'react';
import { CheckCircleIcon } from './Icons';

interface PaymentSuccessModalProps {
    onClose: () => void;
}

const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({ onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 1500);

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
            <div className="bg-base-100 rounded-lg shadow-2xl p-8 flex flex-col items-center gap-4 animate-scale-in">
                <CheckCircleIcon className="w-20 h-20 text-success" />
                <h2 className="text-2xl font-bold text-neutral">Payment Successful!</h2>
            </div>
             <style>{`
                @keyframes scale-in {
                    0% { transform: scale(0.9); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default PaymentSuccessModal;

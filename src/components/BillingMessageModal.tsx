import React from 'react';
import { Transaction, Client, Service } from '../types';
import Button from './common/Button';
import { WhatsAppIcon } from './Icons';

interface BillingMessageModalProps {
  transaction: Transaction;
  client: Client;
  services: Service[];
  onClose: () => void;
  onSend: () => void;
  showToast: (message: string) => void;
}

const BillingMessageModal: React.FC<BillingMessageModalProps> = ({ transaction, client, services, onClose, onSend }) => {
  const serviceNames = transaction.items.map(item => {
    const service = services.find(s => s.id === item.serviceId);
    return service ? `- ${service.name}` : '- Unknown Service';
  }).join('\n');

  const message = `Hi ${client.name}, thank you for your visit to Hair and Nail Kingdom!\n\nHere is a summary of your bill:\n${serviceNames}\n\nTotal Amount: ₹${transaction.total.toFixed(2)}\n\nWe look forward to seeing you again!`;

  const handleSendOnWhatsApp = () => {
    const phoneNumber = client.phone.replace(/\D/g, ''); // Removes '+' and other non-digits
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    onSend();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-base-300">
          <h2 className="text-xl font-bold text-neutral">Send Bill to Client</h2>
        </div>
        <div className="p-6 space-y-4">
            <div>
                <p className="text-sm text-secondary">To: {client.name} ({client.phone})</p>
            </div>
            <div className="bg-base-200 p-4 rounded-md border border-base-300 max-h-60 overflow-y-auto">
                <p className="text-neutral whitespace-pre-wrap">{message}</p>
            </div>
            <p className="text-xs text-secondary text-center">
              Clicking below will open WhatsApp with the message ready to send.
            </p>
        </div>
        <div className="flex-shrink-0 p-4 bg-base-200 flex justify-end space-x-2">
            <Button variant="secondary" onClick={onClose}>Skip & View Invoice</Button>
            <Button onClick={handleSendOnWhatsApp} className="bg-green-500 hover:bg-green-600 focus:ring-green-500 text-white">
                <WhatsAppIcon className="w-5 h-5" /> 
                <span>Send on WhatsApp</span>
            </Button>
        </div>
      </div>
    </div>
  );
};

export default BillingMessageModal;
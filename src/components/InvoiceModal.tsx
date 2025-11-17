import React from 'react';
import { Transaction, Service, Client } from '../types';
import { SALON_NAME } from '../constants';
import { QrCodeIcon } from './Icons';
import Button from './common/Button';

interface InvoiceModalProps {
  transaction: Transaction;
  services: Service[];
  client: Client | undefined;
  onClose: () => void;
}

const InvoiceModal: React.FC<InvoiceModalProps> = ({ transaction, services, client, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const adjustment = transaction.subtotal - transaction.itemsSubtotal;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 print:p-0 print:bg-white print:text-black">
      <div className="bg-base-100 text-neutral rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col print:shadow-none print:rounded-none">
        <div id="invoice-content" className="p-8 overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-start pb-4 border-b border-base-300">
            <div>
              <h1 className="text-3xl font-serif font-bold text-primary">{SALON_NAME}</h1>
              <p className="text-secondary">123 Luxury Lane, Mumbai, Maharashtra 400001</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-neutral font-serif">INVOICE</h2>
              <p className="text-secondary">ID: {transaction.id}</p>
              <p className="text-secondary">Date: {new Date(transaction.date).toLocaleDateString('en-IN')}</p>
            </div>
          </div>
          
          {/* Client Info */}
          <div className="py-4">
            <h3 className="font-bold text-neutral mb-1">Bill To:</h3>
            <p>{client ? client.name : 'Walk-in Customer'}</p>
            {client && <p className="text-secondary">{client.phone}</p>}
          </div>

          {/* Items Table */}
          <table className="w-full text-left table-auto mb-4">
            <thead className="bg-base-200">
              <tr>
                <th className="p-2 font-bold">Service/Product</th>
                <th className="p-2 font-bold text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {transaction.items.map((item, index) => (
                  <tr key={index} className="border-b border-base-200">
                    <td className="p-2">{item.name}</td>
                    <td className="p-2 text-right">₹{item.price.toFixed(2)}</td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between"><span>Items Subtotal:</span><span>₹{transaction.itemsSubtotal.toFixed(2)}</span></div>
                {adjustment !== 0 && (
                  <div className="flex justify-between">
                      <span>Adjustment:</span>
                      <span>{adjustment > 0 ? '+ ' : '- '}₹{Math.abs(adjustment).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold"><span>Subtotal:</span><span>₹{transaction.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Discount:</span><span className="text-success">- ₹{transaction.discountAmount.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-xl border-t border-base-300 pt-2 mt-2"><span>Total:</span><span>₹{transaction.total.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Payment Method:</span><span>{transaction.paymentMethod}</span></div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-base-300 flex justify-between items-center">
            <p className="text-sm text-secondary">Thank you for your visit!</p>
            <div className="text-center print:hidden">
              <p className="font-bold text-neutral">Scan to Pay with UPI</p>
              <QrCodeIcon className="w-20 h-20 text-neutral" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 p-4 bg-base-200 flex justify-end space-x-2 print:hidden">
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button onClick={handlePrint}>Print Invoice</Button>
        </div>
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #invoice-content, #invoice-content * {
              visibility: visible;
            }
            #invoice-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default InvoiceModal;
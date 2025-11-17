import React, { useState } from 'react';
import Button from './common/Button';
import Input from './common/Input';

interface CustomServiceModalProps {
  onClose: () => void;
  onSave: (service: { name: string; price: number }) => void;
}

const CustomServiceModal: React.FC<CustomServiceModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);

  const handleSave = () => {
    if (name.trim() && price > 0) {
      onSave({ name: name.trim(), price });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-base-300">
          <h2 className="text-xl font-bold text-neutral">Add Custom Service/Product</h2>
        </div>
        <div className="p-6 space-y-4">
          <Input
            label="Service/Product Name*"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Special Treatment"
          />
          <Input
            label="Price (₹)*"
            type="number"
            value={price || ''}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            min="0"
          />
        </div>
        <div className="flex-shrink-0 p-4 bg-base-200 flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || price <= 0}>Add to Bill</Button>
        </div>
      </div>
    </div>
  );
};

export default CustomServiceModal;
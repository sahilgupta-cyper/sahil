import React, { useState, useEffect } from 'react';
import { Service } from '../types';
import Button from './common/Button';
import Input from './common/Input';

interface ServiceModalProps {
  service: Service | null;
  onClose: () => void;
  onSave: (service: Omit<Service, 'id'> | Service) => void;
  categories: string[];
  isProductMode?: boolean;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ service, onClose, onSave, categories, isProductMode = false }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Service['category']>(isProductMode ? 'Product' : categories[0] || '');
  const [price, setPrice] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (service) {
      setName(service.name);
      setCategory(service.category);
      setPrice(service.price);
      setDuration(service.duration);
    } else if (isProductMode) {
        setCategory('Product');
        setDuration(0);
    } else {
        setCategory(categories[0] || '');
    }
  }, [service, isProductMode, categories]);

  const handleSubmit = () => {
    if (!name || price < 0 || duration < 0) {
      setError('Please fill in all fields correctly.');
      return;
    }
    setError('');

    const serviceData = { name, category, price, duration };
    if (service) {
      onSave({ ...serviceData, id: service.id });
    } else {
      onSave(serviceData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-base-300">
          <h2 className="text-xl font-bold text-neutral font-serif">
            {service ? `Edit ${isProductMode ? 'Product' : 'Service'}` : `Add New ${isProductMode ? 'Product' : 'Service'}`}
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <Input
            label={`${isProductMode ? 'Product' : 'Service'} Name*`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={isProductMode ? "e.g., Shampoo (250ml)" : "e.g., Women's Haircut"}
          />
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Category*</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isProductMode}
              className={`w-full bg-base-100 border border-base-300 rounded-md py-2 px-3 text-neutral focus:ring-primary focus:border-primary transition-all duration-200 shadow-sm ${isProductMode ? 'bg-base-200' : ''}`}
            >
              {isProductMode ? (
                <option value="Product">Product</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))
              )}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (₹)*"
              type="number"
              value={price || ''}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              min="0"
            />
            <Input
              label="Duration (min)*"
              type="number"
              value={duration || ''}
              onChange={(e) => setDuration(parseInt(e.target.value, 10) || 0)}
              min="0"
              disabled={isProductMode}
              helpText={isProductMode ? 'Not applicable' : 'Set to 0 for products'}
              className={isProductMode ? 'bg-base-200' : ''}
            />
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
        </div>
        <div className="flex-shrink-0 p-4 bg-base-200 flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save {isProductMode ? 'Product' : 'Service'}</Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
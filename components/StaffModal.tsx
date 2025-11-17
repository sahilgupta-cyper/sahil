import React, { useState, useEffect } from 'react';
import { Staff } from '../types';
import Button from './common/Button';
import Input from './common/Input';

interface StaffModalProps {
  staffMember: Staff | null;
  onClose: () => void;
  onSave: (staffMember: Omit<Staff, 'id'> | Staff) => void;
}

const StaffModal: React.FC<StaffModalProps> = ({ staffMember, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (staffMember) {
      setName(staffMember.name);
    }
  }, [staffMember]);

  const handleSubmit = () => {
    if (!name.trim()) {
      setError('Staff name is required.');
      return;
    }
    setError('');

    const staffData = { name: name.trim() };
    if (staffMember) {
      onSave({ ...staffData, id: staffMember.id });
    } else {
      onSave(staffData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-base-300">
          <h2 className="text-xl font-bold text-neutral">
            {staffMember ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <Input
            label="Staff Name*"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Riya Sharma"
          />
          {error && <p className="text-sm text-error">{error}</p>}
        </div>
        <div className="flex-shrink-0 p-4 bg-base-200 flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Save Staff</Button>
        </div>
      </div>
    </div>
  );
};

export default StaffModal;

import React, { useState } from 'react';
import { Staff } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { PlusIcon, PencilIcon, TrashIcon } from './Icons';
import StaffModal from './StaffModal';
import ConfirmationModal from './common/ConfirmationModal';

interface StaffManagementViewProps {
  staff: Staff[];
  onAddStaff: (staffMember: Omit<Staff, 'id' | 'lastModified'>) => void;
  onUpdateStaff: (staffMember: Staff) => void;
  onDeleteStaff: (staffId: string) => void;
}

const StaffManagementView: React.FC<StaffManagementViewProps> = ({ staff, onAddStaff, onUpdateStaff, onDeleteStaff }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);

  const handleOpenModal = (staffMember: Staff | null = null) => {
    setEditingStaff(staffMember);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingStaff(null);
    setIsModalOpen(false);
  };

  const handleSaveStaff = (staffMember: Omit<Staff, 'id'> | Staff) => {
    if ('id' in staffMember) {
      onUpdateStaff(staffMember);
    } else {
      onAddStaff(staffMember);
    }
    handleCloseModal();
  };
  
  const handleConfirmDelete = () => {
    if (staffToDelete) {
      onDeleteStaff(staffToDelete.id);
      setStaffToDelete(null);
    }
  };

  return (
    <>
      {isModalOpen && (
        <StaffModal
          staffMember={editingStaff}
          onClose={handleCloseModal}
          onSave={handleSaveStaff}
        />
      )}
      <ConfirmationModal
        isOpen={!!staffToDelete}
        onClose={() => setStaffToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Staff Member"
        message={`Are you sure you want to delete "${staffToDelete?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
      />
      <Card className="p-0">
        <div className="p-6 border-b border-base-300 flex justify-between items-center">
            <h2 className="text-xl font-bold text-neutral font-serif">Staff Management</h2>
            <Button onClick={() => handleOpenModal()}>
              <PlusIcon className="w-4 h-4" /> Add New Staff
            </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-base-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Staff ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-base-100 divide-y divide-base-200">
              {staff.map((staffMember) => (
                <tr key={staffMember.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">{staffMember.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral">{staffMember.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenModal(staffMember)}><PencilIcon className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-error" onClick={() => setStaffToDelete(staffMember)}><TrashIcon className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {staff.length === 0 && (
              <div className="text-center py-10 text-secondary px-6">
                  No staff members added yet.
              </div>
            )}
        </div>
      </Card>
    </>
  );
};

export default StaffManagementView;
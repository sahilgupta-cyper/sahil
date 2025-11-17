import React, { useState } from 'react';
import { Service, Category } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { PlusIcon, PencilIcon, TrashIcon } from './Icons';
import ServiceModal from './ServiceModal';
import Input from './common/Input';
import ConfirmationModal from './common/ConfirmationModal';

interface SettingsViewProps {
  services: Service[];
  categories: Category[];
  onAddService: (service: Omit<Service, 'id' | 'lastModified'>) => void;
  onUpdateService: (service: Service) => void;
  onDeleteService: (serviceId: string) => void;
  onAddCategory: (categoryName: string) => void;
  onUpdateCategory: (oldId: string, newName: string) => void;
  onDeleteCategory: (categoryId: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = (props) => {
  const { 
    services, categories, 
    onAddService, onUpdateService, onDeleteService,
    onAddCategory, onUpdateCategory, onDeleteCategory
  } = props;
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ id: string, newName: string } | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);


  const handleOpenModal = (service: Service | null = null) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingService(null);
    setIsModalOpen(false);
  };

  const handleSaveService = (service: Omit<Service, 'id'> | Service) => {
    if ('id' in service) {
      onUpdateService(service);
    } else {
      onAddService(service);
    }
    handleCloseModal();
  };
  
  const handleAddCategory = () => {
    if (newCategory.trim()) {
        onAddCategory(newCategory.trim());
        setNewCategory('');
    }
  };

  const handleStartEditCategory = (category: Category) => {
    setEditingCategory({ id: category.id, newName: category.name });
  };
  
  const handleSaveCategoryEdit = () => {
    if (editingCategory && editingCategory.newName.trim()) {
      onUpdateCategory(editingCategory.id, editingCategory.newName.trim());
    }
    setEditingCategory(null);
  };
  
  const handleConfirmDelete = () => {
    if (serviceToDelete) {
      onDeleteService(serviceToDelete.id);
      setServiceToDelete(null);
    }
    if (categoryToDelete) {
      onDeleteCategory(categoryToDelete.id);
      setCategoryToDelete(null);
    }
  };

  return (
    <>
      {isModalOpen && (
        <ServiceModal
          service={editingService}
          onClose={handleCloseModal}
          onSave={handleSaveService}
          categories={categories.map(c => c.name)}
        />
      )}
      <ConfirmationModal
        isOpen={!!serviceToDelete || !!categoryToDelete}
        onClose={() => { setServiceToDelete(null); setCategoryToDelete(null); }}
        onConfirm={handleConfirmDelete}
        title={serviceToDelete ? "Delete Service" : "Delete Category"}
        message={`Are you sure you want to delete "${serviceToDelete?.name || categoryToDelete?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card title="Manage Services" className="p-0">
                <div className="p-6 border-b border-base-300 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-neutral font-serif">Services</h2>
                    <Button onClick={() => handleOpenModal()}>
                        <PlusIcon className="w-4 h-4" /> Add New
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                    <thead className="bg-base-200">
                        <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-base-100 divide-y divide-base-200">
                        {services.map((service) => (
                        <tr key={service.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral">{service.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">{service.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary text-right">₹{service.price}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary text-right">{service.duration > 0 ? `${service.duration} min` : '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(service)}><PencilIcon className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-error" onClick={() => setServiceToDelete(service)}><TrashIcon className="w-4 h-4" /></Button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                    {services.length === 0 && (
                        <div className="text-center py-10 text-secondary px-6">
                            No services created yet.
                        </div>
                    )}
                </div>
            </Card>
        </div>
        <div className="lg:col-span-1">
            <Card title="Manage Categories">
                <div className="space-y-4">
                    <div className="flex space-x-2">
                        <Input 
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="New category name"
                        />
                        <Button onClick={handleAddCategory}>Add</Button>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2 -mr-2">
                        {categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-2 bg-base-200 rounded-md">
                                {editingCategory?.id === cat.id ? (
                                    <Input 
                                        value={editingCategory.newName}
                                        onChange={(e) => setEditingCategory({ ...editingCategory, newName: e.target.value })}
                                        className="!py-1"
                                    />
                                ) : (
                                    <span className="text-sm font-medium text-neutral">{cat.name}</span>
                                )}
                                <div className="space-x-1">
                                    {editingCategory?.id === cat.id ? (
                                        <>
                                            <Button size="sm" onClick={handleSaveCategoryEdit}>Save</Button>
                                            <Button size="sm" variant="secondary" onClick={() => setEditingCategory(null)}>Cancel</Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button variant="ghost" size="sm" onClick={() => handleStartEditCategory(cat)}><PencilIcon className="w-4 h-4" /></Button>
                                            <Button variant="ghost" size="sm" className="text-error" onClick={() => setCategoryToDelete(cat)}><TrashIcon className="w-4 h-4" /></Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
        </div>
      </div>
    </>
  );
};

export default SettingsView;
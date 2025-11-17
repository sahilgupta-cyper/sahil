import React, { useState } from 'react';
import { Service } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { PlusIcon, PencilIcon, TrashIcon } from './Icons';
import ServiceModal from './ServiceModal';
import ConfirmationModal from './common/ConfirmationModal';

interface ProductViewProps {
  products: Service[];
  onAddService: (service: Omit<Service, 'id' | 'lastModified'>) => void;
  onUpdateService: (service: Service) => void;
  onDeleteService: (serviceId: string) => void;
}

const ProductView: React.FC<ProductViewProps> = ({ products, onAddService, onUpdateService, onDeleteService }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Service | null>(null);
  const [productToDelete, setProductToDelete] = useState<Service | null>(null);

  const handleOpenModal = (product: Service | null = null) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
    setIsModalOpen(false);
  };

  const handleSaveProduct = (product: Omit<Service, 'id'> | Service) => {
    if ('id' in product) {
      onUpdateService(product);
    } else {
      onAddService(product);
    }
    handleCloseModal();
  };
  
  const handleConfirmDelete = () => {
    if (productToDelete) {
      onDeleteService(productToDelete.id);
      setProductToDelete(null);
    }
  };

  return (
    <>
      {isModalOpen && (
        <ServiceModal
          service={editingProduct}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
          categories={['Product']}
          isProductMode={true}
        />
      )}
       <ConfirmationModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
      />
      <Card className="p-0">
        <div className="p-6 border-b border-base-300 flex justify-between items-center">
            <h2 className="text-xl font-bold text-neutral font-serif">Product Management</h2>
            <Button onClick={() => handleOpenModal()}>
              <PlusIcon className="w-4 h-4" /> Add New Product
            </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-base-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-base-100 divide-y divide-base-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary text-right">₹{product.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenModal(product)}><PencilIcon className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" className="text-error" onClick={() => setProductToDelete(product)}><TrashIcon className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
            {products.length === 0 && (
              <div className="text-center py-10 text-secondary px-6">
                  No products added yet.
              </div>
            )}
        </div>
      </Card>
    </>
  );
};

export default ProductView;

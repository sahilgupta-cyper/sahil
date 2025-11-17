import React from 'react';
import { View } from '../types';
import { UsersIcon, TagIcon, Cog6ToothIcon, ClipboardDocumentListIcon } from './Icons';

interface AddManageViewProps {
  onNavigate: (view: View) => void;
}

const ManagementCard: React.FC<{ title: string; description: string; icon: React.ReactElement<React.SVGProps<SVGSVGElement>>; onClick: () => void }> = ({ title, description, icon, onClick }) => (
  <button onClick={onClick} className="text-left p-6 bg-base-100 rounded-lg shadow-card border border-base-300 hover:border-primary hover:shadow-lg transition-all duration-200 flex items-start space-x-4 w-full">
    <div className="bg-primary/10 text-primary p-3 rounded-lg">
      {React.cloneElement(icon, { className: 'w-6 h-6' })}
    </div>
    <div>
      <h3 className="text-lg font-bold text-neutral">{title}</h3>
      <p className="text-sm text-secondary mt-1">{description}</p>
    </div>
  </button>
);

const AddManageView: React.FC<AddManageViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-neutral font-serif">Management Hub</h1>
        <p className="text-secondary mt-2">Centrally manage your salon's staff, products, services, and categories.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ManagementCard
              title="Manage Staff"
              description="Add, edit, and remove staff members from your salon roster."
              icon={<UsersIcon />}
              onClick={() => onNavigate('staff-management')}
          />
          <ManagementCard
              title="Manage Products"
              description="Control your inventory of retail products, including names and pricing."
              icon={<TagIcon />}
              onClick={() => onNavigate('products')}
          />
          <ManagementCard
              title="Manage Services & Categories"
              description="Define services, prices, durations, and organize them into categories."
              icon={<Cog6ToothIcon />}
              onClick={() => onNavigate('settings')}
          />
      </div>
    </div>
  );
};

export default AddManageView;
import React, { useState, useMemo } from 'react';
import { Enquiry } from '../types';
import Card from './common/Card';
import Button from './common/Button';
import { PlusIcon } from './Icons';
import Input from './common/Input';

interface EnquiryModalProps {
  onClose: () => void;
  onSave: (enquiry: Omit<Enquiry, 'id'|'date'|'status'|'lastModified'>) => void;
}

const EnquiryModal: React.FC<EnquiryModalProps> = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [details, setDetails] = useState('');

    const handleSubmit = () => {
        if (!name || !phone || !details) {
            // Basic validation
            return;
        }
        onSave({ name, phone, details });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-base-100 rounded-lg shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-base-300">
              <h2 className="text-xl font-bold text-neutral">Log New Enquiry</h2>
            </div>
            <div className="p-6 space-y-4">
                <Input label="Client Name*" value={name} onChange={e => setName(e.target.value)} placeholder="Enter full name" />
                <Input label="Phone Number*" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91..." />
                <textarea 
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                    rows={4}
                    className="w-full bg-base-100 border border-base-300 rounded-md p-3 text-neutral placeholder-secondary/60 focus:ring-primary focus:border-primary transition-all duration-200"
                    placeholder="Enter details about the enquiry..."
                ></textarea>
            </div>
            <div className="flex-shrink-0 p-4 bg-base-200 flex justify-end space-x-2">
              <Button variant="secondary" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSubmit}>Log Enquiry</Button>
            </div>
          </div>
        </div>
    );
};

interface EnquiryViewProps {
  enquiries: Enquiry[];
  onAddEnquiry: (enquiry: Omit<Enquiry, 'id'|'date'|'status'|'lastModified'>) => void;
  onUpdateEnquiry: (enquiry: Enquiry) => void;
}

const EnquiryView: React.FC<EnquiryViewProps> = ({ enquiries, onAddEnquiry, onUpdateEnquiry }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState<'All' | Enquiry['status']>('All');
  
  const filteredEnquiries = useMemo(() =>
    activeStatus === 'All' ? enquiries : enquiries.filter(e => e.status === activeStatus),
    [enquiries, activeStatus]
  );
  
  const statusOptions: Enquiry['status'][] = ['Pending', 'Followed-up', 'Closed'];

  return (
    <>
      {isModalOpen && <EnquiryModal onClose={() => setIsModalOpen(false)} onSave={onAddEnquiry} />}
      <Card className="p-0">
        <div className="p-6 border-b border-base-300 flex justify-between items-center">
            <h2 className="text-xl font-bold text-neutral font-serif">Enquiry Management</h2>
             <Button onClick={() => setIsModalOpen(true)}>
                <PlusIcon className="w-4 h-4" /> Log New Enquiry
             </Button>
        </div>
        <div className="p-4 border-b border-base-300 flex space-x-2">
          {(['All', ...statusOptions] as const).map(status => (
              <button key={status} onClick={() => setActiveStatus(status)} className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors ${activeStatus === status ? 'bg-primary text-white' : 'bg-base-200 hover:bg-base-300'}`}>
                  {status}
              </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-base-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-base-100 divide-y divide-base-200">
              {filteredEnquiries.map((enquiry) => (
                <tr key={enquiry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">{new Date(enquiry.date).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral">
                      <div>{enquiry.name}</div>
                      <div className="text-xs text-secondary">{enquiry.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-secondary max-w-sm whitespace-normal">{enquiry.details}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <select 
                      value={enquiry.status} 
                      onChange={e => onUpdateEnquiry({ ...enquiry, status: e.target.value as Enquiry['status'] })}
                      className="bg-base-100 border border-base-300 rounded-md p-1 focus:ring-primary focus:border-primary"
                    >
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
           {filteredEnquiries.length === 0 && (
              <div className="text-center py-10 text-secondary">
                  No enquiries found.
              </div>
           )}
        </div>
      </Card>
    </>
  );
};

export default EnquiryView;
import React, { useState, useMemo } from 'react';
import { Client, Service, Staff, Appointment } from '../types';
import Button from './common/Button';
import Input from './common/Input';
import { SearchIcon, PlusIcon } from './Icons';

interface AppointmentModalProps {
  clients: Client[];
  services: Service[];
  staff: Staff[];
  onAddAppointment: (appointment: Omit<Appointment, 'id'| 'lastModified'>) => void;
  onAddClient: (client: Omit<Client, 'id'|'lastModified'>) => void;
  onClose: () => void;
  showToast: (message: string) => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ clients, services, staff, onAddAppointment, onAddClient, onClose, showToast }) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientSearch, setClientSearch] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>(staff[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00');
  const [notes, setNotes] = useState('');

  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

  const filteredClients = useMemo(() =>
    clientSearch ? clients.filter(c =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      c.phone.includes(clientSearch)
    ) : [], [clients, clientSearch]);

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setClientSearch('');
  };

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const handleShowAddClientForm = () => {
    setIsAddingClient(true);
    setNewClientName(clientSearch);
  };

  const handleSaveNewClient = () => {
    if (!newClientName || !newClientPhone) {
      showToast("Name and Phone are required for a new client.");
      return;
    }
    const formattedPhone = `+91${newClientPhone.replace(/\D/g, '').slice(-10)}`;
    if (clients.some(c => c.phone === formattedPhone)) {
        showToast('A client with this phone number already exists.');
        return;
    }

    const newClientData = {
      name: newClientName,
      phone: formattedPhone,
      serviceHistory: [],
      notes: ''
    };
    onAddClient(newClientData);
    setSelectedClient({ ...newClientData, id: formattedPhone });
    setIsAddingClient(false);
    setNewClientName('');
    setNewClientPhone('');
    setClientSearch('');
  };

  const handleSubmit = () => {
    if (!selectedClient || selectedServices.length === 0 || !selectedStaffId || !date || !time) {
        showToast('Please fill all required fields.');
        return;
    }
    
    const totalDuration = selectedServices.reduce((total, id) => {
        const service = services.find(s => s.id === id);
        return total + (service?.duration || 0);
    }, 0);

    const startDate = new Date(`${date}T${time}:00`);
    const endDate = new Date(startDate.getTime() + totalDuration * 60000);

    const newAppointment: Omit<Appointment, 'id' | 'lastModified'> = {
      clientId: selectedClient.id,
      serviceIds: selectedServices,
      staffId: selectedStaffId,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      status: 'confirmed',
      notes: notes
    };

    onAddAppointment(newAppointment);
    onClose();
  };
  
  const bookableServices = services.filter(s => s.duration > 0);
  const showAddNewClientButton = clientSearch.length > 0 && filteredClients.length === 0 && !isAddingClient;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-base-100 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-base-300">
          <h2 className="text-xl font-bold text-neutral font-serif">Book New Appointment</h2>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Client*</label>
            {selectedClient ? (
              <div className="flex justify-between items-center p-3 bg-base-200 rounded-md">
                <p className="font-semibold text-neutral">{selectedClient.name}</p>
                <Button variant="ghost" size="sm" onClick={() => setSelectedClient(null)}>Change</Button>
              </div>
            ) : (
              <div className="relative">
                <Input placeholder="Search Client by Name/Phone" icon={<SearchIcon />} value={clientSearch} onChange={e => setClientSearch(e.target.value)} />
                {clientSearch.length > 0 && !isAddingClient && (
                  <div className="absolute z-10 w-full mt-1 bg-base-100 border border-base-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredClients.map(client => (
                      <div key={client.id} onClick={() => handleClientSelect(client)} className="px-4 py-2 cursor-pointer hover:bg-base-200">
                        <p className="text-neutral">{client.name}</p>
                      </div>
                    ))}
                     {showAddNewClientButton && (
                        <div className="text-center p-2 border-t border-base-300">
                           <Button variant="secondary" size="sm" onClick={handleShowAddClientForm}>
                            <PlusIcon className="w-4 h-4" /> Add "{clientSearch}"
                           </Button>
                        </div>
                    )}
                  </div>
                )}
                 {isAddingClient && (
                    <div className="p-4 bg-base-200 rounded-md mt-2 space-y-3 border border-primary">
                        <h4 className="font-semibold text-neutral">New Client Details</h4>
                        <Input placeholder="Client Name*" value={newClientName} onChange={e => setNewClientName(e.target.value)} />
                        <Input placeholder="10-digit Phone Number*" type="tel" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} />
                        <div className="flex gap-2 justify-end">
                            <Button variant="secondary" onClick={() => setIsAddingClient(false)}>Cancel</Button>
                            <Button onClick={handleSaveNewClient}>Save & Select Client</Button>
                        </div>
                    </div>
                )}
              </div>
            )}
          </div>

          {/* Service Selection */}
          <div>
              <label className="block text-sm font-medium text-secondary mb-1">Services*</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-base-200 rounded-md max-h-48 overflow-y-auto">
                  {bookableServices.map(service => (
                      <label key={service.id} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-base-300">
                          <input type="checkbox" checked={selectedServices.includes(service.id)} onChange={() => handleServiceToggle(service.id)} className="form-checkbox bg-base-100 border-secondary/50 text-primary focus:ring-primary rounded" />
                          <span className="text-neutral text-sm">{service.name}</span>
                      </label>
                  ))}
              </div>
          </div>
          
          {/* Staff, Date, Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Staff*</label>
              <select value={selectedStaffId} onChange={(e) => setSelectedStaffId(e.target.value)} className="w-full bg-base-100 border border-base-300 rounded-md py-2 px-3 text-neutral focus:ring-primary focus:border-primary transition-all duration-200 shadow-sm">
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <Input label="Date*" type="date" value={date} onChange={e => setDate(e.target.value)} />
            <Input label="Time*" type="time" value={time} onChange={e => setTime(e.target.value)} />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Notes (optional)</label>
            <textarea placeholder="Any special requests or notes..." value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-base-100 border border-base-300 rounded-md py-2 px-3 text-neutral placeholder-secondary/60 focus:ring-primary focus:border-primary transition-all duration-200 shadow-sm" rows={3}/>
          </div>
        </div>
        <div className="flex-shrink-0 p-4 bg-base-200 flex justify-end space-x-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Book Appointment</Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;
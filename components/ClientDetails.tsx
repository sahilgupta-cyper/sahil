import React, { useState, useMemo } from 'react';
import { Client, Service, Transaction, Appointment } from '../types';
import Button from './common/Button';
import Card from './common/Card';
import Input from './common/Input';
import { ChevronLeftIcon } from './Icons';

interface ClientDetailsProps {
  client: Client;
  transactions: Transaction[];
  appointments: Appointment[];
  services: Service[];
  onBack: () => void;
  canGoBack: boolean;
  onSave: (client: Client) => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ client, transactions, appointments, services, onBack, canGoBack, onSave }) => {
  const [name, setName] = useState(client.name);
  const [notes, setNotes] = useState(client.notes);
  const [isEditing, setIsEditing] = useState(false);

  const sortedTransactions = useMemo(() =>
    [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(b.date).getTime()),
    [transactions]
  );
  
  const upcomingAppointments = useMemo(() =>
    appointments
      .filter(a => new Date(a.start) > new Date())
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [appointments]
  );

  const handleSave = () => {
    onSave({ ...client, name, notes });
    setIsEditing(false);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
             {canGoBack && (
                <button onClick={onBack} className="p-1 rounded-full hover:bg-base-300 transition-colors" aria-label="Go back">
                    <ChevronLeftIcon className="w-6 h-6 text-secondary" />
                </button>
            )}
            <h1 className="text-3xl font-bold text-neutral font-serif">{isEditing ? 'Editing Client' : client.name}</h1>
        </div>
         {isEditing ? (
            <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
            </div>
        ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Client</Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
              <div className="flex justify-between items-start">
                  <div>
                      {isEditing ? (
                          <Input 
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="text-2xl font-bold !p-0 !bg-transparent !border-0 focus:!ring-0"
                          />
                      ) : (
                          <h2 className="text-2xl font-bold text-neutral font-serif">{client.name}</h2>
                      )}
                      <p className="text-secondary">{client.phone}</p>
                  </div>
              </div>
              <div className="mt-6">
                  <h3 className="text-md font-semibold text-neutral mb-2">Stylist/Personal Notes</h3>
                  {isEditing ? (
                      <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={4}
                          className="w-full bg-base-100 border border-base-300 rounded-md p-3 text-neutral placeholder-secondary/60 focus:ring-primary focus:border-primary transition-all duration-200"
                          placeholder="e.g., Prefers less volume, allergic to product X"
                      ></textarea>
                  ) : (
                      <p className="text-secondary whitespace-pre-wrap min-h-[50px] bg-base-200 p-3 rounded-md">{notes || 'No notes added.'}</p>
                  )}
              </div>
          </Card>
          
          <Card title="Service History">
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 -mr-2">
                {sortedTransactions.length > 0 ? sortedTransactions.map(tx => (
                    <div key={tx.id} className="p-4 bg-base-200 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <p className="font-semibold text-primary">{new Date(tx.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p className="font-bold text-lg text-neutral">₹{tx.total.toFixed(2)}</p>
                        </div>
                        <ul className="list-disc list-inside text-secondary text-sm space-y-1">
                            {tx.items.map((item, index) => (
                                <li key={index}>{item.name}</li>
                            ))}
                        </ul>
                    </div>
                )) : <p className="text-secondary">No service history found for this client.</p>}
            </div>
          </Card>
        </div>
        <div className="md:col-span-1">
          <Card title="Upcoming Appointments">
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 -mr-2">
                  {upcomingAppointments.length > 0 ? upcomingAppointments.map(app => (
                      <div key={app.id} className="p-4 bg-base-200 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                              <p className="font-semibold text-primary">{new Date(app.start).toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}</p>
                              <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${app.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {app.status}
                              </span>
                          </div>
                          <p className="text-sm text-secondary">{new Date(app.start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                          <ul className="list-disc list-inside text-secondary text-sm space-y-1 mt-2">
                              {app.serviceIds.map((id, index) => {
                                  const service = services.find(s => s.id === id);
                                  return <li key={index}>{service?.name || 'Unknown Service'}</li>
                              })}
                          </ul>
                      </div>
                  )) : <p className="text-secondary text-center py-8">No upcoming appointments.</p>}
              </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default ClientDetails;
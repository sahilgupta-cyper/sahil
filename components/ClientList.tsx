import React, { useState, useMemo } from 'react';
import { Client } from '../types';
import Card from './common/Card';
import Input from './common/Input';
import { SearchIcon } from './Icons';
import Button from './common/Button';

interface ClientListProps {
  clients: Client[];
  onViewClient: (clientId: string) => void;
  onStartBill: (clientId: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onViewClient, onStartBill }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = useMemo(() =>
    clients.filter(client =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm)
    ).sort((a, b) => a.name.localeCompare(b.name)),
    [clients, searchTerm]
  );

  return (
    <Card className="p-0">
      <div className="p-6 border-b border-base-300">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <h2 className="text-xl font-bold text-neutral font-serif">Client Management</h2>
            <div className="w-full sm:max-w-sm">
                 <Input 
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    icon={<SearchIcon />}
                />
            </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-base-300">
          <thead className="bg-base-200">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Contact</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Visits</th>
              <th scope="col" className="relative px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-base-100 divide-y divide-base-200">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-base-200 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral">{client.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">{client.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">{client.serviceHistory?.length || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => onViewClient(client.id)}>
                      View
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => onStartBill(client.id)}>
                      Bill
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredClients.length === 0 && (
            <div className="text-center py-10 text-secondary">
                No clients found matching your search.
            </div>
        )}
      </div>
    </Card>
  );
};

export default ClientList;
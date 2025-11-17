import React, { useState, useMemo, useEffect } from 'react';
import { Client, Service, Staff, Transaction, BillItem, Category } from '../types';
import Button from './common/Button';
import Card from './common/Card';
import Input from './common/Input';
import { SearchIcon, PlusIcon, TrashIcon, UsersIcon, XCircleIcon } from './Icons';
import InvoiceModal from './InvoiceModal';
import BillingMessageModal from './BillingMessageModal';
import CustomServiceModal from './CustomServiceModal';
import PaymentSuccessModal from './PaymentSuccessModal';

interface POSViewProps {
  clients: Client[];
  services: Service[];
  staff: Staff[];
  categories: Category[];
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'lastModified'>) => void;
  onAddClient: (client: Omit<Client, 'id' | 'lastModified'>) => void;
  showToast: (message: string) => void;
  initialClient: Client | null;
  initialBillItems: BillItem[] | null;
  onLoadComplete: () => void;
}

const POSView: React.FC<POSViewProps> = ({ clients, services, staff, categories, onAddTransaction, onAddClient, showToast, initialClient, initialBillItems, onLoadComplete }) => {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>('amount');
  const [discountValue, setDiscountValue] = useState(0);
  const [customSubtotal, setCustomSubtotal] = useState<number | null>(null);
  
  const [clientSearch, setClientSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | 'All'>('All');

  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientNotes, setNewClientNotes] = useState('');

  const [isCustomServiceModalOpen, setIsCustomServiceModalOpen] = useState(false);
  const [invoice, setInvoice] = useState<Transaction | null>(null);
  const [transactionForSms, setTransactionForSms] = useState<Transaction | null>(null);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  useEffect(() => {
    if (initialClient) {
      setSelectedClient(initialClient);
    }
    if (initialBillItems) {
      setBillItems(initialBillItems);
    }
    if (initialClient || initialBillItems) {
      onLoadComplete();
    }
  }, [initialClient, initialBillItems, onLoadComplete]);

  const filteredClients = useMemo(() => 
    clientSearch ? clients.filter(c => 
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) || 
      c.phone.includes(clientSearch)
    ) : [], [clients, clientSearch]);

  const filteredServices = useMemo(() => 
    services.filter(s => 
      (activeCategory === 'All' || s.category === activeCategory) &&
      (s.name.toLowerCase().includes(serviceSearch.toLowerCase()))
    ), [services, serviceSearch, activeCategory]);

  const itemsSubtotal = useMemo(() => billItems.reduce((acc, item) => acc + item.price, 0), [billItems]);
  const subtotal = customSubtotal ?? itemsSubtotal;
  
  const discountAmount = useMemo(() => {
    if (discountType === 'amount') return discountValue;
    return (subtotal * discountValue) / 100;
  }, [discountType, discountValue, subtotal]);

  const total = subtotal - discountAmount;

  const handleAddService = (service: Service) => {
    setBillItems([...billItems, {
        serviceId: service.id,
        name: service.name,
        staffId: staff.length > 0 ? staff[0].id : '',
        price: service.price
    }]);
  };
  
  const handleAddCustomService = (item: { name: string; price: number }) => {
    const customItem: BillItem = {
      serviceId: `custom-${Date.now()}`,
      name: item.name,
      staffId: staff.length > 0 ? staff[0].id : '',
      price: item.price
    };
    setBillItems([...billItems, customItem]);
  };

  const handleRemoveItem = (index: number) => {
    setBillItems(billItems.filter((_, i) => i !== index));
  };

  const handleStaffChange = (index: number, staffId: string) => {
    const newItems = [...billItems];
    newItems[index].staffId = staffId;
    setBillItems(newItems);
  };
  
  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setClientSearch('');
  };

  const handleAddNewClient = () => {
    if (!newClientName || !newClientPhone) {
        showToast("Name and Phone are required.");
        return;
    }
    const formattedPhone = `+91${newClientPhone.replace(/\D/g, '').slice(-10)}`;

    const existingClient = clients.find(c => c.phone === formattedPhone);
    if (existingClient) {
        if (window.confirm(`Client "${existingClient.name}" already exists with this phone number. Would you like to select this client for the current bill?`)) {
            handleClientSelect(existingClient);
            setIsAddingClient(false);
            setNewClientName('');
            setNewClientPhone('');
            setNewClientNotes('');
        }
        return;
    }

    const newClient = {
      name: newClientName,
      phone: formattedPhone,
      serviceHistory: [],
      notes: newClientNotes
    };
    onAddClient(newClient);
    setSelectedClient({ ...newClient, id: newClient.phone });
    setIsAddingClient(false);
    setNewClientName('');
    setNewClientPhone('');
    setNewClientNotes('');
  };

  const resetState = () => {
    setSelectedClient(null);
    setBillItems([]);
    setDiscountType('amount');
    setDiscountValue(0);
    setClientSearch('');
    setServiceSearch('');
    setCustomSubtotal(null);
  };

  const handleFinalizeTransaction = (paymentMethod: 'Cash' | 'Card' | 'UPI') => {
    if (billItems.length === 0) {
        showToast("Cannot create an empty bill.");
        return;
    }

    const transaction: Omit<Transaction, 'id' | 'lastModified'> = {
      clientId: selectedClient ? selectedClient.id : null,
      items: billItems,
      itemsSubtotal: itemsSubtotal,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      taxAmount: 0,
      total,
      paymentMethod,
      date: new Date().toISOString()
    };
    onAddTransaction(transaction);

    const fullTransaction: Transaction = {
      ...transaction,
      id: `T-${Date.now()}` // Temporary ID for modal use
    }
    
    if (selectedClient) {
      setTransactionForSms(fullTransaction);
    } else {
      setCompletedTransaction(fullTransaction);
      setShowPaymentSuccess(true);
    }

    resetState();
  };
  
  const handlePostMessageStep = () => {
    setCompletedTransaction(transactionForSms);
    setShowPaymentSuccess(true);
    setTransactionForSms(null);
  };

  const handlePaymentSuccessModalClose = () => {
    setShowPaymentSuccess(false);
    if (completedTransaction) {
        setInvoice(completedTransaction);
    }
    setCompletedTransaction(null);
  };
  
  const clientForSms = clients.find(c => c.id === transactionForSms?.clientId);
  const serviceCategories: (string | 'All')[] = ['All', ...categories.map(c => c.name), 'Product'];


  return (
    <div className="h-full w-full">
       <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
          {isCustomServiceModalOpen && <CustomServiceModal onClose={() => setIsCustomServiceModalOpen(false)} onSave={handleAddCustomService} />}
          {transactionForSms && clientForSms && (
            <BillingMessageModal 
              transaction={transactionForSms}
              client={clientForSms}
              services={services}
              onSend={handlePostMessageStep}
              onClose={handlePostMessageStep}
              showToast={showToast}
            />
          )}
          {showPaymentSuccess && completedTransaction && (
              <PaymentSuccessModal onClose={handlePaymentSuccessModalClose} />
          )}
          {invoice && <InvoiceModal transaction={invoice} services={services} client={clients.find(c => c.id === invoice.clientId)} onClose={() => setInvoice(null)} />}
          
          {/* Middle: Services Catalog */}
          <div className="lg:col-span-3 flex flex-col h-full min-h-[400px]">
              <Card className="flex-1 flex flex-col p-0">
                <div className="flex-shrink-0 p-4 sm:p-6 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 border-b border-base-300">
                    <div className="flex-grow w-full">
                        <Input 
                            placeholder="Search for services..." 
                            icon={<SearchIcon/>}
                            value={serviceSearch}
                            onChange={(e) => setServiceSearch(e.target.value)}
                        />
                    </div>
                    <div className="w-full sm:w-auto flex space-x-2">
                        <Button variant="secondary" onClick={() => setIsCustomServiceModalOpen(true)} className="flex-1 sm:flex-none">
                            Custom
                        </Button>
                        <select
                            value={activeCategory}
                            onChange={(e) => setActiveCategory(e.target.value)}
                            className="flex-1 sm:flex-none w-full bg-base-100 border border-base-300 rounded-md py-2.5 px-3 text-neutral focus:ring-primary focus:border-primary transition-all duration-200 shadow-sm appearance-none"
                        >
                            {serviceCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredServices.map(service => (
                            <div key={service.id} className="relative bg-primary/5 p-3 rounded-lg text-left border border-primary/20 hover:border-primary hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => handleAddService(service)}>
                                <p className="font-semibold text-neutral truncate">{service.name}</p>
                                <p className="text-sm text-secondary">{service.category}</p>
                                <p className="text-md font-bold text-primary mt-2">₹{service.price.toLocaleString('en-IN')}</p>
                                <div className="absolute top-2 right-2">
                                    <button onClick={(e) => { e.stopPropagation(); handleAddService(service); }} className="bg-primary text-white rounded-full p-1.5 hover:bg-primary-focus transition-colors" aria-label={`Add ${service.name} to bill`}>
                                        <PlusIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>
          </div>

          {/* Right Side: Billing */}
          <div className="lg:col-span-2 flex flex-col h-full min-h-[500px]">
              <Card className="flex-1 flex flex-col p-0">
                  {/* Client Section */}
                  <div className="p-4 border-b border-base-300">
                      <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><UsersIcon className="w-5 h-5" /> Client</h3>
                      <div className="relative">
                          <Input 
                              placeholder="Search Client or Add New" 
                              icon={<SearchIcon/>}
                              value={clientSearch}
                              onChange={(e) => {
                                  setClientSearch(e.target.value);
                                  if (selectedClient) setSelectedClient(null);
                              }}
                          />
                          {filteredClients.length > 0 && (
                              <div className="absolute z-10 w-full mt-1 bg-base-100 border border-base-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                                  {filteredClients.map(client => (
                                      <div key={client.phone} onClick={() => handleClientSelect(client)} className="px-4 py-2 cursor-pointer hover:bg-base-200">
                                          <p className="text-neutral">{client.name}</p>
                                          <p className="text-sm text-secondary">{client.phone}</p>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>

                      {selectedClient ? (
                          <div className="flex justify-between items-center p-3 mt-2 bg-base-200 rounded-md">
                              <div>
                                  <p className="font-semibold text-neutral">{selectedClient.name}</p>
                                  <p className="text-sm text-secondary">{selectedClient.phone}</p>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => setSelectedClient(null)}>Change</Button>
                          </div>
                      ) : (
                          <div className="mt-2">
                            <Button variant="secondary" onClick={() => setIsAddingClient(!isAddingClient)} className="w-full">
                              <PlusIcon className="w-4 h-4" /> {isAddingClient ? 'Cancel' : 'Add New Client'}
                            </Button>
                            {isAddingClient && (
                              <div className="mt-4 p-4 bg-base-200 rounded-md space-y-3">
                                  <Input placeholder="Client Name*" value={newClientName} onChange={e => setNewClientName(e.target.value)} />
                                  <Input placeholder="10-digit Phone Number*" type="tel" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} />
                                  <textarea
                                      placeholder="Notes (e.g., allergies, preferences)"
                                      value={newClientNotes}
                                      onChange={e => setNewClientNotes(e.target.value)}
                                      rows={3}
                                      className="w-full bg-base-100 border border-base-300 rounded-md py-2 px-3 text-neutral placeholder-secondary/60 focus:ring-primary focus:border-primary transition-all duration-200 shadow-sm"
                                  />
                                  <Button onClick={handleAddNewClient} className="w-full">Save Client</Button>
                              </div>
                            )}
                          </div>
                      )}
                  </div>


                  {/* Bill Items Section */}
                  <div className="flex-1 overflow-y-auto p-4">
                      {billItems.length === 0 ? (
                          <div className="flex items-center justify-center h-full text-secondary">Select services to start billing</div>
                      ) : (
                          <div className="space-y-3">
                          {billItems.map((item, index) => (
                              <div key={`${item.serviceId}-${index}`} className="flex items-center justify-between text-sm">
                                  <div className="flex-1">
                                      <p className="text-neutral font-medium">{item.name}</p>
                                      <select value={item.staffId} onChange={e => handleStaffChange(index, e.target.value)} className="bg-transparent text-xs text-secondary focus:outline-none -ml-1" disabled={staff.length === 0}>
                                          {staff.length === 0 ? (
                                              <option value="">No Staff Available</option>
                                          ) : (
                                              staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)
                                          )}
                                      </select>
                                  </div>
                                  <p className="text-neutral font-medium w-20 text-right">₹{item.price}</p>
                                  <button onClick={() => handleRemoveItem(index)} className="ml-2 text-error hover:text-red-400"><TrashIcon className="w-4 h-4"/></button>
                              </div>
                          ))}
                          </div>
                      )}
                  </div>

                  {/* Billing Summary Section */}
                  <div className="p-4 border-t border-base-300">
                      <div className="flex items-center space-x-2 mb-4">
                          <div className="flex-1">
                              <Input 
                                  type="number" 
                                  placeholder="Discount" 
                                  value={discountValue || ''}
                                  onChange={e => setDiscountValue(parseFloat(e.target.value) || 0)}
                              />
                          </div>
                          <div className="flex bg-base-200 rounded-md p-1">
                              <button onClick={() => setDiscountType('amount')} className={`px-3 py-1 rounded-md text-sm ${discountType === 'amount' ? 'bg-primary text-white' : 'text-secondary'}`}>₹</button>
                              <button onClick={() => setDiscountType('percentage')} className={`px-3 py-1 rounded-md text-sm ${discountType === 'percentage' ? 'bg-primary text-white' : 'text-secondary'}`}>%</button>
                          </div>
                      </div>

                      <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                              <span className="text-secondary">Subtotal</span>
                              <div className="flex items-center gap-1">
                                  {customSubtotal !== null && (
                                      <button onClick={() => setCustomSubtotal(null)} title="Reset to calculated subtotal" className="text-secondary hover:text-error">
                                          <XCircleIcon className="w-4 h-4" />
                                      </button>
                                  )}
                                  <span className="font-semibold">₹</span>
                                  <input
                                      type="number"
                                      value={subtotal.toFixed(2)}
                                      onChange={e => {
                                          const val = parseFloat(e.target.value);
                                          if (e.target.value === '' || isNaN(val)) {
                                              setCustomSubtotal(null);
                                          } else {
                                              setCustomSubtotal(val);
                                          }
                                      }}
                                      className={`w-24 text-right font-semibold rounded-md px-1 py-0.5 outline-none transition-colors ${
                                          customSubtotal !== null
                                          ? 'bg-yellow-100 text-yellow-900 ring-1 ring-yellow-400'
                                          : 'bg-transparent'
                                      } focus:bg-base-200 focus:ring-1 focus:ring-primary`}
                                      disabled={billItems.length === 0}
                                  />
                              </div>
                          </div>
                          <div className="flex justify-between"><span className="text-secondary">Discount</span><span className="text-error">- ₹{discountAmount.toFixed(2)}</span></div>
                      </div>
                      <div className="flex justify-between font-bold text-xl pt-2 border-t border-base-300 mt-3">
                          <span className="text-primary">Total</span>
                          <span className="text-primary">₹{Math.round(total).toFixed(2)}</span>
                      </div>
                  </div>

                  {/* Payment Section */}
                  <div className="p-4 mt-auto border-t border-base-300 grid grid-cols-3 gap-2">
                      <Button variant="secondary" onClick={() => handleFinalizeTransaction('Cash')}>Cash</Button>
                      <Button variant="secondary" onClick={() => handleFinalizeTransaction('Card')}>Card</Button>
                      <Button variant="secondary" onClick={() => handleFinalizeTransaction('UPI')}>UPI</Button>
                  </div>
              </Card>
          </div>
      </div>
    </div>
  );
};

export default POSView;
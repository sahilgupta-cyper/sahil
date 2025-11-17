

import React, { useState, useEffect } from 'react';
import { useSyncedStore } from './hooks/useSyncedStore';
import { Client, Service, Staff, Transaction, View, Appointment, Enquiry, Feedback, BillItem, Category } from './types';
import { INITIAL_SERVICES, INITIAL_STAFF, SALON_BRANCH, INITIAL_CATEGORIES, SALON_NAME } from './constants';
import POSView from './components/POSView';
import ClientList from './components/ClientList';
import ClientDetails from './components/ClientDetails';
import AppointmentView from './components/AppointmentView';
import DashboardView from './components/DashboardView';
import SettingsView from './components/SettingsView';
import EnquiryView from './components/EnquiryView';
import FeedbackView from './components/FeedbackView';
import ProductView from './components/ProductView';
import Toast from './components/common/Toast';
import { UsersIcon, DocumentTextIcon, CalendarDaysIcon, DashboardIcon, ChatBubbleLeftRightIcon, TagIcon, ChartBarIcon, PlusCircleIcon, ClipboardDocumentListIcon, Bars3Icon, XMarkIcon } from './components/Icons';
import AddManageView from './components/AddManageView';
import StaffManagementView from './components/StaffManagementView';
import ReportsView from './components/ReportsView';
import AppointmentModal from './components/AppointmentModal';

const App: React.FC = () => {
  const [history, setHistory] = useState<View[]>(['dashboard']);
  const view = history[history.length - 1];

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [billingClient, setBillingClient] = useState<Client | null>(null);
  const [prefilledBillItems, setPrefilledBillItems] = useState<BillItem[] | null>(null);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [clients, setClients] = useSyncedStore<Client>('clients', []);
  const [services, setServices] = useSyncedStore<Service>('services', INITIAL_SERVICES);
  const [staff, setStaff] = useSyncedStore<Staff>('staff', INITIAL_STAFF);
  const [transactions, setTransactions] = useSyncedStore<Transaction>('transactions', []);
  const [appointments, setAppointments] = useSyncedStore<Appointment>('appointments', []);
  const [enquiries, setEnquiries] = useSyncedStore<Enquiry>('enquiries', []);
  const [feedbacks, setFeedbacks] = useSyncedStore<Feedback>('feedbacks', []);
  const [categories, setCategories] = useSyncedStore<Category>('categories', INITIAL_CATEGORIES);

  useEffect(() => {
      setIsMobileMenuOpen(false);
  }, [view]);

  const navigate = (newView: View, fromNav: boolean = false) => {
      if (newView === view && !fromNav) return;
      
      if (fromNav) {
          setHistory([newView]); // Reset history when using main nav
      } else {
          setHistory(prev => [...prev, newView]);
      }
  };

  const goBack = () => {
      if (history.length > 1) {
          setHistory(prev => prev.slice(0, -1));
      } else {
          setHistory(['dashboard']); // Fallback to dashboard
      }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAddClient = (client: Omit<Client, 'id' | 'lastModified'>) => {
    if (clients.some(c => c.phone === client.phone)) {
      showToast('Client with this phone number already exists.');
      return;
    }
    const newClient: Client = {
      ...client,
      id: client.phone,
      lastModified: new Date().toISOString()
    }
    setClients(prev => [...prev, newClient]);
    showToast('Client added successfully!');
  };

  const handleUpdateClient = (updatedClient: Client) => {
    const clientWithTimestamp = { ...updatedClient, lastModified: new Date().toISOString() };
    setClients(prev => prev.map(c => c.id === clientWithTimestamp.id ? clientWithTimestamp : c));
    showToast('Client details saved.');
  };
  
  const handleAddTransaction = (transaction: Omit<Transaction, 'id' | 'lastModified'>) => {
    const newTransaction: Transaction = {
        ...transaction,
        id: `T-${Date.now()}`,
        lastModified: new Date().toISOString()
    };
    setTransactions(prev => [newTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    if (newTransaction.clientId) {
      const client = clients.find(c => c.id === newTransaction.clientId);
      if (client) {
        const updatedClient: Client = {
          ...client,
          serviceHistory: [...(client.serviceHistory || []), newTransaction.id],
          lastModified: new Date().toISOString()
        };
        handleUpdateClient(updatedClient);
      }
    }
  };
  
  const handleAddAppointment = (appointment: Omit<Appointment, 'id' | 'lastModified'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: `APP-${Date.now()}`,
      lastModified: new Date().toISOString()
    };
    setAppointments(prev => [newAppointment, ...prev].sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime()));
    showToast('Appointment booked successfully!');
  };

  const handleUpdateAppointment = (updatedAppointment: Appointment) => {
      const appointmentWithTimestamp = { ...updatedAppointment, lastModified: new Date().toISOString() };
      setAppointments(prev => prev.map(a => a.id === appointmentWithTimestamp.id ? appointmentWithTimestamp : a));
      showToast(`Appointment status updated to ${updatedAppointment.status}.`);
  };

  const handleAddService = (service: Omit<Service, 'id' | 'lastModified'>) => {
    const newService: Service = { ...service, id: `S-${Date.now()}`, lastModified: new Date().toISOString()};
    setServices(prev => [...prev, newService]);
    showToast('Service or Product added successfully!');
  };
  
  const handleUpdateService = (updatedService: Service) => {
    const serviceWithTimestamp = { ...updatedService, lastModified: new Date().toISOString() };
    setServices(prev => prev.map(s => s.id === serviceWithTimestamp.id ? serviceWithTimestamp : s));
    showToast('Service or Product updated successfully!');
  };

  const handleDeleteService = (serviceId: string) => {
    setServices(prev => prev.filter(s => s.id !== serviceId));
    showToast('Service or Product deleted.');
  };

  const handleAddStaff = (staffMember: Omit<Staff, 'id' | 'lastModified'>) => {
    const newStaffMember: Staff = { ...staffMember, id: `E-${Date.now()}`, lastModified: new Date().toISOString() };
    setStaff(prev => [...prev, newStaffMember]);
    showToast('Staff member added successfully!');
  };

  const handleUpdateStaff = (updatedStaff: Staff) => {
    const staffWithTimestamp = { ...updatedStaff, lastModified: new Date().toISOString() };
    setStaff(prev => prev.map(s => (s.id === staffWithTimestamp.id ? staffWithTimestamp : s)));
    showToast('Staff details updated successfully!');
  };

  const handleDeleteStaff = (staffId: string) => {
    const isStaffAssigned = appointments.some(app => app.staffId === staffId && new Date(app.start) > new Date());
    if (isStaffAssigned) {
      showToast('Cannot delete staff member. They are assigned to upcoming appointments.');
      return;
    }
    setStaff(prev => prev.filter(s => s.id !== staffId));
    showToast('Staff member deleted.');
  };

  const handleAddEnquiry = (enquiry: Omit<Enquiry, 'id' | 'date' | 'status' | 'lastModified'>) => {
    const newEnquiry: Enquiry = {
      ...enquiry,
      id: `ENQ-${Date.now()}`,
      date: new Date().toISOString(),
      status: 'Pending',
      lastModified: new Date().toISOString()
    };
    setEnquiries(prev => [newEnquiry, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    showToast('Enquiry logged successfully!');
  };

  const handleUpdateEnquiry = (updatedEnquiry: Enquiry) => {
    const enquiryWithTimestamp = { ...updatedEnquiry, lastModified: new Date().toISOString() };
    setEnquiries(prev => prev.map(e => e.id === enquiryWithTimestamp.id ? enquiryWithTimestamp : e));
    showToast(`Enquiry status updated to ${updatedEnquiry.status}.`);
  };

  const handleAddFeedback = (feedback: Omit<Feedback, 'id' | 'date' | 'lastModified'>) => {
    const newFeedback: Feedback = {
      ...feedback,
      id: `FB-${Date.now()}`,
      date: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    setFeedbacks(prev => [newFeedback, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    showToast('Thank you for your feedback!');
  };
    
  const handleAddCategory = (categoryName: string) => {
    if (categories.some(c => c.name.toLowerCase() === categoryName.toLowerCase()) || categoryName.toLowerCase() === 'product') {
        showToast(`Category "${categoryName}" already exists.`);
        return;
    }
    const newCategory: Category = {
      id: categoryName.trim(), // Keep it simple for now
      name: categoryName.trim(),
      lastModified: new Date().toISOString()
    }
    setCategories(prev => [...prev, newCategory]);
    showToast('Category added successfully!');
  };

  const handleUpdateCategory = (oldId: string, newName: string) => {
    if (categories.some(c => c.name.toLowerCase() === newName.toLowerCase() && c.id !== oldId) || newName.toLowerCase() === 'product') {
      showToast(`Category "${newName}" already exists.`);
      return;
    }
    setCategories(prev => prev.map(c => c.id === oldId ? { ...c, name: newName, lastModified: new Date().toISOString() } : c));
    const oldCategory = categories.find(c => c.id === oldId);
    if (oldCategory) {
      setServices(prev => prev.map(s => s.category === oldCategory.name ? { ...s, category: newName, lastModified: new Date().toISOString() } : s));
    }
    showToast('Category updated successfully.');
  };

  const handleDeleteCategory = (categoryId: string) => {
    const categoryToDelete = categories.find(c => c.id === categoryId);
    if (!categoryToDelete) return;

    if (services.some(s => s.category === categoryToDelete.name)) {
        showToast(`Cannot delete category "${categoryToDelete.name}" as it is being used by one or more services.`);
        return;
    }
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    showToast('Category deleted.');
  };

  const handleViewClient = (clientId: string) => {
    setSelectedClientId(clientId);
    navigate('client-details');
  };

  const handleStartBillForClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setBillingClient(client);
      setPrefilledBillItems(null);
      navigate('pos');
    }
  };
  
  const handleStartBillForAppointment = (appointment: Appointment) => {
    const client = clients.find(c => c.id === appointment.clientId);
    if (!client) {
      showToast("Client not found for this appointment.");
      return;
    }

    const items: BillItem[] = appointment.serviceIds
      .map(serviceId => {
        const service = services.find(s => s.id === serviceId);
        if (!service) return null;
        return {
          serviceId,
          staffId: appointment.staffId,
          price: service.price,
          name: service.name
        };
      })
      .filter((item): item is BillItem => item !== null);

    if (items.length === 0) {
      showToast("No valid services found for this appointment.");
      return;
    }

    setBillingClient(client);
    setPrefilledBillItems(items);
    navigate('pos');
  };
  
  const selectedClient = clients.find(c => c.id === selectedClientId);

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardView appointments={appointments} transactions={transactions} clients={clients} enquiries={enquiries.length} />;
      case 'pos':
        return <POSView 
                  clients={clients} 
                  services={services} 
                  staff={staff}
                  categories={categories}
                  onAddTransaction={handleAddTransaction} 
                  onAddClient={handleAddClient} 
                  showToast={showToast}
                  initialClient={billingClient}
                  initialBillItems={prefilledBillItems}
                  onLoadComplete={() => {
                    setBillingClient(null);
                    setPrefilledBillItems(null);
                  }}
                />;
      case 'clients':
        return <ClientList clients={clients} onViewClient={handleViewClient} onStartBill={handleStartBillForClient} />;
      case 'appointments':
        return <AppointmentView
                  appointments={appointments}
                  clients={clients}
                  services={services}
                  staff={staff}
                  onUpdateAppointment={handleUpdateAppointment}
                  onStartBillForAppointment={handleStartBillForAppointment}
                  onBookAppointmentClick={() => setIsAppointmentModalOpen(true)}
                />;
      case 'client-details':
        return selectedClient ? 
               <ClientDetails 
                  client={selectedClient} 
                  transactions={transactions.filter(t => t.clientId === selectedClient.id)}
                  appointments={appointments.filter(a => a.clientId === selectedClient.id)}
                  services={services}
                  onBack={goBack} 
                  canGoBack={true}
                  onSave={handleUpdateClient}
                /> : 
               <div className="text-neutral">Client not found.</div>;
      case 'settings':
          return <SettingsView 
                    services={services.filter(s => s.category !== 'Product')}
                    categories={categories}
                    onAddService={handleAddService}
                    onUpdateService={handleUpdateService}
                    onDeleteService={handleDeleteService}
                    onAddCategory={handleAddCategory}
                    onUpdateCategory={handleUpdateCategory}
                    onDeleteCategory={handleDeleteCategory}
                  />;
      case 'enquiry':
        return <EnquiryView
                  enquiries={enquiries}
                  onAddEnquiry={handleAddEnquiry}
                  onUpdateEnquiry={handleUpdateEnquiry}
                />;
      case 'feedbacks':
        return <FeedbackView
                  feedbacks={feedbacks}
                  clients={clients}
                  onAddFeedback={handleAddFeedback}
                />;
      case 'products':
        return <ProductView
                  products={services.filter(s => s.category === 'Product')}
                  onAddService={handleAddService}
                  onUpdateService={handleUpdateService}
                  onDeleteService={handleDeleteService}
                />;
      case 'reports':
        return <ReportsView transactions={transactions} services={services} staff={staff} clients={clients} />;
      case 'addmanage':
        return <AddManageView onNavigate={navigate} />;
      case 'staff-management':
        return <StaffManagementView
                  staff={staff}
                  onAddStaff={handleAddStaff}
                  onUpdateStaff={handleUpdateStaff}
                  onDeleteStaff={handleDeleteStaff}
                />;
      default:
        return <DashboardView appointments={appointments} transactions={transactions} clients={clients} enquiries={enquiries.length} />;
    }
  };
  
  const NavButton = ({ isActive, onClick, icon, label }: { isActive: boolean, onClick: () => void, icon: React.ReactElement<React.SVGProps<SVGSVGElement>>, label: string }) => (
    <li>
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center text-center px-5 py-3 transition-colors duration-200 w-full h-full ${
                isActive
                    ? 'bg-accent text-neutral'
                    : 'hover:bg-primary-focus'
            }`}
        >
            {React.cloneElement(icon, { className: 'w-6 h-6 mb-1' })}
            <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        </button>
    </li>
  );

  const MobileNavButton = ({ isActive, onClick, icon, label }: { isActive: boolean, onClick: () => void, icon: React.ReactElement<React.SVGProps<SVGSVGElement>>, label: string }) => (
    <button onClick={onClick} className={`flex items-center w-full px-4 py-3 text-left ${isActive ? 'bg-accent text-neutral' : 'hover:bg-primary-focus'}`}>
        {React.cloneElement(icon, { className: 'w-5 h-5 mr-3' })}
        <span className="font-semibold">{label}</span>
    </button>
  );
  
  const navItems: { view: View; label: string; icon: React.ReactElement<React.SVGProps<SVGSVGElement>> }[] = [
    { view: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { view: 'enquiry', label: 'Enquiry', icon: <ClipboardDocumentListIcon /> },
    { view: 'appointments', label: 'Appointments', icon: <CalendarDaysIcon /> },
    { view: 'pos', label: 'Billing', icon: <DocumentTextIcon /> },
    { view: 'clients', label: 'Clients', icon: <UsersIcon /> },
    { view: 'feedbacks', label: 'Feedbacks', icon: <ChatBubbleLeftRightIcon /> },
    { view: 'products', label: 'Products', icon: <TagIcon /> },
    { view: 'reports', label: 'Reports', icon: <ChartBarIcon /> },
    { view: 'addmanage', label: 'Add & Manage', icon: <PlusCircleIcon /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-base-200 font-sans text-neutral overflow-hidden">
      {toastMessage && <Toast message={toastMessage} />}
      {isAppointmentModalOpen && <AppointmentModal 
          clients={clients}
          services={services}
          staff={staff}
          onAddAppointment={handleAddAppointment}
          onAddClient={handleAddClient}
          showToast={showToast}
          onClose={() => setIsAppointmentModalOpen(false)} 
      />}
      
      {/* Superadmin Header */}
      <header className="bg-base-100 px-4 sm:px-6 py-2 flex justify-between items-center text-sm border-b border-base-300 flex-shrink-0">
          <div className="flex items-center space-x-2">
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-1 -ml-1 text-neutral">
                  <Bars3Icon className="w-6 h-6"/>
              </button>
              <h1 className="font-bold text-neutral">
                {SALON_NAME} (<span className="text-secondary">{SALON_BRANCH}</span>)
              </h1>
          </div>
          <button className="text-primary font-semibold hover:underline">Change branch</button>
      </header>

      {/* Main Navigation */}
      <nav className="bg-primary text-primary-content shadow-md flex-shrink-0 hidden lg:block">
         <ul className="flex items-center justify-center">
            {navItems.map(item => (
                <NavButton 
                    key={item.view}
                    isActive={view === item.view} 
                    onClick={() => navigate(item.view, true)} 
                    icon={item.icon} 
                    label={item.label} 
                />
            ))}
         </ul>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:hidden`}>
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative w-72 h-full bg-primary text-primary-content flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-primary-focus/50">
                    <h2 className="text-lg font-bold">Menu</h2>
                    <button onClick={() => setIsMobileMenuOpen(false)}><XMarkIcon className="w-6 h-6"/></button>
                </div>
                <nav className="flex-1 overflow-y-auto">
                    <ul>
                        {navItems.map(item => (
                            <li key={item.view}>
                                <MobileNavButton
                                    isActive={view === item.view}
                                    onClick={() => navigate(item.view, true)}
                                    icon={item.icon}
                                    label={item.label}
                                />
                            </li>
                        ))}
                    </ul>
                </nav>
          </div>
      </div>
      
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {renderView()}
      </main>

    </div>
  );
};

export default App;
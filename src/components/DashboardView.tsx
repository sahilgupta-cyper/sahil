import React, { useMemo, useState } from 'react';
import { Appointment, Transaction, Client } from '../types';
import Card from './common/Card';
import { CalendarDaysIcon, CurrencyRupeeIcon, ClipboardDocumentListIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface DashboardViewProps {
  appointments: Appointment[];
  transactions: Transaction[];
  clients: Client[];
  enquiries: number;
}

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <div className={`rounded-lg p-5 text-white shadow-lg ${color} flex flex-col justify-between`}>
        <div className="flex justify-between items-start">
            <p className="uppercase font-bold tracking-wider text-sm">{title}</p>
             {React.cloneElement(icon, { className: 'w-8 h-8 opacity-80' })}
        </div>
        <p className="text-4xl font-extrabold mt-2">{value}</p>
    </div>
);

const DashboardView: React.FC<DashboardViewProps> = ({ appointments, transactions, clients, enquiries }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const dashboardStats = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        
        const todaysTransactions = transactions.filter(t => new Date(t.date).toISOString().split('T')[0] === todayStr);
        const todaysSales = todaysTransactions.reduce((sum, tx) => sum + tx.total, 0);

        const todaysAppointments = appointments.filter(a => new Date(a.start).toISOString().split('T')[0] === todayStr && a.status !== 'cancelled');
        const todaysEnquiries = enquiries; // Assuming the passed `enquiries` count is for today

        return {
            sales: `₹ ${todaysSales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
            appointmentCount: todaysAppointments.length,
            enquiryCount: todaysEnquiries,
        };
    }, [appointments, transactions, enquiries]);
    
    const todaysAppointments = useMemo(() => {
        return appointments
            .filter(a => new Date(a.start).toISOString().split('T')[0] === currentDate.toISOString().split('T')[0] && a.status !== 'cancelled')
            .sort((a,b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    }, [appointments, currentDate]);

    const changeDay = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(newDate.getDate() + offset);
            return newDate;
        });
    };
    
    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Today's Sales" value={dashboardStats.sales} icon={<CurrencyRupeeIcon />} color="bg-stat-green" />
                <StatCard title="Today's Appointments" value={dashboardStats.appointmentCount} icon={<CalendarDaysIcon />} color="bg-stat-purple" />
                <StatCard title="Today's Enquiry" value={dashboardStats.enquiryCount} icon={<ClipboardDocumentListIcon />} color="bg-stat-pink" />
            </div>
            
            <Card className="p-0">
                <div className="p-4 border-b border-base-300 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <button onClick={() => changeDay(-1)} className="p-1 rounded hover:bg-base-200"><ChevronLeftIcon className="w-5 h-5"/></button>
                        <button onClick={() => changeDay(1)} className="p-1 rounded hover:bg-base-200"><ChevronRightIcon className="w-5 h-5"/></button>
                        <button onClick={() => setCurrentDate(new Date())} className="text-sm font-semibold px-3 py-1 bg-base-200 rounded">Today</button>
                    </div>
                    <h3 className="font-semibold text-neutral text-sm sm:text-base text-right">
                        {currentDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </h3>
                </div>
                <div className="p-4 sm:p-6">
                    {todaysAppointments.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                            {todaysAppointments.map(app => (
                                <div key={app.id} className="text-center p-2 border rounded-md bg-base-200">
                                    <p className="font-semibold text-sm truncate">{clients.find(c => c.id === app.clientId)?.name || 'Unknown'}</p>
                                    <p className="text-xs text-secondary">{new Date(app.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-secondary py-8">No appointments scheduled for this day.</p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default DashboardView;
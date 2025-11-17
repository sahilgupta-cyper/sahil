import React, { useState, useMemo } from 'react';
import { Transaction, Service, Staff, Client } from '../types';
import Card from './common/Card';
import { CurrencyRupeeIcon, DocumentTextIcon, ChartBarIcon } from './Icons';

interface ReportStatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
}

const ReportStatCard: React.FC<ReportStatCardProps> = ({ title, value, icon }) => (
    <Card accentBorder>
        <div className="flex items-center space-x-4">
            <div className="bg-primary/10 text-primary rounded-full p-3">
                {React.cloneElement(icon, { className: 'w-6 h-6' })}
            </div>
            <div>
                <p className="text-sm text-secondary font-medium">{title}</p>
                <p className="text-2xl font-bold text-neutral">{value}</p>
            </div>
        </div>
    </Card>
);


interface ReportsViewProps {
    transactions: Transaction[];
    services: Service[];
    staff: Staff[];
    clients: Client[];
}

const ReportsView: React.FC<ReportsViewProps> = ({ transactions, services, staff }) => {
    const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month'>('all');

    const filteredTransactions = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (dateRange === 'today') {
            return transactions.filter(t => new Date(t.date).toDateString() === today.toDateString());
        }
        if (dateRange === 'week') {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Handle Sunday as start of week
            return transactions.filter(t => new Date(t.date) >= weekStart);
        }
        if (dateRange === 'month') {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            return transactions.filter(t => new Date(t.date) >= monthStart);
        }
        return transactions;
    }, [transactions, dateRange]);

    const reportStats = useMemo(() => {
        const totalRevenue = filteredTransactions.reduce((acc, tx) => acc + tx.total, 0);
        const totalTransactions = filteredTransactions.length;
        const avgTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

        const salesByCategory = filteredTransactions.reduce((acc, tx) => {
            tx.items.forEach(item => {
                const service = services.find(s => s.id === item.serviceId);
                const category = service?.category || 'Uncategorized';
                acc[category] = (acc[category] || 0) + item.price;
            });
            return acc;
        }, {} as { [key: string]: number });
        
        const salesByService = filteredTransactions.reduce((acc, tx) => {
            tx.items.forEach(item => {
                 acc[item.name] = (acc[item.name] || 0) + item.price;
            });
            return acc;
        }, {} as { [key: string]: number });
        
        const salesByStaff = filteredTransactions.reduce((acc, tx) => {
            tx.items.forEach(item => {
                const staffMember = staff.find(s => s.id === item.staffId);
                const staffName = staffMember?.name || 'Unassigned';
                acc[staffName] = (acc[staffName] || 0) + item.price;
            });
            return acc;
        }, {} as { [key: string]: number });
        
        const paymentsByType = filteredTransactions.reduce((acc, tx) => {
            const method = tx.paymentMethod;
            acc[method] = (acc[method] || 0) + tx.total;
            return acc;
        }, {} as { [key in Transaction['paymentMethod']]?: number });

        return {
            totalRevenue,
            totalTransactions,
            avgTransactionValue,
            salesByCategory: Object.entries(salesByCategory).sort(([, a], [, b]) => b - a),
            topServices: Object.entries(salesByService).sort(([, a], [, b]) => b - a).slice(0, 5),
            topStaff: Object.entries(salesByStaff).sort(([, a], [, b]) => b - a).slice(0, 5),
            paymentsByType: Object.entries(paymentsByType).sort(([, a], [, b]) => b - a),
        };
    }, [filteredTransactions, services, staff]);

    const maxCategoryValue = Math.max(...reportStats.salesByCategory.map(([, value]) => value), 1);
    const maxPaymentValue = Math.max(...reportStats.paymentsByType.map(([, value]) => value as number), 1);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h2 className="text-xl font-bold text-neutral font-serif">Reports & Analytics</h2>
                <div className="flex bg-base-100 rounded-lg p-1 border border-base-300 self-start">
                    {(['today', 'week', 'month', 'all'] as const).map(range => (
                        <button key={range} onClick={() => setDateRange(range)} className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors capitalize ${dateRange === range ? 'bg-primary text-white' : 'text-secondary hover:bg-base-300/50'}`}>
                            {range === 'week' || range === 'month' ? `This ${range}` : range}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ReportStatCard title="Total Revenue" value={`₹${reportStats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} icon={<CurrencyRupeeIcon />} />
                <ReportStatCard title="Total Transactions" value={reportStats.totalTransactions} icon={<DocumentTextIcon />} />
                <ReportStatCard title="Avg. Transaction Value" value={`₹${reportStats.avgTransactionValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} icon={<ChartBarIcon />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Revenue by Category">
                        <div className="space-y-4">
                            {reportStats.salesByCategory.map(([category, value]) => (
                                <div key={category}>
                                    <div className="flex justify-between items-center text-sm mb-1">
                                        <span className="font-medium text-neutral">{category}</span>
                                        <span className="text-secondary">₹{value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <div className="w-full bg-base-200 rounded-full h-2.5">
                                        <div className="bg-accent h-2.5 rounded-full" style={{ width: `${(value / maxCategoryValue) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                            {reportStats.salesByCategory.length === 0 && <p className="text-secondary text-center py-8">No sales data for this period.</p>}
                        </div>
                    </Card>
                    <Card title="Revenue by Payment Method">
                        <div className="space-y-4">
                            {reportStats.paymentsByType.map(([method, value]) => (
                                <div key={method}>
                                    <div className="flex justify-between items-center text-sm mb-1">
                                        <span className="font-medium text-neutral">{method}</span>
                                        <span className="text-secondary">₹{(value as number).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                                    </div>
                                    <div className="w-full bg-base-200 rounded-full h-2.5">
                                        <div className="bg-info h-2.5 rounded-full" style={{ width: `${((value as number) / maxPaymentValue) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                            {reportStats.paymentsByType.length === 0 && <p className="text-secondary text-center py-8">No sales data for this period.</p>}
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Card title="Top Performing Services">
                        <ul className="space-y-3">
                            {reportStats.topServices.map(([name, revenue], index) => (
                                <li key={name} className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-neutral truncate pr-4">
                                        <span className="text-secondary mr-2">{index + 1}.</span>{name}
                                    </span>
                                    <span className="font-semibold text-primary flex-shrink-0">₹{revenue.toLocaleString('en-IN')}</span>
                                </li>
                            ))}
                            {reportStats.topServices.length === 0 && <p className="text-secondary text-center py-8">No sales data for this period.</p>}
                        </ul>
                    </Card>

                    <Card title="Top Performing Staff">
                        <ul className="space-y-3">
                            {reportStats.topStaff.map(([name, revenue], index) => (
                                <li key={name} className="flex items-center justify-between text-sm">
                                    <span className="font-medium text-neutral truncate pr-4">
                                         <span className="text-secondary mr-2">{index + 1}.</span>{name}
                                    </span>
                                    <span className="font-semibold text-primary flex-shrink-0">₹{revenue.toLocaleString('en-IN')}</span>
                                </li>
                            ))}
                            {reportStats.topStaff.length === 0 && <p className="text-secondary text-center py-8">No sales data for this period.</p>}
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ReportsView;

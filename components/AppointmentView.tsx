import React, { useState, useMemo } from 'react';
import { Appointment, Client, Service, Staff } from '../types';
import Button from './common/Button';
import { ChevronLeftIcon, ChevronRightIcon, DocumentTextIcon } from './Icons';

interface AppointmentViewProps {
  appointments: Appointment[];
  clients: Client[];
  services: Service[];
  staff: Staff[];
  onUpdateAppointment: (appointment: Appointment) => void;
  onStartBillForAppointment: (appointment: Appointment) => void;
  onBookAppointmentClick: () => void;
}

const AppointmentView: React.FC<AppointmentViewProps> = ({ appointments, clients, services, staff, onUpdateAppointment, onStartBillForAppointment, onBookAppointmentClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startOfWeek = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };
  
  const weekDates = useMemo(() => {
      const start = startOfWeek(currentDate);
      return Array.from({length: 7}).map((_, i) => {
          const date = new Date(start);
          date.setDate(date.getDate() + i);
          return date;
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);


  const appointmentsByDay = useMemo(() => {
    const grouped: { [key: string]: Appointment[] } = {};
    
    [...weekDates, currentDate].forEach(date => {
        const dateString = date.toISOString().split('T')[0];
        if(!grouped[dateString]) grouped[dateString] = [];
    });
    
    appointments.forEach(app => {
        const appDateStr = new Date(app.start).toISOString().split('T')[0];
        if (grouped.hasOwnProperty(appDateStr)) {
            grouped[appDateStr].push(app);
        }
    });

    Object.values(grouped).forEach(dayAppointments => {
        dayAppointments.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    });

    return grouped;
  }, [appointments, weekDates, currentDate]);
  
  const changeWeek = (offset: number) => {
      setCurrentDate(prev => {
          const newDate = new Date(prev);
          newDate.setDate(newDate.getDate() + (7 * offset));
          return newDate;
      })
  };
  
  const changeDay = (offset: number) => {
       setCurrentDate(prev => {
          const newDate = new Date(prev);
          newDate.setDate(newDate.getDate() + offset);
          return newDate;
      })
  }

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const AppointmentCard = ({ app }: { app: Appointment }) => {
    const client = clients.find(c => c.id === app.clientId);
    const staffMember = staff.find(s => s.id === app.staffId);
    const appointmentServices = app.serviceIds.map(id => services.find(s => s.id === id)).filter(Boolean) as Service[];
    const startTime = new Date(app.start).toLocaleTimeString('en-IN', { hour: '2-digit', minute:'2-digit', hour12: false });
    const endTime = new Date(app.end).toLocaleTimeString('en-IN', { hour: '2-digit', minute:'2-digit', hour12: false });
    const statusColors = {
        pending: "border-l-4 border-amber-400 bg-amber-500/10",
        confirmed: "border-l-4 border-emerald-400 bg-emerald-500/10",
        completed: "border-l-4 border-sky-400 bg-sky-500/10",
        cancelled: "border-l-4 border-rose-400 bg-rose-500/10 opacity-70",
    };
    return (
        <div className={`p-3 rounded-md text-sm space-y-2 ${statusColors[app.status]}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className={`font-bold text-neutral ${app.status === 'cancelled' ? 'line-through' : ''}`}>{client?.name || 'Unknown'}</p>
                    <p className="text-xs text-secondary">{startTime} - {endTime}</p>
                </div>
            </div>
            <div className="text-xs text-secondary border-t border-base-300/50 pt-1">
              <ul className="list-disc list-inside">
                {appointmentServices.map(s => <li key={s.id}>{s.name}</li>)}
              </ul>
              <p className="mt-1 font-medium">with {staffMember?.name || 'Unassigned'}</p>
            </div>
            {app.status !== 'completed' && app.status !== 'cancelled' && (
                <div className="pt-2 border-t border-base-300/50 text-right">
                    <Button size="sm" variant="primary" onClick={() => onStartBillForAppointment(app)}>
                        <DocumentTextIcon className="w-4 h-4"/>
                        Bill
                    </Button>
                </div>
            )}
        </div>
    )
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <h2 className="text-xl font-bold text-neutral font-serif">
            Appointments
        </h2>
        <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 sm:hidden">
                <Button variant="secondary" size="sm" onClick={() => changeDay(-1)}><ChevronLeftIcon className="w-5 h-5"/></Button>
                <Button variant="secondary" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
                <Button variant="secondary" size="sm" onClick={() => changeDay(1)}><ChevronRightIcon className="w-5 h-5"/></Button>
            </div>
             <div className="hidden sm:flex items-center space-x-1">
                <Button variant="secondary" size="sm" onClick={() => changeWeek(-1)}><ChevronLeftIcon className="w-5 h-5"/></Button>
                <Button variant="secondary" size="sm" onClick={() => setCurrentDate(new Date())}>Today</Button>
                <Button variant="secondary" size="sm" onClick={() => changeWeek(1)}><ChevronRightIcon className="w-5 h-5"/></Button>
            </div>
            <Button onClick={onBookAppointmentClick}>Book Appointment</Button>
        </div>
      </div>
      
      {/* Week View (Desktop) */}
      <div className="flex-1 hidden md:grid grid-cols-7 gap-px bg-base-300 overflow-y-auto border border-base-300 rounded-lg">
        {weekDates.map(date => {
            const dateString = date.toISOString().split('T')[0];
            const dailyAppointments = appointmentsByDay[dateString] || [];
            return (
                <div key={dateString} className="bg-base-100 p-2 flex flex-col">
                    <div className={`text-center mb-2 pb-2 border-b border-base-200 ${isToday(date) ? 'font-bold text-primary' : 'text-secondary'}`}>
                        <p className="text-sm">{date.toLocaleDateString('en-IN', { weekday: 'short' })}</p>
                        <p className="text-2xl">{date.getDate()}</p>
                    </div>
                    <div className="flex-1 space-y-2 overflow-y-auto pr-1 -mr-1">
                        {dailyAppointments.map(app => <AppointmentCard key={app.id} app={app} />)}
                    </div>
                </div>
            )
        })}
      </div>

      {/* Day View (Mobile) */}
      <div className="flex-1 md:hidden bg-base-100 border border-base-300 rounded-lg p-4 overflow-y-auto">
        <div className={`text-center mb-4 pb-2 border-b border-base-200 ${isToday(currentDate) ? 'font-bold text-primary' : 'text-secondary'}`}>
            <p className="text-lg">{currentDate.toLocaleDateString('en-IN', { weekday: 'long' })}</p>
            <p className="text-md">{currentDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="space-y-3">
            {(appointmentsByDay[currentDate.toISOString().split('T')[0]] || []).length > 0 ? (
                (appointmentsByDay[currentDate.toISOString().split('T')[0]] || []).map(app => <AppointmentCard key={app.id} app={app} />)
            ) : (
                <p className="text-center text-secondary py-10">No appointments for this day.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentView;

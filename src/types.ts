export type View = 'pos' | 'clients' | 'client-details' | 'appointments' | 'dashboard' | 'settings' | 'enquiry' | 'feedbacks' | 'products' | 'reports' | 'addmanage' | 'staff-management';

export interface Syncable {
    id: string;
    lastModified?: string;
}

export interface Client extends Syncable {
  name: string;
  phone: string; // Used for display and as initial ID, but `id` is the canonical identifier.
  serviceHistory: string[]; // Array of Transaction IDs
  notes: string;
}

export interface Service extends Syncable {
  name: string;
  category: string;
  price: number;
  duration: number; // In minutes, 0 for products
}

export interface Staff extends Syncable {
  name: string;
}

export interface Category extends Syncable {
  name: string;
}

export interface BillItem {
  serviceId: string;
  staffId: string;
  price: number; // Price at the time of billing
  name: string; // Service name at the time of billing
}

export interface Transaction extends Syncable {
  clientId: string | null;
  items: BillItem[];
  itemsSubtotal: number; // The sum of item prices before any adjustments.
  subtotal: number; // The effective subtotal used for discount/tax calculations.
  discountType: 'percentage' | 'amount';
  discountValue: number;
  discountAmount: number;
  taxAmount: number; // GST
  total: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI';
  date: string; // ISO string
}

export interface Appointment extends Syncable {
  clientId: string;
  staffId: string;
  serviceIds: string[];
  start: string; // ISO string
  end: string; // ISO string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Enquiry extends Syncable {
  name: string;
  phone: string;
  details: string;
  status: 'Pending' | 'Followed-up' | 'Closed';
  date: string; // ISO string
}

export interface Feedback extends Syncable {
  clientId: string | null;
  clientName: string;
  rating: number; // 1 to 5
  comments: string;
  date: string; // ISO string
}
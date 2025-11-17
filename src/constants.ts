import { Service, Staff, Category } from './types';

export const SALON_NAME = "Hair and Nail Kingdom";
export const SALON_BRANCH = "Branch 1";

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'Hair', name: 'Hair', lastModified: new Date().toISOString() },
  { id: 'Nails', name: 'Nails', lastModified: new Date().toISOString() },
  { id: 'Skin', name: 'Skin', lastModified: new Date().toISOString() },
];

export const INITIAL_SERVICES: Service[] = [
  { id: 'S001', name: 'Men\'s Haircut', category: 'Hair', price: 400, duration: 30, lastModified: new Date().toISOString() },
  { id: 'S002', name: 'Women\'s Haircut', category: 'Hair', price: 800, duration: 60, lastModified: new Date().toISOString() },
  { id: 'S003', name: 'Hair Spa', category: 'Hair', price: 1500, duration: 90, lastModified: new Date().toISOString() },
  { id: 'S004', name: 'Global Hair Color', category: 'Hair', price: 4500, duration: 180, lastModified: new Date().toISOString() },
  { id: 'S005', name: 'Manicure', category: 'Nails', price: 600, duration: 45, lastModified: new Date().toISOString() },
  { id: 'S006', name: 'Pedicure', category: 'Nails', price: 750, duration: 60, lastModified: new Date().toISOString() },
  { id: 'S007', name: 'Gel Nail Extensions', category: 'Nails', price: 2500, duration: 120, lastModified: new Date().toISOString() },
  { id: 'S008', name: 'Classic Facial', category: 'Skin', price: 1200, duration: 60, lastModified: new Date().toISOString() },
  { id: 'S009', name: 'Detan Pack', category: 'Skin', price: 800, duration: 30, lastModified: new Date().toISOString() },
  { id: 'P001', name: 'Shampoo (250ml)', category: 'Product', price: 950, duration: 0, lastModified: new Date().toISOString() },
  { id: 'P002', name: 'Hair Serum', category: 'Product', price: 1300, duration: 0, lastModified: new Date().toISOString() },
];

export const INITIAL_STAFF: Staff[] = [
  { id: 'E01', name: 'Riya Sharma', lastModified: new Date().toISOString() },
  { id: 'E02', name: 'Ankit Patel', lastModified: new Date().toISOString() },
  { id: 'E03', name: 'Priya Singh', lastModified: new Date().toISOString() },
  { id: 'E04', name: 'Vikram Kumar', lastModified: new Date().toISOString() },
];
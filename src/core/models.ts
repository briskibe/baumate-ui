// Role union type
export type Role = 'admin' | 'org_admin' | 'org_manager';

// User type
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  organizationId?: string;
  language?: 'hr' | 'de' | 'en';
}

// Worker type
export interface Worker {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  organizationId: string;
}

// Organization type
export interface Organization {
  id: string;
  name: string;
  address?: string;
}

// Site type
export interface Site {
  id: string;
  name: string;
  address: string;
  city?: string;
  organizationId: string;
  clientId?: string;
  status?: 'planning' | 'active' | 'on_hold' | 'completed';
  startDate?: string;
  endDate?: string;
}

// SiteAssignment type
export interface SiteAssignment {
  id: string;
  siteId: string;
  workerId: string;
  role: 'site_manager' | 'worker';
  assignedDate: string;
  startDate?: string;
  endDate?: string;
}

// Material type
export interface Material {
  id: string;
  name: string;
  unit: string;
  description?: string;
  organizationId: string;
}

// SiteMaterial type
export interface SiteMaterial {
  id: string;
  siteId: string;
  materialId: string;
  plannedQty?: number;
  actualQty?: number;
}

// DailyLog type
export interface DailyLog {
  id: string;
  siteId: string;
  date: string;
  createdBy: string;
  notes?: string;
}

// DailyLogEntry type
export interface DailyLogEntry {
  id: string;
  dailyLogId: string;
  workerId: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  notes?: string;
}

// Client type
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
}

// Incident type
export interface Incident {
  id: string;
  siteId: string;
  date: string;
  reportedBy: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  resolved: boolean;
}

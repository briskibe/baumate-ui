import { HttpInterceptorFn, HttpResponse, HttpErrorResponse, HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of, throwError, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  User,
  Worker,
  Organization,
  Site,
  SiteAssignment,
  Material,
  SiteMaterial,
  DailyLog,
  DailyLogEntry,
  Client,
  Incident
} from './models';

const DB_KEY = 'baumate-db-v1';

interface Database {
  organizations: Organization[];
  users: User[];
  workers: Worker[];
  materials: Material[];
  sites: Site[];
  assignments: SiteAssignment[];
  siteMaterials: SiteMaterial[];
  dailyLogs: DailyLog[];
  dailyLogEntries: DailyLogEntry[];
  clients: Client[];
  incidents: Incident[];
}

// Helper to generate random latency between 250-400ms
function getRandomLatency(): number {
  return Math.floor(Math.random() * (400 - 250 + 1)) + 250;
}

// Helper to generate UUID
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Initialize database with default data
function initializeDatabase(): Database {
  const orgId = generateId();
  const adminUserId = generateId();
  const adminWorkerId = generateId();
  const managerUserId = generateId();
  const managerWorkerId = generateId();
  const worker1Id = generateId();
  const worker2Id = generateId();
  const worker3Id = generateId();
  const siteAId = generateId();
  const siteBId = generateId();
  const material1Id = generateId();
  const material2Id = generateId();
  const material3Id = generateId();
  const client1Id = generateId();
  const dailyLogId = generateId();

  const db: Database = {
    organizations: [
      {
        id: orgId,
        name: 'Baumate Construction Ltd',
        address: '123 Builder Street, Construction City, 12345'
      }
    ],
    users: [
      {
        id: adminUserId,
        name: 'Admin User',
        email: 'admin@baumate.com',
        role: 'org_admin',
        organizationId: orgId,
        language: 'hr'
      },
      {
        id: managerUserId,
        name: 'Manager User',
        email: 'manager@baumate.com',
        role: 'org_manager',
        organizationId: orgId,
        language: 'hr'
      }
    ],
    workers: [
      {
        id: adminWorkerId,
        name: 'Admin Worker',
        email: 'admin@baumate.com',
        phone: '+1234567890',
        organizationId: orgId
      },
      {
        id: managerWorkerId,
        name: 'Manager Worker',
        email: 'manager@baumate.com',
        phone: '+1234567891',
        organizationId: orgId
      },
      {
        id: worker1Id,
        name: 'John Doe',
        email: 'john.doe@baumate.com',
        phone: '+1234567892',
        organizationId: orgId
      },
      {
        id: worker2Id,
        name: 'Jane Smith',
        email: 'jane.smith@baumate.com',
        phone: '+1234567893',
        organizationId: orgId
      },
      {
        id: worker3Id,
        name: 'Bob Johnson',
        email: 'bob.johnson@baumate.com',
        phone: '+1234567894',
        organizationId: orgId
      }
    ],
    materials: [
      {
        id: material1Id,
        name: 'Concrete',
        unit: 'm³',
        description: 'Standard concrete mix',
        organizationId: orgId
      },
      {
        id: material2Id,
        name: 'Steel Rebar',
        unit: 'kg',
        description: 'Reinforcement steel bars',
        organizationId: orgId
      },
      {
        id: material3Id,
        name: 'Bricks',
        unit: 'pieces',
        description: 'Standard red bricks',
        organizationId: orgId
      }
    ],
    clients: [
      {
        id: client1Id,
        name: 'ABC Corporation',
        email: 'contact@abc-corp.com',
        phone: '+1987654321',
        company: 'ABC Corporation'
      }
    ],
    sites: [
      {
        id: siteAId,
        name: 'Site A - Office Building',
        address: '456 Construction Ave, Building Town',
        city: 'Building Town',
        organizationId: orgId,
        clientId: client1Id,
        status: 'active',
        startDate: '2025-01-15',
        endDate: '2025-12-31'
      },
      {
        id: siteBId,
        name: 'Site B - Residential Complex',
        address: '789 Development Rd, Housing City',
        city: 'Housing City',
        organizationId: orgId,
        status: 'planning',
        startDate: '2025-03-01',
        endDate: '2026-02-28'
      }
    ],
    assignments: [
      {
        id: generateId(),
        siteId: siteAId,
        workerId: managerWorkerId,
        role: 'site_manager',
        assignedDate: '2025-01-15',
        startDate: '2025-01-15',
        endDate: '2025-12-31'
      },
      {
        id: generateId(),
        siteId: siteAId,
        workerId: worker1Id,
        role: 'worker',
        assignedDate: '2025-01-20',
        startDate: '2025-01-20',
        endDate: '2025-06-30'
      },
      {
        id: generateId(),
        siteId: siteAId,
        workerId: worker2Id,
        role: 'worker',
        assignedDate: '2025-01-20',
        startDate: '2025-01-20',
        endDate: '2025-12-31'
      },
      {
        id: generateId(),
        siteId: siteAId,
        workerId: worker3Id,
        role: 'worker',
        assignedDate: '2025-01-22',
        startDate: '2025-01-22',
        endDate: '2025-08-31'
      }
    ],
    siteMaterials: [
      {
        id: generateId(),
        siteId: siteAId,
        materialId: material1Id,
        plannedQty: 100,
        actualQty: 45
      },
      {
        id: generateId(),
        siteId: siteAId,
        materialId: material2Id,
        plannedQty: 5000,
        actualQty: 2300
      }
    ],
    dailyLogs: [
      {
        id: dailyLogId,
        siteId: siteAId,
        date: '2025-11-05',
        createdBy: managerUserId,
        notes: 'Good progress today, weather was favorable'
      }
    ],
    dailyLogEntries: [
      {
        id: generateId(),
        dailyLogId: dailyLogId,
        workerId: worker1Id,
        startTime: '08:00',
        endTime: '17:00',
        breakMinutes: 60,
        notes: 'Foundation work'
      },
      {
        id: generateId(),
        dailyLogId: dailyLogId,
        workerId: worker2Id,
        startTime: '08:00',
        endTime: '17:00',
        breakMinutes: 60,
        notes: 'Concrete pouring'
      }
    ],
    incidents: [
      {
        id: generateId(),
        siteId: siteAId,
        date: '2025-11-03',
        reportedBy: managerUserId,
        severity: 'low',
        description: 'Minor equipment malfunction, quickly resolved',
        resolved: true
      }
    ]
  };

  // Store admin worker ID as special metadata
  (db as any)._adminWorkerId = adminWorkerId;

  return db;
}

// Load database from localStorage
function loadDatabase(): Database {
  const stored = localStorage.getItem(DB_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  const db = initializeDatabase();
  saveDatabase(db);
  return db;
}

// Save database to localStorage
function saveDatabase(db: Database): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// Helper to check if user is org_admin
function isOrgAdmin(db: Database, userId: string): boolean {
  const user = db.users.find(u => u.id === userId);
  return user?.role === 'org_admin';
}

// Helper to check if user is site manager for a given site
function isSiteManager(db: Database, userId: string, siteId: string): boolean {
  const user = db.users.find(u => u.id === userId);
  if (!user) return false;

  // Find worker associated with this user (matching email)
  const worker = db.workers.find(w => w.email === user.email);
  if (!worker) return false;

  // Check if this worker is assigned as site_manager to the site
  return db.assignments.some(a =>
    a.siteId === siteId &&
    a.workerId === worker.id &&
    a.role === 'site_manager'
  );
}

// Check if a worker is the admin's worker (undeletable)
function isAdminWorker(db: Database, workerId: string): boolean {
  return (db as any)._adminWorkerId === workerId;
}

// Generic CRUD handlers
function handleGet(db: Database, collection: keyof Database, id?: string, userId?: string) {
  if (id) {
    const item = (db[collection] as any[]).find((item: any) => item.id === id);
    if (!item) {
      return throwError(() => new HttpErrorResponse({
        error: { message: `${collection} with id ${id} not found` },
        status: 404,
        statusText: 'Not Found'
      }));
    }
    return of(new HttpResponse({ status: 200, body: item }));
  }

  // Filter sites for org_manager users to show only sites they manage
  let items = db[collection] as any[];
  if (collection === 'sites' && userId) {
    const user = db.users.find(u => u.id === userId);
    if (user && user.role === 'org_manager') {
      // Find worker associated with this user (matching email)
      const worker = db.workers.find(w => w.email === user.email);
      if (worker) {
        // Get site IDs where this worker is a site_manager
        const managedSiteIds = db.assignments
          .filter(a => a.workerId === worker.id && a.role === 'site_manager')
          .map(a => a.siteId);
        // Filter sites to only show managed sites
        items = items.filter((site: any) => managedSiteIds.includes(site.id));
      } else {
        // If no worker found, return empty array
        items = [];
      }
    }
  }

  // Filter materials by organization
  if (collection === 'materials' && userId) {
    const user = db.users.find(u => u.id === userId);
    if (user && user.organizationId) {
      items = items.filter((material: any) => material.organizationId === user.organizationId);
    }
  }

  return of(new HttpResponse({ status: 200, body: items }));
}

function handlePost(db: Database, collection: keyof Database, body: any, userId?: string) {
  const newItem = { ...body, id: body.id || generateId() };

  // Automatically set organizationId for materials if not provided
  if (collection === 'materials' && userId && !newItem.organizationId) {
    const user = db.users.find(u => u.id === userId);
    if (user && user.organizationId) {
      newItem.organizationId = user.organizationId;
    }
  }

  (db[collection] as any[]).push(newItem);
  saveDatabase(db);
  return of(new HttpResponse({ status: 201, body: newItem }));
}

function handlePut(db: Database, collection: keyof Database, id: string, body: any) {
  const items = db[collection] as any[];
  const index = items.findIndex((item: any) => item.id === id);
  if (index === -1) {
    return throwError(() => new HttpErrorResponse({
      error: { message: `${collection} with id ${id} not found` },
      status: 404,
      statusText: 'Not Found'
    }));
  }
  items[index] = { ...body, id };
  saveDatabase(db);
  return of(new HttpResponse({ status: 200, body: items[index] }));
}

function handleDelete(db: Database, collection: keyof Database, id: string) {
  const items = db[collection] as any[];
  const index = items.findIndex((item: any) => item.id === id);
  if (index === -1) {
    return throwError(() => new HttpErrorResponse({
      error: { message: `${collection} with id ${id} not found` },
      status: 404,
      statusText: 'Not Found'
    }));
  }
  items.splice(index, 1);
  saveDatabase(db);
  return of(new HttpResponse({ status: 204 }));
}

// Business rule enforcement
function checkPermissions(
  db: Database,
  userId: string | undefined,
  method: string,
  collection: string,
  resourceId?: string,
  body?: any
): { allowed: boolean; error?: HttpErrorResponse } {
  // Allow unauthenticated GET requests to users collection (for login page)
  if (!userId && collection === 'users' && method === 'GET') {
    return { allowed: true };
  }

  if (!userId) {
    return {
      allowed: false,
      error: new HttpErrorResponse({
        error: { message: 'Authentication required' },
        status: 401,
        statusText: 'Unauthorized'
      })
    };
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return {
      allowed: false,
      error: new HttpErrorResponse({
        error: { message: 'User not found' },
        status: 401,
        statusText: 'Unauthorized'
      })
    };
  }

  // org_admin can do anything
  if (user.role === 'org_admin') {
    return { allowed: true };
  }

  // Deny deleting admin's worker
  if (method === 'DELETE' && collection === 'workers' && resourceId) {
    if (isAdminWorker(db, resourceId)) {
      return {
        allowed: false,
        error: new HttpErrorResponse({
          error: { message: 'Cannot delete the organization admin\'s worker' },
          status: 403,
          statusText: 'Forbidden'
        })
      };
    }
  }

  // org_manager restrictions
  if (user.role === 'org_manager') {
    // Only allow daily log operations on sites where they are site manager
    if (collection === 'dailyLogs' || collection === 'dailyLogEntries') {
      if (method === 'GET') {
        return { allowed: true }; // Allow reading
      }

      // For POST/PUT/DELETE, check if they manage the site
      if (collection === 'dailyLogs') {
        const siteId = body?.siteId || (resourceId ? db.dailyLogs.find(dl => dl.id === resourceId)?.siteId : undefined);
        if (siteId && isSiteManager(db, userId, siteId)) {
          return { allowed: true };
        }
      }

      if (collection === 'dailyLogEntries') {
        // Find the daily log for this entry
        const dailyLogId = body?.dailyLogId || (resourceId ? db.dailyLogEntries.find(e => e.id === resourceId)?.dailyLogId : undefined);
        if (dailyLogId) {
          const dailyLog = db.dailyLogs.find(dl => dl.id === dailyLogId);
          if (dailyLog && isSiteManager(db, userId, dailyLog.siteId)) {
            return { allowed: true };
          }
        }
      }

      return {
        allowed: false,
        error: new HttpErrorResponse({
          error: { message: 'Managers can only modify daily logs on sites they manage' },
          status: 403,
          statusText: 'Forbidden'
        })
      };
    }

    // Deny all other mutations for org_manager
    if (method !== 'GET') {
      return {
        allowed: false,
        error: new HttpErrorResponse({
          error: { message: 'Insufficient permissions' },
          status: 403,
          statusText: 'Forbidden'
        })
      };
    }
  }

  return { allowed: true };
}

export const fakeBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const { url, method, body } = req;

  // Only intercept /api/* calls
  if (!url.includes('/api/')) {
    return next(req);
  }

  // Extract userId from headers (in a real app, this would come from auth token)
  const userId = req.headers.get('X-User-Id') || undefined;

  // Load database
  const db = loadDatabase();

  // Parse URL to extract collection and id
  const apiMatch = url.match(/\/api\/([^\/\?]+)(?:\/([^\/\?]+))?/);
  if (!apiMatch) {
    return next(req);
  }

  const [, collectionName, resourceId] = apiMatch;

  // Map API endpoints to database collections
  const collectionMap: Record<string, keyof Database> = {
    'users': 'users',
    'workers': 'workers',
    'materials': 'materials',
    'sites': 'sites',
    'assignments': 'assignments',
    'site-materials': 'siteMaterials',
    'daily-logs': 'dailyLogs',
    'daily-log-entries': 'dailyLogEntries',
    'clients': 'clients',
    'incidents': 'incidents'
  };

  const collection = collectionMap[collectionName];
  if (!collection) {
    return next(req);
  }

  // Check permissions
  const permCheck = checkPermissions(db, userId, method, collection, resourceId, body);
  if (!permCheck.allowed) {
    return throwError(() => permCheck.error).pipe(delay(getRandomLatency()));
  }

  let response$;

  try {
    switch (method) {
      case 'GET':
        response$ = handleGet(db, collection, resourceId, userId);
        break;

      case 'POST':
        response$ = handlePost(db, collection, body, userId);
        break;

      case 'PUT':
        if (!resourceId) {
          response$ = throwError(() => new HttpErrorResponse({
            error: { message: 'Resource ID required for PUT' },
            status: 400,
            statusText: 'Bad Request'
          }));
        } else {
          response$ = handlePut(db, collection, resourceId, body);
        }
        break;

      case 'DELETE':
        if (!resourceId) {
          response$ = throwError(() => new HttpErrorResponse({
            error: { message: 'Resource ID required for DELETE' },
            status: 400,
            statusText: 'Bad Request'
          }));
        } else {
          response$ = handleDelete(db, collection, resourceId);
        }
        break;

      default:
        response$ = throwError(() => new HttpErrorResponse({
          error: { message: 'Method not allowed' },
          status: 405,
          statusText: 'Method Not Allowed'
        }));
    }
  } catch (error: any) {
    response$ = throwError(() => new HttpErrorResponse({
      error: { message: error.message || 'Internal server error' },
      status: 500,
      statusText: 'Internal Server Error'
    }));
  }

  // Simulate network latency
  return response$.pipe(delay(getRandomLatency()));
};

/**
 * Class-based interceptor for app-wide registration with multi: true
 */
@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return fakeBackendInterceptor(req, next.handle.bind(next));
  }
}

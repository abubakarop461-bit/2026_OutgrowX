/**
 * SuryX Local Relational Database Service (IndexedDB)
 *
 * Provides a client-side transactional relational database storing:
 *  - `users`: User identity & role
 *  - `onboarding_profiles`: Role-specific onboarding configurations
 *  - `scanned_bills`: Full historical bill OCR extractions & bill image previews
 *  - `appliance_loads`: Appliance profiles & seasonal load models
 *  - `property_assessments`: Rooftop & Land parcel assessment records
 *  - `user_activities`: Interconnected relational activity logs across all tools
 */

export interface DBUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  userRole: string;
  createdAt: string;
}

export interface DBScannedBill {
  id: string;
  userId: string;
  filename?: string;
  discom: string;
  consumerNumber: string;
  unitsConsumed: number;
  billAmount: number;
  billingPeriod: string;
  consumerCategory: string;
  sanctionedLoad?: number;
  modelUsed?: string;
  base64Image?: string;
  scannedAt: string;
}

export interface DBApplianceLoad {
  id: string;
  userId: string;
  totalMonthlyKWh: number;
  summerHours: number;
  monsoonHours: number;
  winterHours: number;
  activeAppliancesCount: number;
  topAppliance: string;
  calculatedAt: string;
}

export interface DBPropertyAssessment {
  id: string;
  userId: string;
  type: 'roof' | 'land';
  areaValue: number; // sq ft for roof, acres for land
  scoreOrCapacity: number;
  state: string;
  assessedAt: string;
}

export interface DBActivityLog {
  id: string;
  userId: string;
  activityType: 'BILL_SCAN' | 'APPLIANCE_CALC' | 'PROPERTY_ASSESS' | 'AI_CHAT' | 'VENDOR_QUOTE';
  title: string;
  details: string;
  timestamp: string;
}

const DB_NAME = 'suryx_relational_local_db';
const DB_VERSION = 1;

class LocalRelationalDatabase {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.dbPromise = this.initDB();
    }
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store 1: users
        if (!db.objectStoreNames.contains('users')) {
          const store = db.createObjectStore('users', { keyPath: 'id' });
          store.createIndex('email', 'email', { unique: false });
        }

        // Store 2: scanned_bills (relational to userId)
        if (!db.objectStoreNames.contains('scanned_bills')) {
          const store = db.createObjectStore('scanned_bills', { keyPath: 'id' });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('scannedAt', 'scannedAt', { unique: false });
        }

        // Store 3: appliance_loads (relational to userId)
        if (!db.objectStoreNames.contains('appliance_loads')) {
          const store = db.createObjectStore('appliance_loads', { keyPath: 'id' });
          store.createIndex('userId', 'userId', { unique: false });
        }

        // Store 4: property_assessments (relational to userId)
        if (!db.objectStoreNames.contains('property_assessments')) {
          const store = db.createObjectStore('property_assessments', { keyPath: 'id' });
          store.createIndex('userId', 'userId', { unique: false });
        }

        // Store 5: user_activities
        if (!db.objectStoreNames.contains('user_activities')) {
          const store = db.createObjectStore('user_activities', { keyPath: 'id' });
          store.createIndex('userId', 'userId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = this.initDB();
    }
    return this.dbPromise;
  }

  /* ══ BILL SCAN RELATIONAL METHODS ══ */

  async saveScannedBill(bill: Omit<DBScannedBill, 'id' | 'scannedAt'>): Promise<DBScannedBill> {
    const db = await this.getDB();
    const newBill: DBScannedBill = {
      ...bill,
      id: `bill_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      scannedAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(['scanned_bills', 'user_activities'], 'readwrite');
      const store = tx.objectStore('scanned_bills');
      const actStore = tx.objectStore('user_activities');

      store.add(newBill);

      const activity: DBActivityLog = {
        id: `act_${Date.now()}`,
        userId: bill.userId || 'default_user',
        activityType: 'BILL_SCAN',
        title: `Electricity Bill Scanned (${newBill.discom})`,
        details: `${newBill.unitsConsumed} kWh · ₹${newBill.billAmount}`,
        timestamp: newBill.scannedAt,
      };
      actStore.add(activity);

      tx.oncomplete = () => resolve(newBill);
      tx.onerror = () => reject(tx.error);
    });
  }

  async getAllScannedBills(userId: string = 'default_user'): Promise<DBScannedBill[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('scanned_bills', 'readonly');
      const store = tx.objectStore('scanned_bills');
      const request = store.getAll();

      request.onsuccess = () => {
        const results: DBScannedBill[] = request.result || [];
        // Filter by userId if present, and sort by scannedAt desc
        const filtered = results
          .filter(b => !b.userId || b.userId === userId || userId === 'default_user')
          .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());
        resolve(filtered);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteScannedBill(id: string): Promise<boolean> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('scanned_bills', 'readwrite');
      const store = tx.objectStore('scanned_bills');
      const request = store.delete(id);

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  /* ══ APPLIANCE LOAD RELATIONAL METHODS ══ */

  async saveApplianceLoad(load: Omit<DBApplianceLoad, 'id' | 'calculatedAt'>): Promise<DBApplianceLoad> {
    const db = await this.getDB();
    const newLoad: DBApplianceLoad = {
      ...load,
      id: `load_${Date.now()}`,
      calculatedAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(['appliance_loads', 'user_activities'], 'readwrite');
      tx.objectStore('appliance_loads').add(newLoad);
      tx.objectStore('user_activities').add({
        id: `act_${Date.now()}`,
        userId: load.userId || 'default_user',
        activityType: 'APPLIANCE_CALC',
        title: `Appliance Load Modeled (${newLoad.totalMonthlyKWh} kWh/mo)`,
        details: `Top load: ${newLoad.topAppliance}`,
        timestamp: newLoad.calculatedAt,
      });

      tx.oncomplete = () => resolve(newLoad);
      tx.onerror = () => reject(tx.error);
    });
  }

  /* ══ PROPERTY ASSESSMENT RELATIONAL METHODS ══ */

  async savePropertyAssessment(assessment: Omit<DBPropertyAssessment, 'id' | 'assessedAt'>): Promise<DBPropertyAssessment> {
    const db = await this.getDB();
    const newAssessment: DBPropertyAssessment = {
      ...assessment,
      id: `assess_${Date.now()}`,
      assessedAt: new Date().toISOString(),
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(['property_assessments', 'user_activities'], 'readwrite');
      tx.objectStore('property_assessments').add(newAssessment);
      tx.objectStore('user_activities').add({
        id: `act_${Date.now()}`,
        userId: assessment.userId || 'default_user',
        activityType: 'PROPERTY_ASSESS',
        title: `${assessment.type === 'land' ? 'Land Parcel' : 'Rooftop'} Assessment`,
        details: `${assessment.areaValue} ${assessment.type === 'land' ? 'Acres' : 'sq ft'} · Score/Cap: ${assessment.scoreOrCapacity}`,
        timestamp: newAssessment.assessedAt,
      });

      tx.oncomplete = () => resolve(newAssessment);
      tx.onerror = () => reject(tx.error);
    });
  }

  /* ══ ACTIVITY LOG RELATIONAL METHODS ══ */

  async getUserActivities(userId: string = 'default_user'): Promise<DBActivityLog[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('user_activities', 'readonly');
      const store = tx.objectStore('user_activities');
      const request = store.getAll();

      request.onsuccess = () => {
        const results: DBActivityLog[] = request.result || [];
        const filtered = results
          .filter(a => !a.userId || a.userId === userId || userId === 'default_user')
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        resolve(filtered);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const localDB = new LocalRelationalDatabase();

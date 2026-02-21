
export enum ServiceCode {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G'
}

export interface Service {
  id: string;
  code: ServiceCode;
  name: string;
}

export interface QueueItem {
  id: string;
  number: string;
  serviceId: string;
  serviceCode: ServiceCode;
  timestamp: Date;
  status: 'waiting' | 'calling' | 'completed' | 'cancelled';
  counter?: number;
  // ข้อมูลเพิ่มเติมจากการลงทะเบียน
  customerName?: string;
  phone?: string;
  address?: string;
  bookingDate?: string;
  bookingTime?: string;
}

export interface AppState {
  queues: QueueItem[];
  currentCalling: QueueItem | null;
  counters: { [key: number]: QueueItem | null };
}

export interface LoginHistoryItem {
  id: string;
  phone: string;
  timestamp: string;
}

export interface Member {
  id: string;
  fullName: string;
  idCard: string;
  phone: string;
  password?: string; // เพิ่มฟิลด์ password
  registeredAt: string;
  status: 'active' | 'inactive';
}

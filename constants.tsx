
import { ServiceCode, Service } from './types';

export const SERVICES: Service[] = [
  { id: '1', code: ServiceCode.A, name: 'โอนโดยการซื้อขาย' },
  { id: '2', code: ServiceCode.B, name: 'โอนโดยการให้' },
  { id: '3', code: ServiceCode.C, name: 'โอนทางมรดก' },
  { id: '4', code: ServiceCode.D, name: 'โอนโดยการแลกเปลี่ยน' },
  { id: '5', code: ServiceCode.E, name: 'การไถ่ถอนจากการขายฝาก' },
  { id: '6', code: ServiceCode.F, name: 'โอนกรรมสิทธิ์' },
  { id: '7', code: ServiceCode.G, name: 'การแบ่งแยกที่ดิน' },
];

export const APP_THEME = {
  primary: '#007a4d',
  secondary: '#f3f4f6',
};

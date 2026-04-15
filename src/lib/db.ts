import Dexie, { type Table } from 'dexie';
import type { Prospect } from '@/types';

export class MyDatabase extends Dexie {
  prospects!: Table<Prospect>;

  constructor() {
    super('ProspectManagerDB');
    this.version(1).stores({
      prospects: '++id, name, phone, neighborhood, interestLevel, appointmentDate, createdAt'
    });
  }
}

export const db = new MyDatabase();

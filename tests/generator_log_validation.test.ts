import { describe, it, expect, beforeEach } from 'vitest';
import { dataService } from '../src/services/dataService';

describe('Generator Log Validation & Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. should create a generator log entry and calculate operating hours automatically', () => {
    const entry = dataService.saveGeneratorLog({
      date: '2026-08-01',
      dayName: 'السبت',
      previousReading: 100,
      currentReading: 110.5,
      notes: 'تجربة تشغيل اعتيادية',
    });

    expect(entry.id).toBeDefined();
    expect(entry.operatingHours).toBe(10.5);
    expect(entry.createdBy).toBeDefined();

    const logs = dataService.getGeneratorLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].date).toBe('2026-08-01');
  });

  it('2. should block duplicate dates and throw DUPLICATE_DATE_EXISTS error', () => {
    dataService.saveGeneratorLog({
      date: '2026-08-05',
      dayName: 'الأربعاء',
      previousReading: 150,
      currentReading: 160,
    });

    expect(() => {
      dataService.saveGeneratorLog({
        date: '2026-08-05',
        dayName: 'الأربعاء',
        previousReading: 160,
        currentReading: 170,
      });
    }).toThrow('DUPLICATE_DATE_EXISTS');
  });

  it('3. should block saving when currentReading < previousReading', () => {
    expect(() => {
      dataService.saveGeneratorLog({
        date: '2026-08-10',
        dayName: 'الإثنين',
        previousReading: 200,
        currentReading: 195, // invalid
      });
    }).toThrow('CURRENT_READING_LESS_THAN_PREVIOUS');
  });

  it('4. should correctly fetch the latest generator log for previous reading auto-population', () => {
    dataService.saveGeneratorLog({
      date: '2026-08-01',
      dayName: 'السبت',
      previousReading: 0,
      currentReading: 100,
    });

    dataService.saveGeneratorLog({
      date: '2026-08-02',
      dayName: 'الأحد',
      previousReading: 100,
      currentReading: 115,
    });

    const latest = dataService.getLatestGeneratorLog();
    expect(latest).toBeDefined();
    expect(latest?.currentReading).toBe(115);
    expect(latest?.date).toBe('2026-08-02');
  });

  it('5. should update an existing generator log correctly', () => {
    const original = dataService.saveGeneratorLog({
      date: '2026-08-15',
      dayName: 'السبت',
      previousReading: 200,
      currentReading: 210,
      notes: 'قبل التعديل',
    });

    const updated = dataService.saveGeneratorLog({
      id: original.id,
      date: '2026-08-15',
      previousReading: 200,
      currentReading: 215,
      notes: 'بعد التعديل',
    });

    expect(updated.operatingHours).toBe(15);
    expect(updated.notes).toBe('بعد التعديل');
    expect(dataService.getGeneratorLogs()).toHaveLength(1);
  });

  it('6. should delete a generator log entry correctly', () => {
    const entry = dataService.saveGeneratorLog({
      date: '2026-08-20',
      dayName: 'الخميس',
      previousReading: 300,
      currentReading: 308,
    });

    expect(dataService.getGeneratorLogs()).toHaveLength(1);
    dataService.deleteGeneratorLog(entry.id);
    expect(dataService.getGeneratorLogs()).toHaveLength(0);
  });

  it('7. should confirm that existing materials and transactions logic remain untouched', () => {
    const materials = dataService.getMaterials();
    expect(materials.length).toBeGreaterThan(0);
    const transactions = dataService.getTransactions();
    expect(transactions.length).toBeGreaterThan(0);
  });
});

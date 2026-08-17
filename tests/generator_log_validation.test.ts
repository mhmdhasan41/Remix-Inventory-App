import { describe, it, expect, beforeEach } from 'vitest';
import { dataService } from '../src/services/dataService';

describe('Generator Log Validation & Advanced Recalculation Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. should allow manual entry of previous reading when system starts empty (first record)', () => {
    const entry = dataService.saveGeneratorLog({
      date: '2026-08-01',
      dayName: 'السبت',
      previousReading: 500, // manual initial reading
      currentReading: 512,
      notes: 'أول سجل في النظام',
    });

    expect(entry.id).toBeDefined();
    expect(entry.previousReading).toBe(500);
    expect(entry.currentReading).toBe(512);
    expect(entry.operatingHours).toBe(12);

    const logs = dataService.getGeneratorLogs();
    expect(logs).toHaveLength(1);
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

  it('3. should block saving when currentReading < previousReading in sequence', () => {
    expect(() => {
      dataService.saveGeneratorLog({
        date: '2026-08-10',
        dayName: 'الإثنين',
        previousReading: 200,
        currentReading: 195, // invalid
      });
    }).toThrow();
  });

  it('4. should insert an old date record (e.g. 03/08 between 01/08 and 05/08) and recalculate subsequent entries chronologically', () => {
    // 01/08
    dataService.saveGeneratorLog({
      date: '2026-08-01',
      previousReading: 100,
      currentReading: 110, // 10 hrs
    });

    // 05/08
    dataService.saveGeneratorLog({
      date: '2026-08-05',
      currentReading: 130, // was previous 110 => 20 hrs
    });

    let logs = dataService.getGeneratorLogs();
    expect(logs[1].previousReading).toBe(110);
    expect(logs[1].operatingHours).toBe(20);

    // Insert 03/08 with currentReading = 120
    dataService.saveGeneratorLog({
      date: '2026-08-03',
      currentReading: 120,
    });

    logs = dataService.getGeneratorLogs();
    expect(logs).toHaveLength(3);

    // 01/08: prev 100, cur 110, hrs 10
    expect(logs[0].date).toBe('2026-08-01');
    expect(logs[0].previousReading).toBe(100);
    expect(logs[0].currentReading).toBe(110);
    expect(logs[0].operatingHours).toBe(10);

    // 03/08: prev 110, cur 120, hrs 10
    expect(logs[1].date).toBe('2026-08-03');
    expect(logs[1].previousReading).toBe(110);
    expect(logs[1].currentReading).toBe(120);
    expect(logs[1].operatingHours).toBe(10);

    // 05/08: prev 120 (recalculated!), cur 130, hrs 10 (recalculated!)
    expect(logs[2].date).toBe('2026-08-05');
    expect(logs[2].previousReading).toBe(120);
    expect(logs[2].currentReading).toBe(130);
    expect(logs[2].operatingHours).toBe(10);
  });

  it('5. should edit an old record and recalculate all subsequent logs', () => {
    dataService.saveGeneratorLog({ date: '2026-08-01', previousReading: 100, currentReading: 110 });
    const log2 = dataService.saveGeneratorLog({ date: '2026-08-02', currentReading: 120 });
    dataService.saveGeneratorLog({ date: '2026-08-03', currentReading: 130 });

    // Edit 02/08 currentReading from 120 to 125
    dataService.saveGeneratorLog({
      id: log2.id,
      date: '2026-08-02',
      currentReading: 125,
    });

    const logs = dataService.getGeneratorLogs();
    // 03/08 should now have previousReading 125 and operatingHours 5
    expect(logs[2].previousReading).toBe(125);
    expect(logs[2].currentReading).toBe(130);
    expect(logs[2].operatingHours).toBe(5);
  });

  it('6. should delete a record and recalculate subsequent log previous readings and operating hours', () => {
    dataService.saveGeneratorLog({ date: '2026-08-01', previousReading: 100, currentReading: 110 });
    const log2 = dataService.saveGeneratorLog({ date: '2026-08-02', currentReading: 120 });
    dataService.saveGeneratorLog({ date: '2026-08-03', currentReading: 130 });

    // Delete 02/08
    dataService.deleteGeneratorLog(log2.id);

    const logs = dataService.getGeneratorLogs();
    expect(logs).toHaveLength(2);

    // 03/08 should now have previousReading = 110 (from 01/08) and operatingHours = 20
    expect(logs[1].date).toBe('2026-08-03');
    expect(logs[1].previousReading).toBe(110);
    expect(logs[1].currentReading).toBe(130);
    expect(logs[1].operatingHours).toBe(20);
  });

  it('7. should run simulation and provide impact analysis without mutating state until commit', () => {
    dataService.saveGeneratorLog({ date: '2026-08-01', previousReading: 100, currentReading: 110 });
    dataService.saveGeneratorLog({ date: '2026-08-05', currentReading: 130 });

    const sim = dataService.simulateSaveGeneratorLog({
      date: '2026-08-03',
      currentReading: 120,
    });

    expect(sim.affectedCount).toBeGreaterThan(0);
    expect(sim.impactedItems.length).toBeGreaterThan(0);
    expect(sim.lastAffectedRecordDate).toBe('2026-08-05');

    // State in localStorage should still have only 2 logs before commit
    expect(dataService.getGeneratorLogs()).toHaveLength(2);

    // Now commit
    dataService.commitGeneratorLogs(sim.proposedLogs);
    expect(dataService.getGeneratorLogs()).toHaveLength(3);
  });

  it('8. should confirm that existing materials and transactions logic remain untouched', () => {
    const materials = dataService.getMaterials();
    expect(materials.length).toBeGreaterThan(0);
    const transactions = dataService.getTransactions();
    expect(transactions.length).toBeGreaterThan(0);
  });

  it('9. should authenticate user with plain username or full email, default or custom password', async () => {
    // Test default admin login with plain 'admin' or 'admin@system.com'
    const res1 = await dataService.login('admin', 'admin');
    expect(res1.success).toBe(true);

    const res2 = await dataService.login('admin@system.com', 'admin');
    expect(res2.success).toBe(true);

    // Test default keeper login with plain 'keeper' or 'keeper@system.com'
    const res3 = await dataService.login('keeper', '123456');
    expect(res3.success).toBe(true);

    const res4 = await dataService.login('keeper@system.com', '123456');
    expect(res4.success).toBe(true);
  });
});

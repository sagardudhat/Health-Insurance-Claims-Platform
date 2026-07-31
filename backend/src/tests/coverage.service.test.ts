import assert from 'node:assert';
import { coverageService } from '../services/coverage.service';

/**
 * Unit Tests for Health Insurance Claims Coverage Calculation Engine
 *
 * Verifies Policy Business Rules:
 * 1. Annual Deductible ($500 default)
 * 2. Coverage Rate (80% default)
 * 3. Annual Coverage Limit ($10,000 default)
 * 4. Partially Denied Line Items
 */
function runTests() {
  console.log('🧪 Running Unit Tests: Coverage Calculation Engine...\n');
  let passedCount = 0;

  const defaultConfig = {
    annualLimit: 10000,
    deductible: 500,
    coverageRate: 0.8,
  };

  // Test 1: Deductible Not Yet Met
  // Claim: $300, Deductible Remaining: $500
  // Expected: Covered = $0, Patient Resp = $300
  try {
    const items = [{ description: 'Office Visit', quantity: 1, unitCost: 300 }];
    const res = coverageService.calculateCoverage(items, [], 0, 0, defaultConfig);

    assert.strictEqual(res.coveredAmount, 0, 'Covered amount should be 0 when under deductible');
    assert.strictEqual(
      res.patientResponsibility,
      300,
      'Patient pays full amount when under deductible'
    );
    assert.strictEqual(res.deductibleApplied, 300, 'Entire $300 applied to deductible');
    console.log(
      '✅ Test 1 Passed: Deductible Not Yet Met ($300 claim -> $0 covered, $300 patient resp)'
    );
    passedCount++;
  } catch (err: any) {
    console.error('❌ Test 1 Failed:', err.message);
  }

  // Test 2: Deductible Partially Met
  // Deductible Already Met: $300 (Remaining: $200). Claim: $1,000
  // First $200 -> Deductible. Remaining $800 * 80% = $640 Covered.
  // Patient Resp = $200 + $160 coinsurance = $360
  try {
    const items = [{ description: 'Blood Panel & Lab', quantity: 1, unitCost: 1000 }];
    const res = coverageService.calculateCoverage(items, [], 300, 0, defaultConfig);

    assert.strictEqual(res.deductibleApplied, 200, 'Deductible applied should be remaining $200');
    assert.strictEqual(res.coveredAmount, 640, 'Covered amount should be 80% of $800 = $640');
    assert.strictEqual(res.patientResponsibility, 360, 'Patient responsibility should be $360');
    console.log(
      '✅ Test 2 Passed: Deductible Partially Met ($1,000 claim -> $640 covered, $360 patient resp)'
    );
    passedCount++;
  } catch (err: any) {
    console.error('❌ Test 2 Failed:', err.message);
  }

  // Test 3: Deductible Already Met
  // Deductible Already Met: $500 (Remaining: $0). Claim: $2,000
  // Insurance Pays: $2,000 * 80% = $1,600. Patient Pays: $400 coinsurance.
  try {
    const items = [{ description: 'MRI Scan', quantity: 1, unitCost: 2000 }];
    const res = coverageService.calculateCoverage(items, [], 500, 0, defaultConfig);

    assert.strictEqual(res.deductibleApplied, 0, 'No deductible applied since met');
    assert.strictEqual(res.coveredAmount, 1600, 'Covered amount should be 80% of $2,000 = $1,600');
    assert.strictEqual(res.patientResponsibility, 400, 'Patient pays 20% coinsurance = $400');
    console.log(
      '✅ Test 3 Passed: Deductible Already Met ($2,000 claim -> $1,600 covered, $400 patient resp)'
    );
    passedCount++;
  } catch (err: any) {
    console.error('❌ Test 3 Failed:', err.message);
  }

  // Test 4: Annual Coverage Limit Reached
  // Deductible Already Met: $500. Already Covered This Year: $9,500 (Remaining limit: $500)
  // Claim: $2,000. Normal 80% = $1,600, but capped at $500 remaining limit.
  // Covered = $500, Patient Resp = $1,500
  try {
    const items = [{ description: 'Outpatient Surgery', quantity: 1, unitCost: 2000 }];
    const res = coverageService.calculateCoverage(items, [], 500, 9500, defaultConfig);

    assert.strictEqual(
      res.coveredAmount,
      500,
      'Covered amount should be capped at remaining annual limit of $500'
    );
    assert.strictEqual(res.patientResponsibility, 1500, 'Patient pays remaining $1,500');
    console.log(
      '✅ Test 4 Passed: Annual Coverage Limit Reached ($2,000 claim -> $500 covered, $1,500 patient resp)'
    );
    passedCount++;
  } catch (err: any) {
    console.error('❌ Test 4 Failed:', err.message);
  }

  // Test 5: Partially Denied Line Items
  // Item 1: $800 (Approved), Item 2: $200 (Denied). Deductible Already Met: $500.
  // Approved Items Total = $800 * 80% = $640 Covered.
  // Total Claimed = $1,000. Patient Resp = $1,000 - $640 = $360.
  try {
    const items = [
      { _id: 'item-1', description: 'Consultation', quantity: 1, unitCost: 800 },
      { _id: 'item-2', description: 'Uncovered Cosmetic Add-on', quantity: 1, unitCost: 200 },
    ];
    const res = coverageService.calculateCoverage(items, ['item-2'], 500, 0, defaultConfig);

    assert.strictEqual(
      res.approvedItemsTotal,
      800,
      'Approved items total should exclude denied item'
    );
    assert.strictEqual(
      res.coveredAmount,
      640,
      'Covered amount should be 80% of $800 approved = $640'
    );
    assert.strictEqual(
      res.patientResponsibility,
      360,
      'Patient pays $160 coinsurance + $200 denied item = $360'
    );
    console.log(
      '✅ Test 5 Passed: Partially Denied Line Items (1 denied item -> excluded from coverage)'
    );
    passedCount++;
  } catch (err: any) {
    console.error('❌ Test 5 Failed:', err.message);
  }

  console.log(`\n🎉 Test Suite Completed: ${passedCount}/5 tests passed successfully!\n`);
}

runTests();

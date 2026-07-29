import { claimRepository, ClaimRepository } from '../repositories/claim.repository';
import { IClaimDocument, ILineItem } from '../models/Claim.model';
import { POLICY_RULES } from '../config/constants';

export interface CoverageCalculationResult {
  totalClaimed: number;
  approvedItemsTotal: number;
  deductibleApplied: number;
  afterDeductible: number;
  rawCovered: number;
  coveredAmount: number;
  patientResponsibility: number;
  deductibleMetThisYear: number;
  coveredUsedThisYear: number;
}

export class CoverageService {
  private claimRepo: ClaimRepository;

  constructor() {
    this.claimRepo = claimRepository;
  }

  /**
   * Pure domain calculation for policy coverage math
   * Formula:
   * 1. approvedItemsTotal = Σ (item.quantity * item.unitCost) for approved items
   * 2. remainingDeductible = max(0, 500 - deductibleAlreadyMetThisYear)
   * 3. afterDeductible = max(0, approvedItemsTotal - remainingDeductible)
   * 4. rawCovered = afterDeductible * 0.8
   * 5. remainingAnnualLimit = max(0, 10000 - alreadyCoveredThisYearForPolicy)
   * 6. coveredAmount = min(rawCovered, remainingAnnualLimit)
   * 7. patientResponsibility = approvedItemsTotal - coveredAmount
   */
  calculateCoverage(
    items: ILineItem[],
    deniedItemIds: string[] = [],
    deductibleAlreadyMetThisYear: number = 0,
    alreadyCoveredThisYearForPolicy: number = 0
  ): CoverageCalculationResult {
    // Standardize items to plain objects with safe numeric values
    const safeDeniedIds = (deniedItemIds || []).map((id) => id.toString());

    const plainItems = (items || []).map((item: any) => {
      const raw = typeof item.toObject === 'function' ? item.toObject() : item;
      const itemId = raw._id ? raw._id.toString() : '';
      const isDenied = raw.isDenied || safeDeniedIds.includes(itemId);
      const quantity = Number(raw.quantity) || 0;
      const unitCost = Number(raw.unitCost) || 0;

      return {
        ...raw,
        _id: itemId,
        quantity,
        unitCost,
        isDenied,
      };
    });

    const approvedItemsTotal = plainItems.reduce((sum, item) => {
      if (item.isDenied) return sum;
      return sum + item.quantity * item.unitCost;
    }, 0);

    const totalClaimed = plainItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

    const ANNUAL_LIMIT = POLICY_RULES.ANNUAL_LIMIT || 10000;
    const DEDUCTIBLE = POLICY_RULES.DEDUCTIBLE || 500;
    const RATE = POLICY_RULES.COVERAGE_RATE || 0.8;

    const safeDeductibleMet = Number(deductibleAlreadyMetThisYear) || 0;
    const safeAlreadyCovered = Number(alreadyCoveredThisYearForPolicy) || 0;

    // 1. Calculate deductible portion for this claim
    const remainingDeductible = Math.max(0, DEDUCTIBLE - safeDeductibleMet);
    const deductibleApplied = Math.min(approvedItemsTotal, remainingDeductible);

    // 2. Calculate remaining amount after deductible
    const afterDeductible = Math.max(0, approvedItemsTotal - deductibleApplied);

    // 3. Raw 80% coverage
    const rawCovered = afterDeductible * RATE;

    // 4. Cap against annual limit
    const remainingAnnualLimit = Math.max(0, ANNUAL_LIMIT - safeAlreadyCovered);
    const coveredAmount = Math.min(rawCovered, remainingAnnualLimit);

    // 5. Patient responsibility = total claimed - coveredAmount
    const patientResponsibility = Math.max(0, totalClaimed - coveredAmount);

    const finalCoveredAmount = isNaN(coveredAmount) || coveredAmount < 0 ? 0 : Number(coveredAmount.toFixed(2));
    const finalPatientResp = isNaN(patientResponsibility) || patientResponsibility < 0 ? 0 : Number(patientResponsibility.toFixed(2));

    return {
      totalClaimed: Number(totalClaimed.toFixed(2)),
      approvedItemsTotal: Number(approvedItemsTotal.toFixed(2)),
      deductibleApplied: Number(deductibleApplied.toFixed(2)),
      afterDeductible: Number(afterDeductible.toFixed(2)),
      rawCovered: Number(rawCovered.toFixed(2)),
      coveredAmount: finalCoveredAmount,
      patientResponsibility: finalPatientResp,
      deductibleMetThisYear: safeDeductibleMet + deductibleApplied,
      coveredUsedThisYear: safeAlreadyCovered + finalCoveredAmount,
    };
  }

  /**
   * Fetches prior approved/paid claims for policy in current year and calculates coverage
   */
  async calculateCoverageForClaim(
    claim: IClaimDocument,
    deniedItemIds: string[] = []
  ): Promise<CoverageCalculationResult> {
    const calendarYear = new Date(claim.procedure.dateOfService || claim.createdAt).getFullYear();
    const policyNumber = claim.patient.policyNumber;

    const priorClaims = await this.claimRepo.findApprovedClaimsForPolicyInYear(
      policyNumber,
      calendarYear
    );

    // Filter out current claim if it was previously approved
    const pastClaims = priorClaims.filter((c) => c._id.toString() !== claim._id.toString());

    // Compute deductible already met and annual limit used this calendar year
    let deductibleAlreadyMet = 0;
    let alreadyCovered = 0;

    for (const prior of pastClaims) {
      alreadyCovered += Number(prior.coveredAmount) || 0;

      const priorApprovedTotal = (prior.items || []).reduce((sum, item: any) => {
        const raw = typeof item.toObject === 'function' ? item.toObject() : item;
        if (raw.isDenied) return sum;
        const qty = Number(raw.quantity) || 0;
        const cost = Number(raw.unitCost) || 0;
        return sum + qty * cost;
      }, 0);

      const priorDeductible = Math.min(
        priorApprovedTotal,
        POLICY_RULES.DEDUCTIBLE - deductibleAlreadyMet
      );
      deductibleAlreadyMet += Math.max(0, priorDeductible);
    }

    return this.calculateCoverage(
      claim.items,
      deniedItemIds,
      deductibleAlreadyMet,
      alreadyCovered
    );
  }
}

export const coverageService = new CoverageService();

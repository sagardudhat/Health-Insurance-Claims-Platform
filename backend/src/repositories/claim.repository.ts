import { Claim, IClaimDocument } from '../models/Claim.model';
import { ClaimStatus, PaginatedResult } from '../types';
import mongoose from 'mongoose';

export class ClaimRepository {
  async create(data: Partial<IClaimDocument>): Promise<IClaimDocument> {
    const claim = new Claim(data);
    return claim.save();
  }

  async findById(id: string): Promise<IClaimDocument | null> {
    return Claim.findById(id).populate('submittedBy', 'name email role');
  }

  async findBySubmittedUser(userId: string): Promise<IClaimDocument[]> {
    return Claim.find({ submittedBy: userId }).sort({ createdAt: -1 });
  }

  async findQueue(): Promise<IClaimDocument[]> {
    return Claim.find({
      status: { $in: ['SUBMITTED', 'UNDER_REVIEW'] },
    })
      .populate('submittedBy', 'name email role')
      .sort({ createdAt: 1 });
  }

  async findAll(filter: Record<string, any> = {}): Promise<IClaimDocument[]> {
    return Claim.find(filter)
      .populate('submittedBy', 'name email role')
      .sort({ createdAt: -1 });
  }

  /**
   * MongoDB Server-Side Paginated & Search Query Execution
   */
  async findPaginated(
    filter: Record<string, any> = {},
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<PaginatedResult<IClaimDocument>> {
    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, limit);
    const skip = (pageNum - 1) * limitNum;

    const query = { ...filter };

    if (search && search.trim().length > 0) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { 'patient.name': regex },
        { 'patient.policyNumber': regex },
        { 'procedure.name': regex },
        { 'procedure.code': regex },
      ];
    }

    const totalItems = await Claim.countDocuments(query);
    const data = await Claim.find(query)
      .populate('submittedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const totalPages = Math.ceil(totalItems / limitNum) || 1;

    return {
      data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: pageNum,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    };
  }

  async updateStatus(
    id: string,
    updateData: {
      status: ClaimStatus;
      coveredAmount?: number;
      patientResponsibility?: number;
      reviewerNotes?: string;
      items?: any[];
      flagged?: boolean;
      flagReason?: string;
    }
  ): Promise<IClaimDocument | null> {
    return Claim.findByIdAndUpdate(id, updateData, { new: true });
  }

  async updateClaimData(
    id: string,
    updateData: Partial<IClaimDocument>
  ): Promise<IClaimDocument | null> {
    return Claim.findByIdAndUpdate(id, updateData, { new: true });
  }

  async findApprovedClaimsForPolicyInYear(
    policyNumber: string,
    year: number
  ): Promise<IClaimDocument[]> {
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59);

    return Claim.find({
      'patient.policyNumber': policyNumber,
      status: { $in: ['APPROVED', 'PARTIALLY_APPROVED', 'PAID'] },
      $or: [
        { 'procedure.dateOfService': { $gte: startOfYear, $lte: endOfYear } },
        { createdAt: { $gte: startOfYear, $lte: endOfYear } },
      ],
    }).sort({ createdAt: 1 });
  }

  async findByProcedureCode(code: string): Promise<IClaimDocument[]> {
    return Claim.find({ 'procedure.code': code.toUpperCase().trim() });
  }
}

export const claimRepository = new ClaimRepository();

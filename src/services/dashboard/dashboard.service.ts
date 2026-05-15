import { Contract } from '@/models/contract.model'
import { DisputeForm } from '@/models/dispute_form.model'
import { WalletTransaction } from '@/models/wallet_transaction.model'
import { Project } from '@/models/project.model'
import { Wallet } from '@/models/wallet.model'
import { User } from '@/models/user.model'
import mongoose from 'mongoose'
import { WithdrawRequest } from '@/models/withdraw_request.model'

type Granularity = 'day' | 'month' | 'year'

interface TimeseriesBucket {
  label: string
  sortKey: string
  contracts: number
  completedProjects: number
  disputes: number
  revenueContractVnd: number
  revenueWalletVnd?: number
}

interface DashboardSummary {
  totalContracts: number
  completedProjects: number
  disputeCases: number
  revenueContractVnd: number
  revenueWalletVnd?: number
}

interface DashboardResult {
  buckets: TimeseriesBucket[]
  summary: DashboardSummary
}

// ─── Helpers ────────────────────────────────────────────────────
function buildDateGroupId(granularity: Granularity, field: any = '$createdAt') {
  if (granularity === 'day') {
    return { year: { $year: field }, month: { $month: field }, day: { $dayOfMonth: field } }
  }
  if (granularity === 'month') {
    return { year: { $year: field }, month: { $month: field } }
  }
  return { year: { $year: field } }
}

function toSortKey(group: any, granularity: Granularity): string {
  const y = String(group.year).padStart(4, '0')
  if (granularity === 'day') {
    const m = String(group.month).padStart(2, '0')
    const d = String(group.day).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  if (granularity === 'month') {
    const m = String(group.month).padStart(2, '0')
    return `${y}-${m}`
  }
  return y
}

function toLabel(sortKey: string, granularity: Granularity): string {
  if (granularity === 'day') {
    // YYYY-MM-DD → DD/MM
    const parts = sortKey.split('-')
    return `${parts[2]}/${parts[1]}`
  }
  if (granularity === 'month') {
    // YYYY-MM → MM/YYYY
    const parts = sortKey.split('-')
    return `${parts[1]}/${parts[0]}`
  }
  return sortKey // YYYY
}

/** Generate all expected bucket keys in the range so empty periods still appear. */
function enumerateKeys(from: Date, to: Date, granularity: Granularity): string[] {
  const keys: string[] = []
  const cursor = new Date(from)
  let guard = 0

  if (granularity === 'day') {
    cursor.setUTCHours(0, 0, 0, 0)
    while (cursor <= to && guard < 400) {
      const y = cursor.getUTCFullYear()
      const m = String(cursor.getUTCMonth() + 1).padStart(2, '0')
      const d = String(cursor.getUTCDate()).padStart(2, '0')
      keys.push(`${y}-${m}-${d}`)
      cursor.setUTCDate(cursor.getUTCDate() + 1)
      guard++
    }
  } else if (granularity === 'month') {
    cursor.setUTCDate(1)
    cursor.setUTCHours(0, 0, 0, 0)
    while (cursor <= to && guard < 120) {
      const y = cursor.getUTCFullYear()
      const m = String(cursor.getUTCMonth() + 1).padStart(2, '0')
      keys.push(`${y}-${m}`)
      cursor.setUTCMonth(cursor.getUTCMonth() + 1)
      guard++
    }
  } else {
    cursor.setUTCMonth(0, 1)
    cursor.setUTCHours(0, 0, 0, 0)
    while (cursor <= to && guard < 30) {
      keys.push(String(cursor.getUTCFullYear()))
      cursor.setUTCFullYear(cursor.getUTCFullYear() + 1)
      guard++
    }
  }

  return keys
}

// ─── Main service ───────────────────────────────────────────────
export const dashboardService = {
  async getDashboard(from: Date, to: Date, granularity: Granularity): Promise<DashboardResult> {
    const dateFilter = { $gte: from, $lte: to }
    const groupId = buildDateGroupId(granularity)

    // Run all aggregations in parallel
    const [contractBuckets, completedBuckets, disputeBuckets, revenueContractBuckets, revenueWalletBuckets] =
      await Promise.all([
        // 1) Contracts created in period
        Contract.aggregate([{ $match: { createdAt: dateFilter } }, { $group: { _id: groupId, count: { $sum: 1 } } }]),

        // 2) Contracts completed in period (status = 'completed', using endAt or updatedAt)
        Contract.aggregate([
          {
            $match: {
              status: 'completed',
              $or: [{ endAt: dateFilter }, { updatedAt: dateFilter }]
            }
          },
          {
            $addFields: {
              completedDate: { $ifNull: ['$endAt', '$updatedAt'] }
            }
          },
          {
            $group: {
              _id: buildDateGroupId(granularity, '$completedDate'),
              count: { $sum: 1 }
            }
          }
        ]),

        // 3) Dispute cases created in period
        DisputeForm.aggregate([
          { $match: { createdAt: dateFilter } },
          { $group: { _id: groupId, count: { $sum: 1 } } }
        ]),

        // 4) Revenue = admin_fee transactions completed in period
        Contract.aggregate([
          {
            $match: {
              status: 'completed',
              createdAt: dateFilter
            }
          },
          { $group: { _id: groupId, total: { $sum: '$adminFee' } } }
        ]),

        WithdrawRequest.aggregate([
          {
            $match: {
              status: 'approved',
              createdAt: dateFilter
            }
          },
          { $group: { _id: groupId, total: { $sum: '$fee' } } }
        ])
      ])

    // Index aggregation results by sortKey for O(1) lookup
    const contractMap: Record<string, number> = {}
    for (const b of contractBuckets) {
      contractMap[toSortKey(b._id, granularity)] = b.count
    }

    const completedMap: Record<string, number> = {}
    for (const b of completedBuckets) {
      completedMap[toSortKey(b._id, granularity)] = b.count
    }

    const disputeMap: Record<string, number> = {}
    for (const b of disputeBuckets) {
      disputeMap[toSortKey(b._id, granularity)] = b.count
    }

    const revenueContractMap: Record<string, number> = {}
    for (const b of revenueContractBuckets) {
      revenueContractMap[toSortKey(b._id, granularity)] = b.total
    }

    const revenueWalletMap: Record<string, number> = {}
    for (const b of revenueWalletBuckets) {
      revenueWalletMap[toSortKey(b._id, granularity)] = b.total
    }

    // Build final sorted buckets (with zero-filled gaps)
    const allKeys = enumerateKeys(from, to, granularity)
    const buckets: TimeseriesBucket[] = allKeys.map((key) => ({
      label: toLabel(key, granularity),
      sortKey: key,
      contracts: contractMap[key] ?? 0,
      completedProjects: completedMap[key] ?? 0,
      disputes: disputeMap[key] ?? 0,
      revenueContractVnd: revenueContractMap[key] ?? 0,
      revenueWalletVnd: revenueWalletMap[key] ?? 0
    }))

    // Summary = sum of all buckets
    const summary: DashboardSummary = buckets.reduce(
      (acc, b) => ({
        totalContracts: acc.totalContracts + b.contracts,
        completedProjects: acc.completedProjects + b.completedProjects,
        disputeCases: acc.disputeCases + b.disputes,
        revenueContractVnd: acc.revenueContractVnd + b.revenueContractVnd,
        revenueWalletVnd: acc.revenueWalletVnd + (b.revenueWalletVnd ?? 0)
      }),
      { totalContracts: 0, completedProjects: 0, disputeCases: 0, revenueContractVnd: 0, revenueWalletVnd: 0 }
    )

    return { buckets, summary }
  },

  async getPersonalDashboard(userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format')
    }

    const user = await User.findById(userId).select('role fullName').lean()
    if (!user) {
      throw new Error('User not found')
    }

    // Get wallet balance
    const wallet = await Wallet.findOne({ userId }).select('balance').lean()
    const walletBalance = wallet?.balance || 0

    if (user.role === 'contractor') {
      // Contractor stats
      const [openProjects, activeContracts, escrowAmount, totalSpent, activeProjectsData, activeContractsData] =
        await Promise.all([
          Project.countDocuments({ contractorId: userId, status: { $in: ['open', 'in_progress'] } }),
          Contract.countDocuments({ contractorId: userId, status: { $in: ['in_progress', 'pending_approval'] } }),
          Contract.aggregate([
            { $match: { contractorId: new mongoose.Types.ObjectId(userId), status: 'in_progress' } },
            { $group: { _id: null, total: { $sum: '$totalEscrowAmount' } } }
          ]),
          Contract.aggregate([
            { $match: { contractorId: new mongoose.Types.ObjectId(userId), status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
          ]),
          Project.find({ contractorId: userId, status: { $in: ['open', 'in_progress'] } })
            .select('_id title status createdAt')
            .limit(2)
            .lean(),
          Contract.find({ contractorId: userId, status: { $in: ['in_progress', 'pending_approval'] } })
            .select('_id projectId deadline status createdAt')
            .populate('projectId', 'title')
            .limit(2)
            .lean()
        ])

      return {
        role: 'contractor',
        fullName: user.fullName,
        stats: {
          openProjects,
          activeContracts,
          escrowAmount: escrowAmount[0]?.total || 0,
          totalSpent: totalSpent[0]?.total || 0
        },
        walletBalance,
        recentProjects: activeProjectsData || [],
        recentContracts: activeContractsData || []
      }
    } else {
      // Freelancer stats
      const [applications, activeContracts, escrowAmount, totalEarned, applications2, contracts2] = await Promise.all([
        // Count applications submitted
        Contract.countDocuments({
          freelancerId: userId,
          status: { $in: ['pending_approval', 'pending_freelancer_agreement'] }
        }),
        // Count active contracts
        Contract.countDocuments({ freelancerId: userId, status: 'in_progress' }),
        // Escrow amount waiting for release
        Contract.aggregate([
          { $match: { freelancerId: new mongoose.Types.ObjectId(userId), status: 'in_progress' } },
          { $group: { _id: null, total: { $sum: '$releasedToFreelancer' } } }
        ]),
        // Total earned
        Contract.aggregate([
          { $match: { freelancerId: new mongoose.Types.ObjectId(userId), status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$releasedToFreelancer' } } }
        ]),
        Contract.find({ freelancerId: userId, status: { $in: ['pending_approval', 'pending_freelancer_agreement'] } })
          .select('_id projectId status createdAt')
          .populate('projectId', 'title')
          .limit(2)
          .lean(),
        Contract.find({ freelancerId: userId, status: 'in_progress' })
          .select('_id projectId deadline status submittedAt')
          .populate('projectId', 'title')
          .limit(2)
          .lean()
      ])

      return {
        role: 'freelancer',
        fullName: user.fullName,
        stats: {
          applications,
          activeContracts,
          escrowAmount: escrowAmount[0]?.total || 0,
          totalEarned: totalEarned[0]?.total || 0
        },
        walletBalance,
        recentApplications: applications2 || [],
        recentContracts: contracts2 || []
      }
    }
  }
}

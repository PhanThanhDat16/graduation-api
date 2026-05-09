import { Contract } from '@/models/contract.model'
import { DisputeForm } from '@/models/dispute_form.model'
import { WalletTransaction } from '@/models/wallet_transaction.model'

type Granularity = 'day' | 'month' | 'year'

interface TimeseriesBucket {
  label: string
  sortKey: string
  contracts: number
  completedProjects: number
  disputes: number
  revenueVnd: number
}

interface DashboardSummary {
  totalContracts: number
  completedProjects: number
  disputeCases: number
  revenueVnd: number
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
    const [contractBuckets, completedBuckets, disputeBuckets, revenueBuckets] = await Promise.all([
      // 1) Contracts created in period
      Contract.aggregate([
        { $match: { createdAt: dateFilter } },
        { $group: { _id: groupId, count: { $sum: 1 } } }
      ]),

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
      WalletTransaction.aggregate([
        {
          $match: {
            type: 'admin_fee',
            status: 'completed',
            createdAt: dateFilter
          }
        },
        { $group: { _id: groupId, total: { $sum: '$amount' } } }
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

    const revenueMap: Record<string, number> = {}
    for (const b of revenueBuckets) {
      revenueMap[toSortKey(b._id, granularity)] = b.total
    }

    // Build final sorted buckets (with zero-filled gaps)
    const allKeys = enumerateKeys(from, to, granularity)
    const buckets: TimeseriesBucket[] = allKeys.map((key) => ({
      label: toLabel(key, granularity),
      sortKey: key,
      contracts: contractMap[key] ?? 0,
      completedProjects: completedMap[key] ?? 0,
      disputes: disputeMap[key] ?? 0,
      revenueVnd: revenueMap[key] ?? 0
    }))

    // Summary = sum of all buckets
    const summary: DashboardSummary = buckets.reduce(
      (acc, b) => ({
        totalContracts: acc.totalContracts + b.contracts,
        completedProjects: acc.completedProjects + b.completedProjects,
        disputeCases: acc.disputeCases + b.disputes,
        revenueVnd: acc.revenueVnd + b.revenueVnd
      }),
      { totalContracts: 0, completedProjects: 0, disputeCases: 0, revenueVnd: 0 }
    )

    return { buckets, summary }
  }
}

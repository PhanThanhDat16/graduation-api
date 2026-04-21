import { PaginationQuery, PaginationResult } from '@/constants/pagination.constant'

export const paginate = async <T>(
  model: any,
  filter: any,
  query: PaginationQuery,
  select: string,
  populate?: any
): Promise<PaginationResult<T>> => {
  const page = Number(query.page) || 1
  const limit = Number(query.limit) || 10
  const skip = (page - 1) * limit

  const sortField = query.sortBy || 'createdAt'
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1

  let mongooseQuery = model.find(filter)
    .select(select)
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(limit)

  if (populate) {
    mongooseQuery = mongooseQuery.populate(populate)
  }

  const [data, total] = await Promise.all([
    mongooseQuery.lean(),
    model.countDocuments(filter)
  ])

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
}
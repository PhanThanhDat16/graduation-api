import { EContractStatus } from '@/constants/contract.constants'
import { ICreateReview, IUpdateReview, ReviewQuery } from '@/constants/review.constants'
import { Contract } from '@/models/contract.model'
import { Review } from '@/models/review.model'
import { paginate } from '@/utils/paginate'
import mongoose from 'mongoose'

const REVIEW_SAFE_FIELDS = '_id contractId reviewerId revieweeId role rating comment createdAt updatedAt'

const createReview = async (reviewerId: string, data: ICreateReview) => {
  if (!mongoose.Types.ObjectId.isValid(data.contractId)) {
    throw new Error('Invalid contract ID format')
  }

  if (!mongoose.Types.ObjectId.isValid(reviewerId)) {
    throw new Error('Invalid reviewer ID format')
  }

  if (data.rating < 1 || data.rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }

  // check authorization
  const contract = await Contract.findById(data.contractId)

  let role: 'freelancer' | 'contractor'
  let revieweeId: string

  if(!contract){
    throw new Error('Contract not found')
  }

  if (contract.status !== EContractStatus.COMPLETED) {
    throw new Error('Cannot review unfinished contract')
  }

  if(contract.contractor_id.toString() === reviewerId){
    role = 'contractor'
    revieweeId = contract.freelancer_id.toString()
  } else if (contract.freelancer_id.toString() === reviewerId){
    role = 'freelancer'
    revieweeId = contract.contractor_id.toString()
  } else {
    throw new Error('You are not authorized to review this contract!')
  }

  // Check if a review already exists for this contract by this contractor
   const existingReview = await Review.findOne({
    contractId: data.contractId,
    reviewerId: reviewerId
  } as any)

  if(existingReview){
    throw new Error('You have already reviewed this contract!')
  }

  const review = await Review.create({
    contractId: data.contractId,
    reviewerId: reviewerId,
    revieweeId: revieweeId,
    role,
    rating: data.rating,
    comment: data.comment
  } as any)

  return review
}

const getAllReviews = async (query: ReviewQuery) => {
  const filter: any = {}

  if (query.contractId) {
    filter.contractId = new mongoose.Types.ObjectId(query.contractId)
  }

  if(query.role){
    filter.role = query.role
  }

  if(query.reviewerId){
    filter.reviewerId = new mongoose.Types.ObjectId(query.reviewerId)
  }

  if(query.revieweeId){
    filter.revieweeId = new mongoose.Types.ObjectId(query.revieweeId)
  }

  if (query.rating !== undefined) {
    filter.rating = Number(query.rating)
  }

  if (query.minRating || query.maxRating) {
    filter.rating = {}
    if (query.minRating) filter.rating.$gte = Number(query.minRating)
    if (query.maxRating) filter.rating.$lte = Number(query.maxRating)
  }

  return await paginate(Review, filter, query, REVIEW_SAFE_FIELDS, [{
    path: 'reviewerId',
    select: '_id fullName email avatar'
  }, {
    path: 'revieweeId',
    select: '_id fullName email avatar'
  }])
}

const getReviewById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid review ID format')
  }

  const review = await Review.findById(id)
    .select(REVIEW_SAFE_FIELDS)
    .populate('reviewerId', '_id fullName email avatar')
    .populate('revieweeId', '_id fullName email avatar')
    .lean()

  if (!review) {
    throw new Error('Review not found')
  }

  return review
}

const getReviewsByContractId = async (contractId: string) => {
  if (!mongoose.Types.ObjectId.isValid(contractId)) {
    throw new Error('Invalid contract ID format')
  }

  const reviews = await Review.find({ contractId: new mongoose.Types.ObjectId(contractId) } as any)
    .select(REVIEW_SAFE_FIELDS)
    .populate('reviewerId', '_id fullName email avatar')
    .populate('revieweeId', '_id fullName email avatar')
    .lean()

  return reviews || []
}

const getReviewsByUserId = async (userId: string, isReceivedReview: boolean) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format')
  }

  const filter = isReceivedReview ? { revieweeId: userId } : { reviewerId: userId }

  const reviews = await Review.find(filter as any)
    .select(REVIEW_SAFE_FIELDS)
    .populate('reviewerId', '_id fullName email avatar')
    .populate('revieweeId', '_id fullName email avatar')
    .sort({ createdAt: -1 })
    .lean()

  return reviews || []
}

const getMyReviews = async (userId: string, isReceivedReview?: boolean) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format')
  }

  const filter = isReceivedReview !== undefined ?
   (isReceivedReview ? { revieweeId: userId } : { reviewerId: userId }) : {}

  const reviews = await Review.find(filter as any)
    .select(REVIEW_SAFE_FIELDS)
    .populate('reviewerId', '_id fullName email avatar')
    .populate('revieweeId', '_id fullName email avatar')
    .sort({ createdAt: -1 })
    .lean()

  return reviews || []
}

const getAverageRating = async (userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format')
  }

  const result = await Review.aggregate([
    { $match: { revieweeId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$revieweeId',
        avg: { $avg: '$rating' },
        count: { $sum: 1 }
      }
    }
  ])

  if (!result || result.length === 0) {
    return { averageRating: 0, totalReviews: 0 }
  }

  return {
    averageRating: Math.round(result[0].avg * 10) / 10,
    totalReviews: result[0].count
  }
}

const updateReview = async (id: string, reviewerId: string, data: IUpdateReview) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid review ID format')
  }

  if (!mongoose.Types.ObjectId.isValid(reviewerId)) {
    throw new Error('Invalid reviewer ID format')
  }

  if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
    throw new Error('Rating must be between 1 and 5')
  }

  const findReview = await Review.findById(id)

  if (!findReview) {
    throw new Error('Review not found')
  }

  if (findReview.reviewerId?.toString() !== reviewerId) {
    throw new Error('You are not authorized to update this review')
  }

  const review = await Review.findByIdAndUpdate(id, data, { new: true })
    .select(REVIEW_SAFE_FIELDS)
    .populate('reviewerId', '_id fullName email avatar')
    .populate('revieweeId', '_id fullName email avatar')
    .lean()

  if (!review) {
    throw new Error('Review not found')
  }

  return review
}

const deleteReview = async (id: string, reviewerId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid review ID format')
  }

  if (!mongoose.Types.ObjectId.isValid(reviewerId)) {
    throw new Error('Invalid reviewer ID format')
  }

  const findReview = await Review.findById(id)

  if (!findReview) {
    throw new Error('Review not found')
  }

  if (findReview.reviewerId?.toString() !== reviewerId) {
    throw new Error('You are not authorized to delete this review')
  }

  await Review.findByIdAndDelete(id)

  return { message: 'Review deleted successfully' }
}

export const reviewService = {
  createReview,
  getAllReviews,
  getReviewById,
  getReviewsByContractId,
  getReviewsByUserId,
  getAverageRating,
  updateReview,
  deleteReview,
  getMyReviews
}

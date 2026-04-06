import { ICreateReview, IUpdateReview, ReviewQuery } from '@/constants/review.constants'
import { Contract } from '@/models/contract.model'
import { Review } from '@/models/review.model'
import { paginate } from '@/utils/paginate'
import mongoose from 'mongoose'

const REVIEW_SAFE_FIELDS = '_id contract_id contractor_id freelancer_id rating comment createdAt updatedAt'

const createReview = async (data: ICreateReview) => {
  if (!mongoose.Types.ObjectId.isValid(data.contract_id)) {
    throw new Error('Invalid contract ID format')
  }

  if (!mongoose.Types.ObjectId.isValid(data.contractor_id)) {
    throw new Error('Invalid contractor ID format')
  }

  if (!mongoose.Types.ObjectId.isValid(data.freelancer_id)) {
    throw new Error('Invalid freelancer ID format')
  }

  if (data.rating < 1 || data.rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }

  // check authorization
  const contract = await Contract.findById(data.contract_id)

  if(!contract){
    throw new Error('Contract not found')
  }

  if(contract.contractor_id.toString() !== data.contractor_id){
    throw new Error('You are not authorized to review freelancer in this contract!')
  }

  if(contract.freelancer_id.toString() !== data.freelancer_id){
    throw new Error('Freelancer is not in this contract!')
  }

  // Check if a review already exists for this contract by this contractor
  const existingReview = await Review.findOne({
    contract_id: data.contract_id,
    contractor_id: data.contractor_id
  } as any)

  if (existingReview) {
    throw new Error('You have already reviewed this contract!')
  }

  const review = await Review.create(data as any)

  return review
}

const getAllReviews = async (query: ReviewQuery) => {
  const filter: any = {}

  if (query.contract_id) {
    filter.contract_id = query.contract_id
  }

  if (query.contractor_id) {
    filter.contractor_id = query.contractor_id
  }

  if (query.freelancer_id) {
    filter.freelancer_id = query.freelancer_id
  }

  if (query.rating !== undefined) {
    filter.rating = Number(query.rating)
  }

  if (query.minRating !== undefined) {
    filter.rating = { ...filter.rating, $gte: Number(query.minRating) }
  }

  if (query.maxRating !== undefined) {
    filter.rating = { ...filter.rating, $lte: Number(query.maxRating) }
  }

  return await paginate(Review, filter, query, REVIEW_SAFE_FIELDS)
}

const getReviewById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid review ID format')
  }

  const review = await Review.findById(id)
    .select(REVIEW_SAFE_FIELDS)
    .populate('contractor_id', '_id name avatar')
    .populate('freelancer_id', '_id name avatar')
    .populate('contract_id', '_id project_id status')
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

  const reviews = await Review.find({ contract_id: new mongoose.Types.ObjectId(contractId) } as any)
    .select(REVIEW_SAFE_FIELDS)
    .populate('contractor_id', '_id name avatar')
    .populate('freelancer_id', '_id name avatar')
    .lean()

  return reviews || []
}

const getReviewsByFreelancerId = async (freelancerId: string) => {
  if (!mongoose.Types.ObjectId.isValid(freelancerId)) {
    throw new Error('Invalid freelancer ID format')
  }

  const reviews = await Review.find({ freelancer_id: new mongoose.Types.ObjectId(freelancerId) } as any)
    .select(REVIEW_SAFE_FIELDS)
    .populate('contractor_id', '_id name avatar')
    .lean()

  return reviews || []
}

const getReviewsByContractorId = async (contractorId: string) => {
  if (!mongoose.Types.ObjectId.isValid(contractorId)) {
    throw new Error('Invalid contractor ID format')
  }

  const reviews = await Review.find({ contractor_id: new mongoose.Types.ObjectId(contractorId) } as any)
    .select(REVIEW_SAFE_FIELDS)
    .populate('freelancer_id', '_id name avatar')
    .lean()

  return reviews || []
}

const getAverageRating = async (freelancerId: string) => {
  if (!mongoose.Types.ObjectId.isValid(freelancerId)) {
    throw new Error('Invalid freelancer ID format')
  }

  const result = await Review.aggregate([
    { $match: { freelancer_id: new mongoose.Types.ObjectId(freelancerId) } },
    {
      $group: {
        _id: '$freelancer_id',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ])

  if (!result || result.length === 0) {
    return { averageRating: 0, totalReviews: 0 }
  }

  return {
    averageRating: Math.round(result[0].averageRating * 10) / 10,
    totalReviews: result[0].totalReviews
  }
}

const updateReview = async (id: string, contractorId: string, data: IUpdateReview) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid review ID format')
  }

  if (!mongoose.Types.ObjectId.isValid(contractorId)) {
    throw new Error('Invalid contractor ID format')
  }

  if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
    throw new Error('Rating must be between 1 and 5')
  }

  const findReview = await Review.findById(id)

  if (!findReview) {
    throw new Error('Review not found')
  }

  if (findReview.contractor_id?.toString() !== contractorId) {
    throw new Error('You are not authorized to update this review')
  }

  const review = await Review.findByIdAndUpdate(id, data, { new: true })
    .select(REVIEW_SAFE_FIELDS)
    .lean()

  if (!review) {
    throw new Error('Review not found')
  }

  return review
}

const deleteReview = async (id: string, contractorId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid review ID format')
  }

  if (!mongoose.Types.ObjectId.isValid(contractorId)) {
    throw new Error('Invalid contractor ID format')
  }

  const findReview = await Review.findById(id)

  if (!findReview) {
    throw new Error('Review not found')
  }

  if (findReview.contractor_id?.toString() !== contractorId) {
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
  getReviewsByFreelancerId,
  getReviewsByContractorId,
  getAverageRating,
  updateReview,
  deleteReview
}

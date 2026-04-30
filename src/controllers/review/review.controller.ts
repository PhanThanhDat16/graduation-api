import { Request, Response } from 'express'
import expressAsyncHandler from 'express-async-handler'

import { HttpStatus } from '@/constants/http.constants'
import { reviewService } from '@/services/review/review.service'
import { RequestWithUser } from '@/middlewares/auth.middlewares'

const createReview = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { contractId, rating, comment } = req.body
  const reviewerId = req.user?._id as string

  if (!contractId || rating === undefined || !comment) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'contractId, rating and comment are required'
    })
    return
  }

  const review = await reviewService.createReview(reviewerId, {
    contractId,
    rating: Number(rating),
    comment
  } as any)

  if (!review) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Create review failed'
    })
    return
  }

  res.status(HttpStatus.OK).json({
    message: 'Create review successfully',
    data: review
  })
})

const getAllReviews = expressAsyncHandler(async (req: Request, res: Response) => {
  const query = req.query

  const filter: any = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    contractId: query.contractId,
    reviewerId: query.reviewerId,
    revieweeId: query.revieweeId,
    role: query.role,
    rating: query.rating !== undefined ? Number(query.rating) : undefined,
    minRating: query.minRating !== undefined ? Number(query.minRating) : undefined,
    maxRating: query.maxRating !== undefined ? Number(query.maxRating) : undefined
  }

  const result = await reviewService.getAllReviews(filter)

  res.status(HttpStatus.OK).json({
    message: 'Get all reviews successfully',
    ...result
  })
})

const getReviewById = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const review = await reviewService.getReviewById(id as string)

  res.status(HttpStatus.OK).json({
    message: 'Get review successfully',
    data: review
  })
})

const getReviewsByContractId = expressAsyncHandler(async (req: Request, res: Response) => {
  const { contractId } = req.params

  if (!contractId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Contract ID is required'
    })
    return
  }

  const reviews = await reviewService.getReviewsByContractId(contractId as string)

  res.status(HttpStatus.OK).json({
    message: 'Get reviews by contract successfully',
    data: reviews
  })
})

// const getReviewsByFreelancerId = expressAsyncHandler(async (req: Request, res: Response) => {
//   const { freelancerId } = req.params

//   if (!freelancerId) {
//     res.status(HttpStatus.BAD_REQUEST).json({
//       message: 'Freelancer ID is required'
//     })
//     return
//   }

//   const reviews = await reviewService.getReviewsByFreelancerId(freelancerId as string)

//   res.status(HttpStatus.OK).json({
//     message: 'Get reviews by freelancer successfully',
//     data: reviews
//   })
// })

// const getReviewsByContractorId = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
//   const contractorId = req.user?._id

//   if (!contractorId) {
//     res.status(HttpStatus.BAD_REQUEST).json({
//       message: 'Contractor ID is required'
//     })
//     return
//   }

//   const reviews = await reviewService.getReviewsByContractorId(contractorId as string)

//   res.status(HttpStatus.OK).json({
//     message: 'Get reviews by contractor successfully',
//     data: reviews
//   })
// })

const getReviewsByUserId = expressAsyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params
  const isReceivedReview = req.query.isReceivedReview === 'true'

  if (!userId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'User ID is required'
    })
    return
  }

  const reviews = await reviewService.getReviewsByUserId(userId as string, isReceivedReview)

  res.status(HttpStatus.OK).json({
    message: 'Get reviews by user successfully',
    data: reviews
  })
})

const getMyReviews = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id
  const isReceivedReview = req.query.isReceivedReview as unknown as boolean
  if (!userId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'User ID is required'
    })
    return
  }

  const reviews = await reviewService.getMyReviews(userId as string, isReceivedReview)

  res.status(HttpStatus.OK).json({
    message: 'Get my reviews successfully',
    data: reviews
  })
})

const getAverageRating = expressAsyncHandler(async (req: Request, res: Response) => {
  const { freelancerId } = req.params

  if (!freelancerId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Freelancer ID is required'
    })
    return
  }

  const result = await reviewService.getAverageRating(freelancerId as string)

  res.status(HttpStatus.OK).json({
    message: 'Get average rating successfully',
    data: result
  })
})

const updateReview = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { id } = req.params

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Review ID is required'
    })
    return
  }

  const { rating, comment } = req.body
  const contractorId = req.user?.id

  if (!contractorId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Contractor ID is required'
    })
    return
  }

  const review = await reviewService.updateReview(id as string, contractorId as string, {
    rating: rating !== undefined ? Number(rating) : undefined,
    comment
  })

  if (!review) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Update review failed'
    })
    return
  }

  res.status(HttpStatus.OK).json({
    message: 'Update review successfully',
    data: review
  })
})

const deleteReview = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { id } = req.params

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Review ID is required'
    })
    return
  }

  const contractorId = req.user?.id

  if (!contractorId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Contractor ID is required'
    })
    return
  }

  const result = await reviewService.deleteReview(id as string, contractorId as string)

  if (!result) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Delete review failed'
    })
    return
  }

  res.status(HttpStatus.OK).json({
    message: result.message
  })
})

export const reviewController = {
  createReview,
  getAllReviews,
  getReviewById,
  getReviewsByContractId,
  getReviewsByUserId,
  getMyReviews,
  getAverageRating,
  updateReview,
  deleteReview
}

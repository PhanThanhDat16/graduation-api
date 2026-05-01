import { reviewController } from '@/controllers/review/review.controller'
import { requireAuth } from '@/middlewares/auth.middlewares'
import express from 'express'

const router = express.Router()

// Authenticated routes
router.post('/', requireAuth, reviewController.createReview)
router.get('/me', requireAuth, reviewController.getMyReviews)
router.put('/:id', requireAuth, reviewController.updateReview)
router.delete('/:id', requireAuth, reviewController.deleteReview)

// Public routes
router.get('/', reviewController.getAllReviews)
router.get('/user/:userId', reviewController.getReviewsByUserId)
router.get('/user/:userId/average-rating', reviewController.getAverageRating)
router.get('/contract/:contractId', reviewController.getReviewsByContractId)
router.get('/:id', reviewController.getReviewById)

export const routerReview = router
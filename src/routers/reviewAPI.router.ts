import { reviewController } from '@/controllers/review/review.controller'
import { requireAuth } from '@/middlewares/auth.middlewares'
import express from 'express'

const router = express.Router()

// Public routes
router.get('/', reviewController.getAllReviews)
//router.get('/:id', reviewController.getReviewById)
router.get('/user/:userId', reviewController.getReviewsByUserId)
router.get('/contract/:contractId', reviewController.getReviewsByContractId)
router.get('/freelancer/:freelancerId/average-rating', reviewController.getAverageRating)

// Authenticated routes
router.post('/', requireAuth, reviewController.createReview)
router.get('/me', requireAuth, reviewController.getMyReviews)
router.put('/:id', requireAuth, reviewController.updateReview)
router.delete('/:id', requireAuth, reviewController.deleteReview)

export const routerReview = router

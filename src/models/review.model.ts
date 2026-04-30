import mongoose, { Document } from 'mongoose'

const reviewSchema = new mongoose.Schema<IReview>(
  {
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    revieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['freelancer', 'contractor'],
      required: true
    },
    rating: {
      type: Number,
      required: true
    },
    comment: {
      type: String,
      required: true
    }
  },
  {
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: true }
  }
)

reviewSchema.index({ contractId: 1, reviewerId: 1, revieweeId: 1, role: 1 }, { unique: true })

export const Review = mongoose.model<IReview>('Review', reviewSchema)

export interface IReview extends Document {
  contractId: mongoose.Schema.Types.ObjectId
  reviewerId: mongoose.Schema.Types.ObjectId
  revieweeId: mongoose.Schema.Types.ObjectId
  role: 'freelancer' | 'contractor'
  rating: number
  comment?: string
}

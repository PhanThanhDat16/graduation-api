import mongoose, { Document, Schema } from "mongoose";

const reviewSchema = new mongoose.Schema<IReview>(
    {
        contract_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Contract',
            required: true
        },
        contractor_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        freelancer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
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

reviewSchema.index({contract_id: 1, contractor_id: 1, rating: 1})

export const Review = mongoose.model<IReview>("Review",reviewSchema)

export interface IReview extends Document {
    contract_id: mongoose.Schema.Types.ObjectId
    contractor_id: mongoose.Schema.Types.ObjectId
    freelancer_id: mongoose.Schema.Types.ObjectId
    rating: number
    comment?: string
}
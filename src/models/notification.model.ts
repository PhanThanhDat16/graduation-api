import mongoose from "mongoose";

export interface INotification {
    user_id: mongoose.Schema.Types.ObjectId;
    type: string;
    title: string
    content: string;
    is_read: boolean;
}

const notificationSchema = new mongoose.Schema<INotification>({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    is_read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});

notificationSchema.index({ user_id: 1, is_read: 1 })

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
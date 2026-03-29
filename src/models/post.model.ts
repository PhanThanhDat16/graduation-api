import mongoose, { Document } from "mongoose";

interface IPost extends Document {
  title: string;
  content: string;
  authorId?: string;
  likes?: number;
  listLike?: string[];
}

const postSchema = new mongoose.Schema<IPost>({
  title: { type: String, required: true },
  content: { type: String, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: { type: Number, default: 0 },
  listLike: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
}, { timestamps: true });

postSchema.index({ authorId: 1 })
postSchema.index({ likes: 1 })

export const Post = mongoose.model<IPost>('Post', postSchema);
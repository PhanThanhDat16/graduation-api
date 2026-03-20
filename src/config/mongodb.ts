import mongoose from 'mongoose'

export default function connectMongoDB() {
  mongoose
    .connect(process.env.MONGODB_URL as string)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err))
}

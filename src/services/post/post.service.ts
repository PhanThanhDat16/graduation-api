import { IPostCreate, IPostUpdate, PostQuery } from '@/constants/post.constant'
import { Post } from '@/models/post.model'
import { paginate } from '@/utils/paginate'
import mongoose from 'mongoose'

const POST_SAFE_FIELDS = '_id title content authorId likes listLike createdAt updatedAt'

const createPost = async (data: IPostCreate) => {
  if (!mongoose.Types.ObjectId.isValid(data.authorId)) {
    throw new Error('Invalid author ID format')
  }

  const post = await Post.create(data as any)

  return post;
}

const getAllPost = async (query: PostQuery) => {
  const filter: any = {}

  if (query.authorId) {
    filter.authorId = query.authorId
  }

  if (query.likes !== undefined) {
    filter.likes = { $gte: Number(query.likes) }
  }

  if(query.keyword){
    filter.$or = [
      { title: { $regex: query.keyword, $options: 'i' } },
      { content: { $regex: query.keyword, $options: 'i' } }
    ]
  }

  return await paginate(Post, filter,query, POST_SAFE_FIELDS)
}

const getPostById = async (id: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid post ID format')
  }

  const post = await Post.findById(id)
    .select(POST_SAFE_FIELDS)
    .lean()

  if (!post) {
    throw new Error('Post not found')
  }

  return post
}

const getPostByAuthorId = async (authorId: string) => {
  if (!mongoose.Types.ObjectId.isValid(authorId)) {
    throw new Error('Invalid author ID format')
  }

  const posts = await Post.find({ authorId })
    .select(POST_SAFE_FIELDS)

  return posts || []
}

const updatePost = async (id: string, authorId: string, data: IPostUpdate) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid post ID format')
  }

  if (!mongoose.Types.ObjectId.isValid(authorId)) {
    throw new Error('Invalid author ID format')
  }

  const findPost = await Post.findById(id)

  if (!findPost) {
    throw new Error('Post not found')
  }

  if (findPost.authorId?.toString() !== authorId) {
    throw new Error('You are not authorized to update this post')
  }

  const post = await Post.findByIdAndUpdate(id, data, { new: true })

  if (!post) {
    throw new Error('Post not found')
  }

  return post
}

const deletePost = async (id: string, authorId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid post ID format')
  }

  if (!mongoose.Types.ObjectId.isValid(authorId)) {
    throw new Error('Invalid author ID format')
  }

  const findPost = await Post.findById(id)

  if (!findPost) {
    throw new Error('Post not found')
  }

  if (findPost.authorId?.toString() !== authorId) {
    throw new Error('You are not authorized to delete this post')
  }

  const post = await Post.findByIdAndDelete(id)

  if (!post) {
    throw new Error('Post not found')
  }

  return { message: 'Post deleted successfully' }
}

const likePost = async (id: string, userId: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid post ID format')
  }

  const post = await Post.findById(id)

  if (!post) {
    throw new Error('Post not found')
  }

  const isLiked = post.listLike?.some(
    (id) => id.toString() === userId
  )

  if (isLiked) {
    return await Post.findByIdAndUpdate(
      id,
      {
        $pull: { listLike: userId },
        $inc: { likes: -1 }
      },
      { new: true }
    ).lean()
  } else {
    return await Post.findByIdAndUpdate(
      id,
      {
        $addToSet: { listLike: userId },
        $inc: { likes: 1 }
      },
      { new: true }
    ).lean()
  }
}

export const postService = {
  createPost,
  getAllPost,
  getPostById,
  getPostByAuthorId,
  updatePost,
  deletePost,
  likePost
}

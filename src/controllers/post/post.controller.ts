import { Request, Response } from 'express'
import expressAsyncHandler from 'express-async-handler'

import { HttpStatus } from '@/constants/http.constants'
import { postService } from '@/services/post/post.service'
import { RequestWithUser } from '@/middlewares/auth.middlewares'

const createPost = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { title, content } = req.body
  const authorId = req.user?.id

  if (!title || !content || !authorId) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Title and content and authorId are required'
    })
    return
  }

  const post = await postService.createPost({ title, content, authorId })

  if(!post){
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Create post failed'
    })
    return
  }

  res.status(HttpStatus.OK).json({
    message: 'Create post successfully',
    data: post
  })
})

const getAllPost = expressAsyncHandler(async (req: Request, res: Response) => {
  const query = req.query

  const filter: any = {
    page: query.page ? Number(query.page) : 1,
    limit: query.limit ? Number(query.limit) : 10,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    authorId: query.authorId,
    likes: query.likes !== undefined ? Number(query.likes) : undefined
  }

  const result = await postService.getAllPost(filter)

  res.status(HttpStatus.OK).json({
    message: 'Get all posts successfully',
    ...result
  })
})

const getPostById = expressAsyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params
  const post = await postService.getPostById(id as string)

  res.status(HttpStatus.OK).json({
    message: 'Get post successfully',
    data: post
  })
})

const getPostByAuthorId = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const authorId = req.user?.id

  if(!authorId){
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Author ID is required'
    })
    return
  }

  const post = await postService.getPostByAuthorId(authorId as string)

  if(!post){
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Get post by author failed'
    })
    return
  }

  res.status(HttpStatus.OK).json({
    message: 'Get post by author successfully',
    data: post
  })
})

const updatePost = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { id } = req.params

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Post ID is required'
    })
    return
  }

  const { title, content } = req.body
  const authorId = req.user?.id

  if(!authorId){
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Author ID is required'
    })
    return
  }

  const post = await postService.updatePost(id as string, authorId as string, { title, content })

  if(!post){
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Update post failed'
    })
    return
  }

  res.status(HttpStatus.OK).json({
    message: 'Update post successfully',
    data: post
  })
})

const deletePost = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { id } = req.params

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Post ID is required'
    })
    return
  }

  const authorId = req.user?.id

  if(!authorId){
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Author ID is required'
    })
    return
  }


  const result = await postService.deletePost(id as string, authorId as string)

  if(!result){
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Delete post failed'
    })
    return
  }

  res.status(HttpStatus.OK).json({
    message: result.message
  })
})

const likePost = expressAsyncHandler(async (req: RequestWithUser, res: Response) => {
  const { id } = req.params

  if (!id) {
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Post ID is required'
    })
    return
  }

  const authorId = req.user?.id
  
  if(!authorId){
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Author ID is required'
    })
    return
  }

  const result = await postService.likePost(id as string, authorId as string)
  
  if(!result){
    res.status(HttpStatus.BAD_REQUEST).json({
      message: 'Like/Dislike post failed'
    })
    return
  }

  res.status(HttpStatus.OK).json({
    message: "Like/Dislike post successfully",
    data: result
  })
})

export const postController = {
  createPost,
  getAllPost,
  getPostById,
  getPostByAuthorId,
  updatePost,
  deletePost,
  likePost
}

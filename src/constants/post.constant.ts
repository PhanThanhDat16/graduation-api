import { PaginationQuery } from "./pagination.constant";

export interface PostFilter {
  authorId?: string;
  likes?: number;
  keyword?: string;
}

export interface IPostCreate {
  title: string;
  content: string;
  authorId: string;
  likes?: number;
  listLike?: string[];
}

export interface IPostUpdate {
  title?: string;
  content?: string;
}

export interface PostQuery extends PaginationQuery, PostFilter {}
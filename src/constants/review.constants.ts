import { PaginationQuery } from "./pagination.constant";

export interface ReviewFilter {
  contractId?: string;
  reviewerId?: string;
  revieweeId?: string;
  role?: 'freelancer' | 'contractor';
  rating?: number;
  minRating?: number;
  maxRating?: number;
}

export interface ICreateReview {
  contractId: string;
  rating: number;
  comment?: string;
}

export interface IUpdateReview {
  rating?: number;
  comment?: string;
}

export interface ReviewQuery extends PaginationQuery, ReviewFilter {}

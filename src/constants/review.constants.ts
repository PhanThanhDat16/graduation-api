import { PaginationQuery } from "./pagination.constant";

export interface ReviewFilter {
  contract_id?: string;
  contractor_id?: string;
  freelancer_id?: string;
  rating?: number;
  minRating?: number;
  maxRating?: number;
}

export interface ICreateReview {
  contract_id: string;
  contractor_id: string;
  freelancer_id: string;
  rating: number;
  comment?: string;
}

export interface IUpdateReview {
  rating?: number;
  comment?: string;
}

export interface ReviewQuery extends PaginationQuery, ReviewFilter {}

import type { Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status';

export const sendSuccess = (
  res: Response,
  data: unknown = null,
  description = 'Success',
  statusCode: number = HTTP_STATUS.OK,
) => {
  return res.status(statusCode).json({
    status: String(statusCode),
    description,
    data,
  });
};

export const sendCreated = (
  res: Response,
  data: unknown = null,
  description = 'Created successfully',
) => {
  return sendSuccess(res, data, description, HTTP_STATUS.CREATED);
};

interface PaginatedOptions {
  content: unknown[];
  page?: number;
  size?: number;
  totalElements?: number;
  sortProperty?: string;
  sortDirection?: string;
  description?: string;
}

export const sendPaginated = (
  res: Response,
  {
    content,
    page = 0,
    size = 10,
    totalElements = 0,
    sortProperty = 'created_at',
    sortDirection = 'DESC',
    description = 'Success',
  }: PaginatedOptions,
) => {
  const totalPages = Math.ceil(totalElements / size);

  return res.status(HTTP_STATUS.OK).json({
    status: String(HTTP_STATUS.OK),
    description,
    data: {
      content,
      totalElements,
      totalPages,
      size,
      number: page,
      numberOfElements: content.length,
      first: page === 0,
      last: page >= totalPages - 1,
      empty: content.length === 0,
      pageable: {
        pageNumber: page,
        pageSize: size,
      },
      sort: [
        {
          property: sortProperty,
          direction: sortDirection,
          ascending: sortDirection === 'ASC',
          descending: sortDirection === 'DESC',
          ignoreCase: false,
          nullHandling: 'NATIVE',
        },
      ],
    },
  });
};

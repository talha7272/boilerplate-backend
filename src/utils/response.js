import { HTTP_STATUS } from '../constants/httpStatus.js';

export const sendSuccess = (res, data = null, description = 'Success', statusCode = HTTP_STATUS.OK) => {
  return res.status(statusCode).json({
    status: String(statusCode),
    description,
    data,
  });
};

export const sendCreated = (res, data = null, description = 'Created successfully') => {
  return sendSuccess(res, data, description, HTTP_STATUS.CREATED);
};

/**
 * @param {object} options
 * @param {Array}   options.content        - array of records for current page
 * @param {number}  options.page           - current page (0-based)
 * @param {number}  options.size           - page size
 * @param {number}  options.totalElements  - total record count
 * @param {string}  options.sortProperty   - field being sorted on
 * @param {string}  options.sortDirection  - 'ASC' | 'DESC'
 */
export const sendPaginated = (res, {
  content,
  page = 0,
  size = 10,
  totalElements = 0,
  sortProperty = 'created_at',
  sortDirection = 'DESC',
  description = 'Success',
}) => {
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

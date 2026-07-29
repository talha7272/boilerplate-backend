import {
  eq,
  ne,
  ilike,
  notLike,
  gt,
  gte,
  lt,
  lte,
  inArray,
  notInArray,
  isNull,
  isNotNull,
  SQL,
  Column,
} from 'drizzle-orm';

export interface FilterCondition {
  fieldName: string;
  fieldValue: unknown;
  searchOperator: string;
}

const isEnumColumn = (col: Column) => col?.columnType === 'PgEnumColumn';

const applyOperator = (
  col: Column,
  operator: string,
  value: unknown,
): SQL | undefined => {
  const enumCol = isEnumColumn(col);

  switch (operator) {
    case 'LIKE':
      return enumCol ? eq(col, value) : ilike(col, `%${value}%`);
    case 'NOT_LIKE':
      return enumCol ? ne(col, value) : notLike(col, `%${value}%`);
    case 'EQUAL':
      return eq(col, value);
    case 'NOT_EQUAL':
      return ne(col, value);
    case 'GREATER_THAN':
      return gt(col, value);
    case 'GREATER_THAN_OR_EQUAL':
      return gte(col, value);
    case 'LESS_THAN':
      return lt(col, value);
    case 'LESS_THAN_OR_EQUAL':
      return lte(col, value);
    case 'IN':
      return inArray(col, Array.isArray(value) ? value : [value]);
    case 'NOT_IN':
      return notInArray(col, Array.isArray(value) ? value : [value]);
    case 'IS_NULL':
      return isNull(col);
    case 'IS_NOT_NULL':
      return isNotNull(col);
    default:
      return undefined;
  }
};

export const buildFilters = (
  filters: FilterCondition[],
  table: Record<string, Column>,
): SQL[] => {
  if (!Array.isArray(filters) || filters.length === 0) return [];

  return filters.reduce<SQL[]>((conditions, { fieldName, fieldValue, searchOperator }) => {
    const col = table[fieldName];
    if (!col) return conditions;

    const condition = applyOperator(col, searchOperator, fieldValue);
    if (condition) conditions.push(condition);
    return conditions;
  }, []);
};

import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  numeric,
  integer,
  json,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './user.schema';

export const projectFeeTypeEnum = pgEnum('project_fee_type', ['PERCENTAGE', 'FIXED']);
export const projectStatusEnum = pgEnum('project_status', [
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED',
  'CLOSED',
  'UNPUBLISHED',
]);

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: json('description'),
  language: text('language').default('EN').notNull(),
  categoryName: text('category_name'),
  currency: text('currency').default('€').notNull(),
  country: text('country'),
  city: text('city'),
  locationName: text('location_name'),
  zipCode: text('zip_code'),
  initiativeName: text('initiative_name'),
  initiativeDescription: text('initiative_description'),
  initiativeCoverImage: text('initiative_cover_image'),
  coverImage: text('cover_image'),
  initiatorId: integer('initiator_id'),
  initiatorName: text('initiator_name'),
  enterpriseId: integer('enterprise_id').default(0),
  enterpriseName: text('enterprise_name'),
  remainingBalance: numeric('remaining_balance', { precision: 12, scale: 2 }).default('0').notNull(),
  targetAmount: numeric('target_amount', { precision: 12, scale: 2 }).default('0').notNull(),
  totalDonation: numeric('total_donation', { precision: 12, scale: 2 }).default('0').notNull(),
  feeValue: numeric('fee_value', { precision: 5, scale: 2 }).default('0').notNull(),
  projectFeeType: projectFeeTypeEnum('project_fee_type').default('PERCENTAGE').notNull(),
  projectStatus: projectStatusEnum('project_status').default('DRAFT').notNull(),
  emergency: boolean('emergency').default(false).notNull(),
  anonymized: boolean('anonymized').default(false).notNull(),
  adminModifiedFee: boolean('admin_modified_fee').default(false).notNull(),
  emergencySetByAdmin: boolean('emergency_set_by_admin').default(false).notNull(),
  revisionExists: boolean('revision_exists').default(false).notNull(),
  listOfObjections: json('list_of_objections').default([]).notNull(),
  publishedAt: timestamp('published_at'),
  ownerId: uuid('owner_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

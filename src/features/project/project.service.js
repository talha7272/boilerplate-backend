import { eq, and, count, asc, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import { projects } from '../../db/schema/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import { HTTP_STATUS } from '../../constants/httpStatus.js';
import { buildFilters } from '../../utils/buildFilters.js';

const getOrder = (sortProperty, sortDirection) => {
  const col = projects[sortProperty] ?? projects.createdAt;
  return sortDirection === 'ASC' ? asc(col) : desc(col);
};

export const createProject = async (body, ownerId) => {
  const [project] = await db.insert(projects).values({ ...body, ownerId }).returning();
  return project;
};

export const getAllProjects = async (ownerId, { page = 0, size = 10, sortProperty = 'createdAt', sortDirection = 'DESC', filters = [] } = {}) => {
  const filterConditions = buildFilters(filters, projects);
  const where = and(eq(projects.ownerId, ownerId), ...filterConditions);

  const [content, [{ total }]] = await Promise.all([
    db.select().from(projects)
      .where(where)
      .orderBy(getOrder(sortProperty, sortDirection))
      .limit(size)
      .offset(page * size),
    db.select({ total: count() }).from(projects).where(where),
  ]);

  return { content, totalElements: Number(total), page, size, sortProperty, sortDirection };
};

export const getProjectById = async (id, ownerId) => {
  const [project] = await db.select().from(projects)
    .where(and(eq(projects.id, id), eq(projects.ownerId, ownerId))).limit(1);
  if (!project) throw new AppError('Project not found', HTTP_STATUS.NOT_FOUND);
  return project;
};

export const updateProject = async (id, ownerId, updates) => {
  const [project] = await db.update(projects)
    .set({ ...updates, updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)))
    .returning();
  if (!project) throw new AppError('Project not found or unauthorized', HTTP_STATUS.NOT_FOUND);
  return project;
};

export const deleteProject = async (id, ownerId) => {
  const [project] = await db.delete(projects)
    .where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)))
    .returning({ id: projects.id });
  if (!project) throw new AppError('Project not found or unauthorized', HTTP_STATUS.NOT_FOUND);
};

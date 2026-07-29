import { Inject, Injectable } from '@nestjs/common';
import { eq, and, count, asc, desc } from 'drizzle-orm';
import { DRIZZLE, DrizzleDb } from '../../db/drizzle.module';
import { projects } from '../../db/schema';
import { AppException } from '../../common/exceptions/app.exception';
import { HTTP_STATUS } from '../../constants/http-status';
import { buildFilters, FilterCondition } from '../../common/utils/build-filters';

interface GetAllProjectsOptions {
  page?: number;
  size?: number;
  sortProperty?: string;
  sortDirection?: string;
  filters?: FilterCondition[];
}

@Injectable()
export class ProjectService {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDb) {}

  private getOrder(sortProperty: string, sortDirection: string) {
    const col = (projects as Record<string, any>)[sortProperty] ?? projects.createdAt;
    return sortDirection === 'ASC' ? asc(col) : desc(col);
  }

  async createProject(body: Record<string, unknown>, ownerId: string) {
    const [project] = await this.db
      .insert(projects)
      .values({ ...(body as any), ownerId })
      .returning();
    return project;
  }

  async getAllProjects(
    ownerId: string,
    {
      page = 0,
      size = 10,
      sortProperty = 'createdAt',
      sortDirection = 'DESC',
      filters = [],
    }: GetAllProjectsOptions = {},
  ) {
    const filterConditions = buildFilters(filters, projects as any);
    const where = and(eq(projects.ownerId, ownerId), ...filterConditions);

    const [content, [{ total }]] = await Promise.all([
      this.db
        .select()
        .from(projects)
        .where(where)
        .orderBy(this.getOrder(sortProperty, sortDirection))
        .limit(size)
        .offset(page * size),
      this.db.select({ total: count() }).from(projects).where(where),
    ]);

    return { content, totalElements: Number(total), page, size, sortProperty, sortDirection };
  }

  async getProjectById(id: string, ownerId: string) {
    const [project] = await this.db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)))
      .limit(1);
    if (!project) throw new AppException('Project not found', HTTP_STATUS.NOT_FOUND);
    return project;
  }

  async updateProject(id: string, ownerId: string, updates: Record<string, unknown>) {
    const [project] = await this.db
      .update(projects)
      .set({ ...(updates as any), updatedAt: new Date() })
      .where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)))
      .returning();
    if (!project) throw new AppException('Project not found or unauthorized', HTTP_STATUS.NOT_FOUND);
    return project;
  }

  async deleteProject(id: string, ownerId: string) {
    const [project] = await this.db
      .delete(projects)
      .where(and(eq(projects.id, id), eq(projects.ownerId, ownerId)))
      .returning({ id: projects.id });
    if (!project) throw new AppException('Project not found or unauthorized', HTTP_STATUS.NOT_FOUND);
  }
}

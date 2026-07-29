import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ListProjectsQueryDto } from './dto/list-projects-query.dto';
import { sendSuccess, sendCreated, sendPaginated } from '../../common/utils/response';
import { HTTP_STATUS } from '../../constants/http-status';
import { AuthGuard } from '../../common/guards/auth.guard';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request';
import { FilterCondition } from '../../common/utils/build-filters';

const FIELD_MAP: Record<string, string> = {
  lastModifiedDate: 'updatedAt',
  createdDate: 'createdAt',
};

const resolveSort = (sort: string | undefined, sortProperty: string, sortDirection: string) => {
  if (sort) {
    const [field, dir = 'DESC'] = sort.split(',');
    return {
      sortProperty: FIELD_MAP[field] ?? field,
      sortDirection: dir.toUpperCase(),
    };
  }
  return {
    sortProperty: FIELD_MAP[sortProperty] ?? sortProperty,
    sortDirection: String(sortDirection).toUpperCase(),
  };
};

@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async createProject(
    @Body() dto: CreateProjectDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const data = await this.projectService.createProject(dto, req.user.id);
    sendCreated(res, data, 'Project created successfully');
  }

  @Post('list')
  async getAllProjects(
    @Query() query: ListProjectsQueryDto,
    @Body() filters: FilterCondition[] | unknown,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const { page = '0', size = '10', sort, sortProperty = 'createdAt', sortDirection = 'DESC' } = query;

    const { sortProperty: resolvedProperty, sortDirection: resolvedDirection } = resolveSort(
      sort,
      sortProperty,
      sortDirection,
    );
    const resolvedFilters = Array.isArray(filters) ? filters : [];

    const result = await this.projectService.getAllProjects(req.user.id, {
      page: parseInt(page, 10),
      size: parseInt(size, 10),
      sortProperty: resolvedProperty,
      sortDirection: resolvedDirection,
      filters: resolvedFilters as FilterCondition[],
    });
    sendPaginated(res, result);
  }

  @Get(':id')
  async getProjectById(@Param('id') id: string, @Req() req: AuthenticatedRequest, @Res() res: Response) {
    const data = await this.projectService.getProjectById(id, req.user.id);
    sendSuccess(res, data);
  }

  @Patch(':id')
  async updateProject(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const data = await this.projectService.updateProject(id, req.user.id, dto);
    sendSuccess(res, data, 'Project updated successfully');
  }

  @Delete(':id')
  async deleteProject(@Param('id') id: string, @Req() req: AuthenticatedRequest, @Res() res: Response) {
    await this.projectService.deleteProject(id, req.user.id);
    res.status(HTTP_STATUS.NO_CONTENT).send();
  }
}

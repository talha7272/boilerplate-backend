import * as projectService from "./project.service.js";
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
} from "../../utils/response.js";
import { HTTP_STATUS } from "../../constants/httpStatus.js";

export const createProject = async (req, res, next) => {
  try {
    const data = await projectService.createProject(req.body, req.user.id);
    sendCreated(res, data, "Project created successfully");
  } catch (err) {
    next(err);
  }
};

const FIELD_MAP = {
  lastModifiedDate: "updatedAt",
  createdDate: "createdAt",
};

const resolveSort = (sort, sortProperty, sortDirection) => {
  if (sort) {
    const [field, dir = "DESC"] = sort.split(",");
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

export const getAllProjects = async (req, res, next) => {
  try {
    const {
      page = 0,
      size = 10,
      sort,
      sortProperty = "createdAt",
      sortDirection = "DESC",
    } = req.query;

    const { sortProperty: resolvedProperty, sortDirection: resolvedDirection } =
      resolveSort(sort, sortProperty, sortDirection);
    const filters = Array.isArray(req.body) ? req.body : [];

    const result = await projectService.getAllProjects(req.user.id, {
      page: parseInt(page),
      size: parseInt(size),
      sortProperty: resolvedProperty,
      sortDirection: resolvedDirection,
      filters,
    });
    sendPaginated(res, result);
  } catch (err) {
    next(err);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    const data = await projectService.getProjectById(
      req.params.id,
      req.user.id,
    );
    sendSuccess(res, data);
  } catch (err) {
    next(err);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const data = await projectService.updateProject(
      req.params.id,
      req.user.id,
      req.body,
    );
    sendSuccess(res, data, "Project updated successfully");
  } catch (err) {
    next(err);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id, req.user.id);
    res.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (err) {
    next(err);
  }
};

import type { AuditAction, ProjectStatus, TaskPriority, TaskStatus, UserRole } from './enums';

/** API response shapes. Dates are ISO strings; date-only fields are `YYYY-MM-DD`. */

export interface PublicUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
  /** Seconds until the access token expires. */
  expiresIn: number;
  /** Only returned to mobile clients (`X-Client: mobile`). Web receives an httpOnly cookie. */
  refreshToken?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  taskCount: number;
  completedTaskCount: number;
}

export interface Task {
  id: string;
  projectId: string;
  project: { id: string; name: string };
  name: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  /** Tasks not yet completed (PENDING + IN_PROGRESS). */
  pendingTasks: number;
  inProgressTasks: number;
  projectsInProgress: number;
  projectsByStatus: Record<ProjectStatus, number>;
  tasksByPriority: Record<TaskPriority, number>;
  overdueTasks: number;
  dueSoonTasks: Task[];
}

export interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  newUsersLast7Days: number;
}

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string | null;
  changes: unknown;
  ip: string | null;
  createdAt: string;
  user: { id: string; fullName: string; email: string } | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface DataResponse<T> {
  data: T;
}

export const ERROR_CODES = [
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'TOKEN_EXPIRED',
  'SESSION_EXPIRED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

export interface ApiErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    details?: { field: string; message: string }[];
    requestId?: string;
  };
}

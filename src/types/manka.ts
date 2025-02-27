import type { Page } from './common';

export interface MankaArchiveTag {
  tagName: string;
  tagValue: string;
  tagDesc: string | undefined;
}

export interface MankaArchive {
  /**
   * archiveId
   */
  archiveId: string;

  /**
   * archiveName
   */
  archiveName: string;
  /**
   * archiveType
   */
  archiveType: string;

  archiveModTime: string | undefined;

  archiveCreatedTime: string | undefined;

  archiveHash: string | undefined;

  archiveTotalPage: number | undefined;

  archiveCoverUrl: string;

  tags?: MankaArchiveTag[];

  archiveItems?: ArchiveItem[];

  belongFavoriteId?: string;
  lastReadAt: number;
  lastReadPage: number;
}

export type PageMankaArchive = Page<MankaArchive>;

export type PageFavorite = Page<Favorite>;

export interface ArchiveItem {
  archiveItemName: string;
  archiveItemIndex: number;
  archiveItemId: string;
  archiveItemPath: string;
  archiveItemSize: number;
  archiveItemModTime: string;
}

export interface SearchGroup {
  searchGroupName: string;
  searchQuery: string;
  createdAt: string;
  updatedAt: string;
  searchGroupId: string;
}

export interface Favorite {
  createdAt: string;
  updatedAt: string;
  favoriteId: string;
  archive: MankaArchive;
}

export interface PageTask {
  pageNo: number;
  pageSize: number;
  pageTotal: number;
  pageData: Task[];
}

export interface PageTaskLog {
  pageNo: number;
  pageSize: number;
  pageTotal: number;
  pageData: TaskLog[];
}

export interface Task {
  id: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  taskId: string;
  taskName: string;
  taskType: string;
  taskProps: string;
  taskRunType: string;
  disabled: boolean;
}

export interface TaskLog {
  id: number;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  taskLogStatus: string;
  beginAt: string;
  endAt: string;
  taskType: string;
  taskID: number;
}

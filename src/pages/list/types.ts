//DisplayMode
export enum DisplayMode {
  ImageList = 'imageList',
  TableList = 'tableList',
}

export enum RankMode {
  ASC = 'asc',
  DESC = 'desc',
}

export enum RankField {
  ArchiveName = 'archive_name',
  ArchiveSize = 'archive_size',
  ArchiveModTime = 'archive_mod_time',
  ArchiveCreatedTime = 'created_at',
  ArchiveUpdatedTime = 'updated_at',
  ArchiveTotalPage = 'archive_total_page',
  ArchiveLastReadAt = 'last_read_at',
}

export enum RankFieldFront {
  ArchiveName = 'archiveName',
  ArchiveModTime = 'archiveModTime',
  ArchiveCreatedTime = 'created_at',
  ArchiveUpdatedTime = 'updated_at',
  ArchiveTotalPage = 'archive_total_page',
  ArchiveLastReadAt = 'last_read_at',
}

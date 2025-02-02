export enum DetailImgMode {
  InfinityMode = 'infinityMode',
  PageMode = 'pageMode',
  PhotoMode = 'photoMode',
}

export enum ImgRankMode {
  ASC = 'asc',
  DESC = 'desc',
}

export enum ImgRankField {
  ImgIndex = 'archiveItemIndex',
  ImgName = 'archiveItemName', //默认是 这个
  ImgSize = 'archiveItemSize',
}

export enum ImgSpec {
  Thumb = 'thumb',
  X720Compress = 'c720',
  X1280Compress = 'c1280',
  NoResizeCompress = 'no_resize',
  Origin = 'origin',
}

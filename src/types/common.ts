export interface Page<T> {
  pageNo: number;
  pageSize: number;
  pageData: T[];
  pageTotal: number;
}

export interface Response<T> {
  code: number;
  msg: string;
  data: T;
}

export interface SearchGroup {
  groupName: string;
  groupValue: string;
} 


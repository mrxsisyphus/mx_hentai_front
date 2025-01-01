import type { TableCellProps } from '@mui/material/TableCell/TableCell';
import type * as React from 'react';
import type { CSSProperties } from 'react';

export interface TableColumn {
  id: string;
  label: string;
  style: CSSProperties | undefined;
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
  format?: (value: any, row: any) => React.ReactNode;
  fcFormat?: (value: any, row: any) => React.FC;
  cellProps?: TableCellProps;
}

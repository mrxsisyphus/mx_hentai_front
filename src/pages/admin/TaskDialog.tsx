import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import type { ModalProps } from '@mui/material/Modal';
import type * as React from 'react';

export interface TaskDialogProps {
  open: boolean;
  onClose: ModalProps['onClose'];
  title?: string;
  context?: React.ReactNode;
}

export default function TaskDialog(props: TaskDialogProps) {
  const { open, onClose, title, context } = props;
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        scroll={'paper'} //对话框内容在paper总滚动
        maxWidth={'xs'}
        fullWidth
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>{context}</DialogContent>
      </Dialog>
    </>
  );
}

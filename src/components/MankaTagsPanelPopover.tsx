import { Popover, type PopoverProps } from '@mui/material';
import React from 'react';
import type { MankaArchive, MankaArchiveTag } from '../types';
import TagsPanel from './TagsPanel';

export interface MankaPopoverProps {
  // Anchor element
  anchorEl: HTMLElement | null;

  // Close handler
  onClose: () => void;

  // Manka data
  manka: MankaArchive;

  // Callback when a tag is clicked
  clickTagCallback?: (tag: MankaArchiveTag) => void;

  // Additional Popover props
  props?: PopoverProps;
}

export default function MankaTagsPanelPopover(options: MankaPopoverProps) {
  const {
    anchorEl,
    props,
    onClose,
    manka,
    clickTagCallback = () => {},
  } = options;

  return (
    <Popover
      id="cover_popover"
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      disableRestoreFocus
      anchorOrigin={{
        vertical: 'center',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      {...props}
    >
      {/* Use the reusable TagsPanel component */}
      <TagsPanel tags={manka.tags || []} onTagClick={clickTagCallback} />
    </Popover>
  );
}

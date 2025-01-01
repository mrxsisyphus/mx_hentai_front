import {
  Chip,
  Container,
  Stack,
  type StackProps,
  Typography,
} from '@mui/material';
import _ from 'lodash';
import type React from 'react';
import type { MankaArchiveTag } from '../types';

export interface TagsPanelProps {
  tags: MankaArchiveTag[];
  onTagClick?: (tag: MankaArchiveTag) => void;
  /**
   * Layout direction for tags. Can be 'horizontal', 'vertical', or responsive object.
   */
  layout?: 'horizontal' | 'vertical' | StackProps['direction'];
  /**
   * Spacing between tags. Can be a number or responsive object.
   */
  spacing?: StackProps['spacing'];
}

const TagsPanel: React.FC<TagsPanelProps> = ({
  tags = [],
  onTagClick = () => {},
  layout = { xs: 'column', sm: 'row' },
  spacing = { xs: 1, sm: 2, md: 4 },
}) => {
  if (tags.length === 0) {
    return <Typography>No Tags</Typography>;
  }

  // Group tags by their name
  const tagGroups = _.groupBy(tags, (tag) => tag.tagName);

  return (
    <Container maxWidth="md">
      {Object.keys(tagGroups).map((tagName) => (
        <div key={tagName}>
          <Typography variant="subtitle1" gutterBottom>
            {tagName}
          </Typography>
          <Stack
            direction={layout as StackProps['direction']}
            spacing={spacing}
          >
            {tagGroups[tagName].map((tag) => (
              <Chip
                size="small"
                key={`${tag.tagName}_${tag.tagValue}`}
                label={tag.tagValue}
                onClick={() => onTagClick(tag)}
              />
            ))}
          </Stack>
        </div>
      ))}
    </Container>
  );
};

export default TagsPanel;

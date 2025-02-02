import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Collapse, List, ListItemButton, ListItemText } from '@mui/material';
import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const NestedMenuItem: React.FC<{ item: any }> = ({ item }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isActive = item.children.some((child: any) =>
    location.pathname.startsWith(child.path),
  );

  return (
    <>
      <ListItemButton
        onClick={() => setOpen(!open)}
        sx={{
          borderRadius: 2,
          bgcolor: isActive ? 'action.selected' : 'inherit',
        }}
      >
        <ListItemText primary={item.text} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ pl: 2 }}>
          {item.children.map((child: any) => (
            <ListItemButton
              key={child.text}
              component={RouterLink}
              to={child.path}
              sx={{
                borderRadius: 2,
                bgcolor:
                  location.pathname === child.path
                    ? 'action.selected'
                    : 'inherit',
              }}
            >
              <ListItemText primary={child.text} />
            </ListItemButton>
          ))}
        </List>
      </Collapse>
    </>
  );
};

export default NestedMenuItem;

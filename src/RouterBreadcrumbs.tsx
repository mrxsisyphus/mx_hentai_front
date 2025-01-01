import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Collapse from '@mui/material/Collapse';
import Link, { type LinkProps } from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem, { type ListItemProps } from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import {
  MemoryRouter,
  Navigate,
  Route,
  Link as RouterLink,
  Routes,
  useLocation,
} from 'react-router-dom';
import AuthWrapComponent from './AuthWrapComponent';
import MankaDetailPage from './pages/detail/MankaDetailPage';
import MankaListPage from './pages/list/MankaListPage';
import Login from './pages/login/Login';

interface ListItemLinkProps extends ListItemProps {
  to: string;
  open?: boolean;
}

const breadcrumbNameMap: { [key: string]: string } = {
  '/': 'Home',
  '/admin': 'Admin',
};

function ListItemLink(props: ListItemLinkProps) {
  const { to, open, ...other } = props;
  const primary = breadcrumbNameMap[to];

  let icon = null;
  if (open != null) {
    icon = open ? <ExpandLess /> : <ExpandMore />;
  }

  return (
    <li>
      <ListItem button component={RouterLink as any} to={to} {...other}>
        <ListItemText primary={primary} />
        {icon}
      </ListItem>
    </li>
  );
}

interface LinkRouterProps extends LinkProps {
  to: string;
  replace?: boolean;
}

function LinkRouter(props: LinkRouterProps) {
  return <Link {...props} component={RouterLink as any} />;
}

function Page() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <Breadcrumbs aria-label="breadcrumb">
      <LinkRouter underline="hover" color="inherit" to="/">
        Home
      </LinkRouter>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;

        return last ? (
          <Typography color="text.primary" key={to}>
            {breadcrumbNameMap[to]}
          </Typography>
        ) : (
          <LinkRouter underline="hover" color="inherit" to={to} key={to}>
            {breadcrumbNameMap[to]}
          </LinkRouter>
        );
      })}
    </Breadcrumbs>
  );
}

export default function RouterBreadcrumbs() {
  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  return (
    <MemoryRouter initialEntries={['/']} initialIndex={0}>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: 360 }}>
        <Routes>
          <Route path="*" element={<Page />} />
        </Routes>
        <Box
          sx={{
            bgcolor: 'background.paper',
            mt: 1,
          }}
          component="nav"
          aria-label="mailbox folders"
        >
          <List>
            <ListItemLink to="/" />
            <ListItemLink to="/admin" />
          </List>
        </Box>
      </Box>
    </MemoryRouter>
  );
}

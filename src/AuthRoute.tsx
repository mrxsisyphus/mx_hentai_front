import { Navigate, Route, type RouteProps } from 'react-router-dom';
import Auth from './middleware/auth';

export default function AuthRoute({ element, ...rest }: RouteProps) {
  return (
    <Route
      {...rest}
      element={Auth.isLogin() ? element : <Navigate replace to="/login" />}
    />
  );
}

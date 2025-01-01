import React, { Fragment } from 'react';
import { Navigate, Route, RouteProps } from 'react-router-dom';
import Auth from './middleware/auth';

//@ts-ignore
const AuthWrapComponent = ({ children }) => {
  return (
    <Fragment>
      {Auth.isLogin() ? children : <Navigate replace to="/login" />}
    </Fragment>
  );
};
export default AuthWrapComponent;

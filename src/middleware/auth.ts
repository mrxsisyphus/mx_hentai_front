const Auth = {
  login() {
    localStorage.setItem('isLogin', 'true');
  },
  signout() {
    localStorage.setItem('isLogin', 'false');
  },
  isLogin() {
    return localStorage.getItem('isLogin') === 'true';
  },
};

export default Auth;

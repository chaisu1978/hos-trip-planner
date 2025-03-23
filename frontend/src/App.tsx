import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignInPage from "./components/pages/SignInPage";
import SignUpPage from "./components/pages/SignUpPage";
import ChangePasswordPage from "./components/pages/ChangePasswordPage";
import MainSite from "./components/layout/MainSite";
import AuthGuard from "./components/common/AuthGuard";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserData } from "./store/authSlice";
import { RootState, AppDispatch } from "./store";
import ForgotPasswordPage from "./components/pages/ForgotPasswordPage";
import ResetPasswordPage from "./components/pages/ResetPasswordPage";

const App = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUserData());
    }
  }, [isAuthenticated, dispatch]);

  return (
    <Router>
      <Routes>
        {/* Global Routes */}
        <Route path="/login" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/*" element={<MainSite />} />
        {/* Authenticated Routes */}
        <Route
          path="/change-password"
          element={
            <AuthGuard>
              <ChangePasswordPage />
            </AuthGuard>
          }
        />
        {/* Superuser Routes */}

        {/* MainSite Routes */}
      </Routes>
    </Router>
  );
};

export default App;

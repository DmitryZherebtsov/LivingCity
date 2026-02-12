import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

const ProtectedRoute = ({ children }) => {
  const { isLoggedin } = useContext(AppContext);

  if (!isLoggedin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

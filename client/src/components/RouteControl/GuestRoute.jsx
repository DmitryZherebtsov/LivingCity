import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

const GuestRoute = ({ children }) => {
  const { isLoggedin } = useContext(AppContext);

  if (isLoggedin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestRoute;

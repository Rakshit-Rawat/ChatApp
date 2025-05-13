import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useAuthRedirect = (user) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/register");
    }
  }, [user, navigate]);
};

export default useAuthRedirect;

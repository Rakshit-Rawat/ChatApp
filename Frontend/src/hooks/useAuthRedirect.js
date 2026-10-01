import { useEffect } from "react";
import { useNavigate } from "react-router";

const useAuthRedirect = (user) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/register");
    }
  }, [navigate, user]);
};

export default useAuthRedirect;

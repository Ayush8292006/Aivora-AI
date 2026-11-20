import api from "../../utils/axios.js";

const getCurrentUser = async () => {
  try {
    const { data } = await api.get("/api/me");
    if (data && data._id && !data.isGuest) {
      localStorage.setItem("aivora_user", JSON.stringify(data));
    }
    return data;
  } catch (error) {
    // If not authenticated, clear stored user
    localStorage.removeItem("aivora_user");
    return null;
  }
};

export default getCurrentUser;

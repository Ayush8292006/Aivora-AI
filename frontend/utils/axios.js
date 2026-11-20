import axios from "axios";
import { linkWithCredential } from "firebase/auth";

const api=axios.create({
    baseURL:import.meta.env.VITE_SERVER_URL,
    withCredentials:true
})

export default api
import api from '../../utils/axios.js'

async function logOut() {
  try {
    await api.get("/api/auth/logout")
  } catch (error) {
    console.error("Logout API error:", error)
  } finally {
    localStorage.removeItem("aivora_token")
    localStorage.removeItem("aivora_user")
  }
}

export default logOut

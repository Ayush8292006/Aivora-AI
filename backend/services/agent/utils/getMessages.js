import axios from "axios"

export const getMessages=async(converstationId)=>{
try {
    const {data}= await axios.get(`${process.env.CHAT_SERVICE}/get-messages/${converstationId}`)
    return data
} catch (error) {
    return null
    console.log(error)
}
}
import api from "../../utils/axios.js";

export const uploadFile = async (file, conversationId, onProgress) => {
    const formData = new FormData();
    formData.append("file", file);
    if (conversationId) {
        formData.append("conversationId", conversationId);
    }

    const response = await api.post("/api/files/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percent);
            }
        }
    });

    return response.data;
};

export default uploadFile;

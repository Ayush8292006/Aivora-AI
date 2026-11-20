// src/redux/messageSlice.js
import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
    name: "message",
    initialState: {
        messages: [],
        artifacts:[]
    },
    reducers: {
        addMessage: (state, action) => {
            
            const newMessage = {
                ...action.payload,
                images: action.payload.images || []
            }
            state.messages.push(newMessage)
            
        },
        setMessages: (state, action) => {
           
            state.messages = action.payload
        },
        clearMessages: (state) => {
            
            state.messages = []
        },
        setArtifacts: (state, action) => {
           
            state.artifacts = action.payload
        },

    }
})

export const { addMessage, setMessages, clearMessages,setArtifacts } = messageSlice.actions;
export default messageSlice.reducer;
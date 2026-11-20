// src/redux/conversationSlice.js
import { createSlice } from "@reduxjs/toolkit";

const conversationSlice = createSlice({
    name: "conversation",
    initialState: {
        conversations: [],
        selectedConversation: null
    },
    reducers: {
        setConversations: (state, action) => {
            state.conversations = action.payload
        },
        addConversation: (state, action) => {
            state.conversations.unshift(action.payload)
        },
        setSelectedConversation: (state, action) => {
            state.selectedConversation = action.payload
        },
        setConvTitle: (state, action) => {
            const { title, conversationId } = action.payload
            state.conversations = state.conversations.map((conv) => 
                conv._id === conversationId ? { ...conv, title } : conv
            )
            if (state.selectedConversation?._id === conversationId) {
                state.selectedConversation = { ...state.selectedConversation, title }
            }
        },
        deleteConversationAction: (state, action) => {
            const conversationId = action.payload;
            state.conversations = state.conversations.filter(c => c._id !== conversationId);
            if (state.selectedConversation?._id === conversationId) {
                state.selectedConversation = state.conversations[0] || null;
            }
        },
        togglePinConversation: (state, action) => {
            const conversationId = action.payload;
            state.conversations = state.conversations.map(c => 
                c._id === conversationId ? { ...c, pinned: !c.pinned } : c
            );
            if (state.selectedConversation?._id === conversationId) {
                state.selectedConversation = { 
                    ...state.selectedConversation, 
                    pinned: !state.selectedConversation.pinned 
                };
            }
        }
    }
})

export const { 
    setConversations, 
    addConversation, 
    setSelectedConversation, 
    setConvTitle,
    deleteConversationAction,
    togglePinConversation
} = conversationSlice.actions;

export default conversationSlice.reducer;
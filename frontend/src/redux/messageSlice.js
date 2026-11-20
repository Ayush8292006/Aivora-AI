// src/redux/messageSlice.js
import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
    name: "message",
    initialState: {
        messages: [],
        artifacts: [],
        activeArtifactId: null,
        isOpen: true,
        isMaximized: false
    },
    reducers: {
        addMessage: (state, action) => {
            const newMessage = {
                ...action.payload,
                images: action.payload.images || [],
                artifacts: action.payload.artifacts || [],
                attachments: action.payload.attachments || []
            };
            state.messages.push(newMessage);

            // If message has artifacts, accumulate them into state.artifacts
            if (Array.isArray(action.payload.artifacts) && action.payload.artifacts.length > 0) {
                action.payload.artifacts.forEach(newArt => {
                    const existingIdx = state.artifacts.findIndex(a => a.id === newArt.id || (a.fileId && a.fileId === newArt.fileId));
                    if (existingIdx !== -1) {
                        state.artifacts[existingIdx] = newArt;
                    } else {
                        state.artifacts.push(newArt);
                    }
                    state.activeArtifactId = newArt.id;
                    state.isOpen = true;
                });
            }
        },
        setMessages: (state, action) => {
            const msgs = Array.isArray(action.payload) ? action.payload : [];
            state.messages = msgs;

            // Extract all artifacts from loaded message history
            const loadedArtifacts = [];
            msgs.forEach(msg => {
                if (Array.isArray(msg.artifacts) && msg.artifacts.length > 0) {
                    msg.artifacts.forEach(art => {
                        if (!loadedArtifacts.some(a => a.id === art.id)) {
                            loadedArtifacts.push(art);
                        }
                    });
                }
            });
            state.artifacts = loadedArtifacts;
            if (loadedArtifacts.length > 0 && !state.activeArtifactId) {
                state.activeArtifactId = loadedArtifacts[loadedArtifacts.length - 1].id;
            }
        },
        clearMessages: (state) => {
            state.messages = [];
            state.artifacts = [];
            state.activeArtifactId = null;
        },
        setArtifacts: (state, action) => {
            state.artifacts = action.payload || [];
            if (state.artifacts.length > 0) {
                state.activeArtifactId = state.artifacts[state.artifacts.length - 1].id;
                state.isOpen = true;
            }
        },
        setActiveArtifactId: (state, action) => {
            state.activeArtifactId = action.payload;
            state.isOpen = true;
        },
        setArtifactOpen: (state, action) => {
            state.isOpen = Boolean(action.payload);
        },
        toggleMaximize: (state) => {
            state.isMaximized = !state.isMaximized;
        }
    }
});

export const { 
    addMessage, 
    setMessages, 
    clearMessages, 
    setArtifacts, 
    setActiveArtifactId,
    setArtifactOpen,
    toggleMaximize
} = messageSlice.actions;

export default messageSlice.reducer;

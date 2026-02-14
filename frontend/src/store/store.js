import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import documentReducer from './slices/documentSlice'
import analysisReducer from './slices/analysisSlice'
import notificationReducer from './slices/notificationSlice'  // Add this

export const store = configureStore({
    reducer: {
        auth: authReducer,
        documents: documentReducer,
        analysis: analysisReducer,
        notifications: notificationReducer,  // Add this
    },
})
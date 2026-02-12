import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import documentReducer from './slices/documentSlice'
import analysisReducer from './slices/analysisSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        documents: documentReducer,
        analysis: analysisReducer,
    },
})
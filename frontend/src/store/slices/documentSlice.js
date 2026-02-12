import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const uploadDocument = createAsyncThunk(
    'documents/upload',
    async (formData, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth
            const response = await axios.post(`${API_URL}/documents/upload/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Token ${token}`,
                },
            })
            toast.success('Document uploaded successfully!')
            return response.data
        } catch (error) {
            toast.error(error.response?.data?.error || 'Upload failed')
            return rejectWithValue(error.response?.data)
        }
    }
)

export const fetchDocuments = createAsyncThunk(
    'documents/fetchAll',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth
            const response = await axios.get(`${API_URL}/documents/list/`, {
                headers: { Authorization: `Token ${token}` },
            })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data)
        }
    }
)

const documentSlice = createSlice({
    name: 'documents',
    initialState: {
        documents: [],
        currentDocument: null,
        loading: false,
        error: null,
    },
    reducers: {
        setCurrentDocument: (state, action) => {
            state.currentDocument = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(uploadDocument.pending, (state) => {
                state.loading = true
            })
            .addCase(uploadDocument.fulfilled, (state, action) => {
                state.loading = false
                state.documents.unshift(action.payload)
            })
            .addCase(uploadDocument.rejected, (state) => {
                state.loading = false
            })
            .addCase(fetchDocuments.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchDocuments.fulfilled, (state, action) => {
                state.loading = false
                state.documents = action.payload
            })
            .addCase(fetchDocuments.rejected, (state) => {
                state.loading = false
            })
    },
})

export const { setCurrentDocument } = documentSlice.actions
export default documentSlice.reducer
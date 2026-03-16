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

// ✅ FIXED: Delete a single document - WITH /delete/ at the end
export const deleteDocument = createAsyncThunk(
    'documents/delete',
    async (documentId, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth
            console.log('🗑️ Deleting document:', documentId)
            console.log('🔑 Token:', token)
            console.log('🌐 URL:', `${API_URL}/documents/${documentId}/delete/`)

            await axios.delete(
                `${API_URL}/documents/${documentId}/delete/`,  // ✅ ADDED /delete/
                { headers: { Authorization: `Token ${token}` } }
            )

            toast.success('Document deleted successfully!')
            return documentId
        } catch (error) {
            console.error('❌ Delete error:', error.response?.data || error.message)
            toast.error('Failed to delete document')
            return rejectWithValue(error.response?.data)
        }
    }
)

// ✅ FIXED: Bulk delete documents - WITH /delete/ at the end
export const bulkDeleteDocuments = createAsyncThunk(
    'documents/bulkDelete',
    async (documentIds, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth
            await Promise.all(documentIds.map(id =>
                axios.delete(
                    `${API_URL}/documents/${id}/delete/`,  // ✅ ADDED /delete/
                    { headers: { Authorization: `Token ${token}` } }
                )
            ))
            toast.success(`${documentIds.length} documents deleted successfully!`)
            return documentIds
        } catch (error) {
            toast.error('Failed to delete documents')
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
            .addCase(deleteDocument.fulfilled, (state, action) => {
                state.documents = state.documents.filter(doc => doc.id !== action.payload)
            })
            .addCase(bulkDeleteDocuments.fulfilled, (state, action) => {
                state.documents = state.documents.filter(doc => !action.payload.includes(doc.id))
            })
    },
})

export const { setCurrentDocument } = documentSlice.actions
export default documentSlice.reducer
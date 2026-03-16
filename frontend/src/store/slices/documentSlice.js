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
            // Fetch documents list
            const response = await axios.get(`${API_URL}/documents/list/`, {
                headers: { Authorization: `Token ${token}` },
            })

            // For each document, fetch its risk count
            const documentsWithRiskCount = await Promise.all(
                response.data.map(async (doc) => {
                    try {
                        // Try to fetch risks for this document
                        const risksResponse = await axios.get(
                            `${API_URL}/analyze/documents/${doc.id}/risks/`,
                            { headers: { Authorization: `Token ${token}` } }
                        )
                        return {
                            ...doc,
                            risk_count: risksResponse.data.length || 0
                        }
                    } catch (error) {
                        // If fails (maybe document not processed yet), set risk_count to 0
                        return {
                            ...doc,
                            risk_count: 0
                        }
                    }
                })
            )

            return documentsWithRiskCount
        } catch (error) {
            console.error('Fetch documents error:', error)
            return rejectWithValue(error.response?.data)
        }
    }
)

export const deleteDocument = createAsyncThunk(
    'documents/delete',
    async (documentId, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth
            await axios.delete(
                `${API_URL}/documents/${documentId}/delete/`,
                { headers: { Authorization: `Token ${token}` } }
            )
            toast.success('Document deleted successfully!')
            return documentId
        } catch (error) {
            console.error('Delete error:', error.response?.data || error.message)
            toast.error(error.response?.data?.error || 'Failed to delete document')
            return rejectWithValue(error.response?.data)
        }
    }
)

export const bulkDeleteDocuments = createAsyncThunk(
    'documents/bulkDelete',
    async (documentIds, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth
            await Promise.all(documentIds.map(id =>
                axios.delete(
                    `${API_URL}/documents/${id}/delete/`,
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
                state.documents.unshift({
                    ...action.payload,
                    risk_count: 0 // New documents start with 0 risks
                })
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
            .addCase(fetchDocuments.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
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
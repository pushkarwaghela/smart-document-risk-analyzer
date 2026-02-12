import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Async thunks
export const fetchRiskAnalysis = createAsyncThunk(
    'analysis/fetchRiskAnalysis',
    async (documentId, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth
            const response = await axios.get(`${API_URL}/analyze/documents/${documentId}/risks/`, {
                headers: { Authorization: `Token ${token}` }
            })
            return { documentId, risks: response.data }
        } catch (error) {
            return rejectWithValue(error.response?.data)
        }
    }
)

export const fetchRiskReport = createAsyncThunk(
    'analysis/fetchRiskReport',
    async (documentId, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth
            const response = await axios.get(`${API_URL}/analyze/documents/${documentId}/report/`, {
                headers: { Authorization: `Token ${token}` }
            })
            return { documentId, report: response.data }
        } catch (error) {
            return rejectWithValue(error.response?.data)
        }
    }
)

export const fetchStatistics = createAsyncThunk(
    'analysis/fetchStatistics',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth
            const response = await axios.get(`${API_URL}/analyze/statistics/`, {
                headers: { Authorization: `Token ${token}` }
            })
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data)
        }
    }
)

export const processDocument = createAsyncThunk(
    'analysis/processDocument',
    async (documentId, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth
            const response = await axios.post(
                `${API_URL}/documents/${documentId}/process/`,
                {},
                {
                    headers: { Authorization: `Token ${token}` }
                }
            )
            toast.success('Document processing started!')
            return { documentId, status: response.data }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Processing failed')
            return rejectWithValue(error.response?.data)
        }
    }
)

// Initial state
const initialState = {
    risks: {},
    reports: {},
    statistics: null,
    loading: false,
    error: null,
    processingStatus: {}
}

// Slice
const analysisSlice = createSlice({
    name: 'analysis',
    initialState,
    reducers: {
        clearAnalysis: (state) => {
            state.risks = {}
            state.reports = {}
            state.statistics = null
            state.error = null
        },
        clearDocumentAnalysis: (state, action) => {
            const documentId = action.payload
            delete state.risks[documentId]
            delete state.reports[documentId]
            delete state.processingStatus[documentId]
        },
        setProcessingStatus: (state, action) => {
            const { documentId, status } = action.payload
            state.processingStatus[documentId] = status
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Risk Analysis
            .addCase(fetchRiskAnalysis.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchRiskAnalysis.fulfilled, (state, action) => {
                state.loading = false
                const { documentId, risks } = action.payload
                state.risks[documentId] = risks
            })
            .addCase(fetchRiskAnalysis.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Fetch Risk Report
            .addCase(fetchRiskReport.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchRiskReport.fulfilled, (state, action) => {
                state.loading = false
                const { documentId, report } = action.payload
                state.reports[documentId] = report
            })
            .addCase(fetchRiskReport.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Fetch Statistics
            .addCase(fetchStatistics.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchStatistics.fulfilled, (state, action) => {
                state.loading = false
                state.statistics = action.payload
            })
            .addCase(fetchStatistics.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })

            // Process Document
            .addCase(processDocument.pending, (state, action) => {
                const documentId = action.meta.arg
                state.processingStatus[documentId] = 'PROCESSING'
                state.error = null
            })
            .addCase(processDocument.fulfilled, (state, action) => {
                const { documentId } = action.payload
                state.processingStatus[documentId] = 'COMPLETED'
                toast.success('Document processed successfully!')
            })
            .addCase(processDocument.rejected, (state, action) => {
                const documentId = action.meta.arg
                state.processingStatus[documentId] = 'FAILED'
                state.error = action.payload
            })
    }
})

// Selectors
export const selectRisksByDocumentId = (state, documentId) =>
    state.analysis.risks[documentId] || []

export const selectReportByDocumentId = (state, documentId) =>
    state.analysis.reports[documentId] || null

export const selectProcessingStatus = (state, documentId) =>
    state.analysis.processingStatus[documentId] || null

// Actions
export const { clearAnalysis, clearDocumentAnalysis, setProcessingStatus } = analysisSlice.actions

// Reducer
export default analysisSlice.reducer
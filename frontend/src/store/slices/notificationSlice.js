import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Add a simple throttle mechanism
let lastFetchTime = 0;
const THROTTLE_TIME = 10000; // 10 seconds

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchAll',
    async (_, { getState, rejectWithValue }) => {
        // Throttle multiple rapid calls
        const now = Date.now();
        if (now - lastFetchTime < THROTTLE_TIME) {
            // Return cached data from state instead of making API call
            const state = getState();
            return state.notifications.items;
        }

        try {
            const { token } = getState().auth
            const response = await axios.get(`${API_URL}/notifications/`, {
                headers: { Authorization: `Token ${token}` }
            })
            lastFetchTime = now;
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data)
        }
    }
)

export const markAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (notificationId, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth
            const response = await axios.post(
                `${API_URL}/notifications/${notificationId}/read/`,
                {},
                { headers: { Authorization: `Token ${token}` } }
            )
            return { id: notificationId, ...response.data }
        } catch (error) {
            return rejectWithValue(error.response?.data)
        }
    }
)

export const markAllAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth
            const response = await axios.post(
                `${API_URL}/notifications/mark-all-read/`,
                {},
                { headers: { Authorization: `Token ${token}` } }
            )
            return response.data
        } catch (error) {
            return rejectWithValue(error.response?.data)
        }
    }
)

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        items: [],
        unreadCount: 0,
        loading: false,
        error: null,
        lastUpdated: null,
    },
    reducers: {
        addNotification: (state, action) => {
            state.items.unshift(action.payload)
            if (!action.payload.is_read) {
                state.unreadCount++
            }
        },
        clearNotifications: (state) => {
            state.items = []
            state.unreadCount = 0
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.loading = false
                state.items = action.payload
                state.unreadCount = action.payload.filter(n => !n.is_read).length
                state.lastUpdated = Date.now()
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
            .addCase(markAsRead.fulfilled, (state, action) => {
                const notification = state.items.find(n => n.id === action.payload.id)
                if (notification && !notification.is_read) {
                    notification.is_read = true
                    state.unreadCount = Math.max(0, state.unreadCount - 1)
                }
            })
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.items.forEach(n => { n.is_read = true })
                state.unreadCount = 0
            })
    },
})

export const { addNotification, clearNotifications } = notificationSlice.actions
export default notificationSlice.reducer
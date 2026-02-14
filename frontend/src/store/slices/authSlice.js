import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Login action
export const login = createAsyncThunk(
    'auth/login',
    async ({ username, password }, { rejectWithValue }) => {
        try {
            console.log('🔑 Attempting login for:', username)

            const response = await axios.post(`${API_URL}/auth/login/`, {
                username,
                password
            })

            console.log('✅ Login response received:', response.data)

            // CRITICAL: Save to localStorage IMMEDIATELY
            if (response.data.token) {
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('user', JSON.stringify(response.data.user))
                console.log('💾 Token saved to localStorage:', response.data.token)
            } else {
                console.error('❌ No token in response!')
            }

            toast.success('Login successful!')
            return response.data

        } catch (error) {
            console.error('❌ Login error:', error.response?.data || error.message)
            toast.error(error.response?.data?.non_field_errors?.[0] || 'Login failed')
            return rejectWithValue(error.response?.data)
        }
    }
)

// Register action
export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register/`, userData)
            toast.success('Registration successful! Please login.')
            return response.data
        } catch (error) {
            toast.error(error.response?.data?.username?.[0] || 'Registration failed')
            return rejectWithValue(error.response?.data)
        }
    }
)

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: JSON.parse(localStorage.getItem('user')) || null,
        token: localStorage.getItem('token') || null,
        isAuthenticated: !!localStorage.getItem('token'),
        loading: false,
        error: null,
    },
    reducers: {
        logout: (state) => {
            // Clear localStorage
            localStorage.removeItem('token')
            localStorage.removeItem('user')

            // Clear state
            state.user = null
            state.token = null
            state.isAuthenticated = false

            toast.success('Logged out successfully')
        },
        clearError: (state) => {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            // Login cases
            .addCase(login.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false
                state.isAuthenticated = true
                state.user = action.payload.user
                state.token = action.payload.token

                console.log('✅ Redux state updated with token:', action.payload.token)
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
                state.isAuthenticated = false
            })

            // Register cases
            .addCase(register.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(register.fulfilled, (state) => {
                state.loading = false
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload
            })
    },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
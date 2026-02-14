import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../store/slices/authSlice'
import { ShieldCheckIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useTheme } from '../context/ThemeContext'

const Login = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { loading } = useSelector((state) => state.auth)
    const { darkMode, toggleDarkMode } = useTheme()

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const result = await dispatch(login(formData))
        if (!result.error) {
            navigate('/dashboard')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            {/* Theme Toggle */}
            <button
                onClick={toggleDarkMode}
                className="fixed top-4 right-4 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all z-50"
            >
                {darkMode ? (
                    <SunIcon className="w-6 h-6 text-yellow-500" />
                ) : (
                    <MoonIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                )}
            </button>

            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl shadow-lg flex items-center justify-center animate-float">
                            <ShieldCheckIcon className="w-12 h-12 text-white" />
                        </div>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Welcome back
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Or{' '}
                        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                            create a new account
                        </Link>
                    </p>
                </div>

                <div className="card dark:bg-gray-800 dark:border-gray-700">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="username" className="label dark:text-gray-300">
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                className="input dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="label dark:text-gray-300">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="input dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                                    Forgot password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed dark:bg-primary-600 dark:hover:bg-primary-700"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    'Sign in'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Login
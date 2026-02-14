import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '../store/slices/authSlice'
import { ShieldCheckIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { useTheme } from '../context/ThemeContext'

const Register = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { loading } = useSelector((state) => state.auth)
    const { darkMode, toggleDarkMode } = useTheme()

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: '',
    })

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const result = await dispatch(register(formData))
        if (!result.error) {
            navigate('/login')
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
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Or{' '}
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                            sign in to existing account
                        </Link>
                    </p>
                </div>

                <div className="card dark:bg-gray-800 dark:border-gray-700">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="first_name" className="label dark:text-gray-300">
                                    First Name
                                </label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    className="input dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                    placeholder="John"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label htmlFor="last_name" className="label dark:text-gray-300">
                                    Last Name
                                </label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    className="input dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                    placeholder="Doe"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="username" className="label dark:text-gray-300">
                                Username *
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="input dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                placeholder="johndoe"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="label dark:text-gray-300">
                                Email *
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="input dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="label dark:text-gray-300">
                                Password *
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="input dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="password2" className="label dark:text-gray-300">
                                Confirm Password *
                            </label>
                            <input
                                id="password2"
                                name="password2"
                                type="password"
                                required
                                className="input dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                                placeholder="••••••••"
                                value={formData.password2}
                                onChange={handleChange}
                            />
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
                                        Creating account...
                                    </span>
                                ) : (
                                    'Sign up'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default Register
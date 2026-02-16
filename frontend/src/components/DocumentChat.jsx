import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useSelector } from 'react-redux';
import {
    ChatBubbleLeftIcon,
    PaperAirplaneIcon,
    XMarkIcon,
    SparklesIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const DocumentChat = ({ documentId, documentTitle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [fallbackMode, setFallbackMode] = useState(false);
    const messagesEndRef = useRef(null);
    const { token } = useSelector((state) => state.auth);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: input,
            sender: 'user',
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post(
                `${API_URL}/ai/chat/${documentId}/`,
                { question: input },
                { headers: { Authorization: `Token ${token}` } }
            );

            const aiMessage = {
                id: Date.now() + 1,
                text: response.data.answer,
                sender: 'ai',
                timestamp: new Date().toISOString(),
                mode: response.data.mode || 'openai'
            };

            setMessages(prev => [...prev, aiMessage]);
            
            if (response.data.mode === 'fallback') {
                setFallbackMode(true);
                if (response.data.warning) {
                    toast.info('Using basic mode (OpenAI unavailable)');
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            
            let errorMsg = 'Failed to get response';
            let helpText = 'Please try again later.';
            
            if (error.response?.data?.error?.includes('rate limit')) {
                errorMsg = 'OpenAI rate limit reached';
                helpText = 'Using basic mode instead.';
                setFallbackMode(true);
            }

            const errorMessage = {
                id: Date.now() + 1,
                text: `❌ ${errorMsg}\n\n${helpText}`,
                sender: 'ai',
                timestamp: new Date().toISOString(),
                isError: true
            };

            setMessages(prev => [...prev, errorMessage]);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Chat Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-24 w-14 h-14 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center group hover:scale-110 z-[100]"
                title="Chat with AI"
            >
                <ChatBubbleLeftIcon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                {fallbackMode && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white" />
                )}
            </button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-[150] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-500 to-secondary-500">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <SparklesIcon className="w-5 h-5 text-white" />
                                    <h3 className="font-semibold text-white">AI Assistant</h3>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-white/80 hover:text-white transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-xs text-white/80 mt-1">
                                Ask about "{documentTitle?.slice(0, 30)}..."
                            </p>
                            {fallbackMode && (
                                <div className="mt-2 bg-yellow-500/20 text-yellow-100 text-xs p-2 rounded-lg flex items-center">
                                    <ExclamationTriangleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                                    <span>Basic mode - Limited responses</span>
                                </div>
                            )}
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                                    <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Ask me about this document!</p>
                                    <p className="text-sm mt-2">Examples:</p>
                                    <ul className="text-xs mt-2 space-y-1">
                                        <li>"What are the main risks?"</li>
                                        <li>"Summarize this document"</li>
                                        <li>"Any privacy concerns?"</li>
                                    </ul>
                                </div>
                            )}

                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl ${
                                            msg.sender === 'user'
                                                ? 'bg-primary-500 text-white rounded-br-none'
                                                : msg.isError 
                                                    ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-bl-none border border-red-200 dark:border-red-800'
                                                    : msg.mode === 'fallback'
                                                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-bl-none border border-yellow-200 dark:border-yellow-800'
                                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                                        }`}
                                    >
                                        <p className="text-sm whitespace-pre-line">{msg.text}</p>
                                        <p className="text-xs mt-1 opacity-70">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                            {msg.mode === 'fallback' && ' • basic'}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-bl-none p-4">
                                        <div className="flex space-x-2">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />        
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />        
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder={fallbackMode ? "Ask (basic mode)..." : "Ask anything..."}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={loading || !input.trim()}
                                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <PaperAirplaneIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default DocumentChat;
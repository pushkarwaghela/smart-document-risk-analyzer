import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { DocumentTextIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const SimilarDocuments = ({ documentId }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const { token } = useSelector((state) => state.auth);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    useEffect(() => {
        fetchSimilarDocuments();
    }, [documentId]);

    const fetchSimilarDocuments = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${API_URL}/ai/similar/${documentId}/`,
                { headers: { Authorization: `Token ${token}` } }
            );
            setDocuments(response.data.results || []);
        } catch (error) {
            console.error('Error fetching similar documents:', error);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                ))}
            </div>
        );
    }

    // ✅ FIXED: Empty state with icon
    if (documents.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center"
            >
                <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No similar documents found</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Upload more documents to see similarities
                </p>
            </motion.div>
        );
    }

    const getRelevanceColor = (relevance) => {
        switch (relevance) {
            case 'high': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
            case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
            default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl"
        >
            <div className="flex items-center space-x-2 mb-4">
                <SparklesIcon className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Similar Documents</h3>
            </div>

            <div className="space-y-3">
                {documents.map((doc) => (
                    <Link
                        key={doc.id}
                        to={`/documents/${doc.id}`}
                        className="block p-3 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                                <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{doc.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{doc.type}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${getRelevanceColor(doc.relevance)}`}>
                                {doc.similarity?.toFixed(1) || 0}% match
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </motion.div>
    );
};

export default SimilarDocuments;
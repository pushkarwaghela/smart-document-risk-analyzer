import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { diffWords } from 'diff';
import { ArrowLeftRightIcon, DownloadIcon } from '@heroicons/react/24/outline';

const DocumentCompare = () => {
    const [documents, setDocuments] = useState([]);
    const [doc1, setDoc1] = useState(null);
    const [doc2, setDoc2] = useState(null);
    const [diff, setDiff] = useState([]);
    const [loading, setLoading] = useState(false);
    const { token } = useSelector(state => state.auth);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await axios.get(`${API_URL}/documents/list/`, {
                headers: { Authorization: `Token ${token}` }
            });
            setDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    const compareDocuments = async () => {
        if (!doc1 || !doc2) return;

        setLoading(true);
        try {
            const response1 = await axios.get(`${API_URL}/documents/${doc1}/`, {
                headers: { Authorization: `Token ${token}` }
            });
            const response2 = await axios.get(`${API_URL}/documents/${doc2}/`, {
                headers: { Authorization: `Token ${token}` }
            });

            const text1 = response1.data.extracted_text || '';
            const text2 = response2.data.extracted_text || '';

            const differences = diffWords(text1, text2);
            setDiff(differences);
        } catch (error) {
            console.error('Error comparing documents:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Document Comparison</h1>

            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Document
                    </label>
                    <select
                        value={doc1 || ''}
                        onChange={(e) => setDoc1(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="">Select document...</option>
                        {documents.map(doc => (
                            <option key={doc.id} value={doc.id}>{doc.title}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Second Document
                    </label>
                    <select
                        value={doc2 || ''}
                        onChange={(e) => setDoc2(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="">Select document...</option>
                        {documents.map(doc => (
                            <option key={doc.id} value={doc.id}>{doc.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                onClick={compareDocuments}
                disabled={!doc1 || !doc2 || loading}
                className="btn-primary flex items-center"
            >
                <ArrowLeftRightIcon className="w-5 h-5 mr-2" />
                {loading ? 'Comparing...' : 'Compare Documents'}
            </button>

            {diff.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Differences</h2>
                    <div className="font-mono text-sm whitespace-pre-wrap">
                        {diff.map((part, index) => (
                            <span
                                key={index}
                                className={
                                    part.added
                                        ? 'bg-green-100 text-green-800'
                                        : part.removed
                                            ? 'bg-red-100 text-red-800'
                                            : ''
                                }
                            >
                                {part.value}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentCompare;
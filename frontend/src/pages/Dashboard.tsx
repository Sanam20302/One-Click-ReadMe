import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Book, Loader2, CheckCircle, AlertCircle, Rocket } from 'lucide-react';
import { auth, repos } from '../services/api';

interface Repo {
    id: number;
    full_name: string;
    description: string;
    private: boolean;
    html_url: string;
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [repoList, setRepoList] = useState<Repo[]>([]);
    const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
    const [previewContent, setPreviewContent] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [generating, setGenerating] = useState<boolean>(false);
    const [publishing, setPublishing] = useState<boolean>(false);
    const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        setLoading(true);
        repos.list()
            .then(setRepoList)
            .catch((err) => {
                console.error(err);
                setError("Failed to load repositories. You may need to re-login.");
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    const handleSelectRepo = async (repo: Repo) => {
        setSelectedRepo(repo);
        setPreviewContent('');
        setPublishedUrl(null);
        setError(null);
        setGenerating(true);

        try {
            const data = await repos.preview(repo.full_name);
            setPreviewContent(data.content);
        } catch (err) {
            console.error(err);
            setError("Failed to generate README. Please try again.");
        } finally {
            setGenerating(false);
        }
    };

    const handlePublish = async () => {
        if (!selectedRepo || !previewContent) return;

        setPublishing(true);
        try {
            const data = await repos.publish(selectedRepo.full_name, previewContent);
            if (data.success) {
                setPublishedUrl(data.commit || selectedRepo.html_url);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to publish README.");
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar: Repo List */}
            <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center">
                        <Book className="w-5 h-5 mr-2" /> Repositories
                    </h2>
                    <button onClick={() => { localStorage.removeItem('token'); navigate('/'); }} className="text-xs text-red-500 hover:text-red-700">Logout</button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gray-400" /></div>
                    ) : error && repoList.length === 0 ? (
                        <div className="p-4 text-center">
                            <div className="inline-block p-3 rounded-full bg-red-100 text-red-500 mb-2">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <p className="text-sm text-red-600 mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                                Reload Page
                            </button>
                        </div>
                    ) : (
                        <ul>
                            {repoList.map((repo) => (
                                <li
                                    key={repo.id}
                                    onClick={() => handleSelectRepo(repo)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${selectedRepo?.id === repo.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                >
                                    <div className="font-medium text-gray-900 truncate">{repo.full_name}</div>
                                    <div className="text-xs text-gray-500 truncate">{repo.description || "No description"}</div>
                                    {repo.private && <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-200 rounded-full text-gray-600">Private</span>}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Main Content: Preview & Publish */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {selectedRepo ? (
                    <>
                        <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm">
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">{selectedRepo.full_name}</h1>
                                <p className="text-sm text-gray-500">Previewing generated README</p>
                            </div>

                            <div className="flex items-center space-x-3">
                                {publishedUrl ? (
                                    <a href={publishedUrl} target="_blank" rel="noreferrer" className="flex items-center text-green-600 font-medium px-4 py-2 bg-green-50 rounded-md">
                                        <CheckCircle className="w-5 h-5 mr-2" /> Published!
                                    </a>
                                ) : (
                                    <button
                                        onClick={handlePublish}
                                        disabled={generating || publishing || !previewContent}
                                        className={`flex items-center px-6 py-2 rounded-md text-white font-medium transition-all ${generating || publishing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md transform hover:scale-105'}`}
                                    >
                                        {publishing ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Rocket className="w-5 h-5 mr-2" />}
                                        {publishing ? 'Publishing...' : 'Commit'}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 bg-gray-100">
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
                                    <AlertCircle className="w-5 h-5 mr-2" /> {error}
                                </div>
                            )}

                            {generating ? (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                                    <Loader2 className="w-12 h-12 mb-4 text-blue-500 animate-spin" />
                                    <p className="text-lg font-medium">Analyzing repository & generating README...</p>
                                </div>
                            ) : (
                                <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8 min-h-[500px]">
                                    {previewContent ? (
                                        <article className="prose prose-blue max-w-none">
                                            <ReactMarkdown
                                                components={{
                                                    h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-6 mb-4 border-b pb-2" {...props} />,
                                                    h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-5 mb-3" {...props} />,
                                                    h3: ({ node, ...props }) => <h3 className="text-xl font-medium mt-4 mb-2" {...props} />,
                                                    p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-4" {...props} />,
                                                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-4" {...props} />,
                                                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                    a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" {...props} />,
                                                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4" {...props} />,
                                                    code: ({ node, ...props }) => <code className="bg-gray-100 rounded px-1 py-0.5 font-mono text-sm" {...props} />,
                                                    pre: ({ node, ...props }) => <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4" {...props} />,
                                                }}
                                            >
                                                {previewContent}
                                            </ReactMarkdown>
                                        </article>
                                    ) : (
                                        <div className="text-center text-gray-400 py-20">Select a repository to generate a README</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                        <Book className="w-16 h-16 mb-4 opacity-50" />
                        <p className="text-xl font-medium">Select a repository to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

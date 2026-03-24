import React, { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { useSmoothRefresh } from './hooks/useSmoothRefresh';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import {
    classroomAPI,
    assignmentAPI,
    doubtAPI,
    announcementAPI,
    fileAPI,
    questionPaperAPI
} from "./services/api";

import {
    Search,
    BookOpen,
    FileText,
    BarChart3,
    ChevronRight,
    TrendingUp,
    Brain,
    Calendar,
    Users,
    Bell,
    Clock,
    CheckCircle,
    XCircle,
    Send,
    MessageSquare,
    PlusCircle,
    UserPlus,
    Upload,
    Star,
    AlertCircle,
    LogOut,
    ArrowRight,

    Download,

    Trash2,

    X,
} from "lucide-react";
import toast from "react-hot-toast";

export default function PTUNexusClassroom() {
    const { user, logout, isTeacher } = useAuth();
    const [activeTab, setActiveTab] = useState("home");
    const [activeClassroomTab, setActiveClassroomTab] = useState("stream");
    const [selectedClassroom, setSelectedClassroom] = useState(null);

    // Data states
    const [classrooms, setClassrooms] = useState([]);
    const [joinRequests, setJoinRequests] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [doubts, setDoubts] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [students, setStudents] = useState([]);
    const [doubtAnswers, setDoubtAnswers] = useState([]);
    const [showAnswersSection, setShowAnswersSection] = useState({});
    const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
    const [selectedSubmissions, setSelectedSubmissions] = useState([]);
    const [showQuestionPapersModal, setShowQuestionPapersModal] = useState(false);
    const [qpFilter, setQPFilter] = useState({});
    const [questionPapers, setQuestionPapers] = useState([]);
    const [qpSearch, setQPSearch] = useState('');

    useEffect(() => {
        if (!showQuestionPapersModal) return;
        questionPaperAPI.getAll({ ...qpFilter, search: qpSearch })
            .then(res => setQuestionPapers(res.data.papers))
            .catch(console.error);
    }, [qpFilter, qpSearch, showQuestionPapersModal]);
    // added PDF stream option
    const [files, setFiles] = useState([]);
    const [showUploadFileModal, setShowUploadFileModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileDescription, setFileDescription] = useState('');
    // const [uploadProgress, setUploadProgress] = useState(0);

    // Loading states
    const [loading, setLoading] = useState(false);

    // Modal states
    const [showCreateAssignmentModal, setShowCreateAssignmentModal] =
        useState(false);
    const [showCreateClassroomModal, setShowCreateClassroomModal] =
        useState(false);
    const [showJoinClassroomModal, setShowJoinClassroomModal] = useState(false);
    const [showPostAnnouncementModal, setShowPostAnnouncementModal] =
        useState(false);
    const [showPostDoubtModal, setShowPostDoubtModal] = useState(false);
    const [showAnswerDoubtModal, setShowAnswerDoubtModal] = useState(false);
    const [selectedDoubt, setSelectedDoubt] = useState(null);
    const [doubtAnswer, setDoubtAnswer] = useState("");
    // Form states
    const [newAssignment, setNewAssignment] = useState({
        title: "",
        description: "",
        topic: "",
        total_marks: "",
        deadline: "",
    });

    const [newClassroom, setNewClassroom] = useState({
        name: "",
        code: "",
        subject_id: null,
    });

    const [joinCode, setJoinCode] = useState("");

    const [newAnnouncement, setNewAnnouncement] = useState({
        text: "",
        important: false,
    });

    const [newDoubt, setNewDoubt] = useState({
        topic: "",
        question: "",
    });

    // Sample data for stats
    const stats = [
        { label: "Question Papers", value: "500+", icon: FileText },
        { label: "Subjects Covered", value: "45", icon: BookOpen },
        {
            label: "Active Classrooms",
            value: classrooms.length.toString() || "0",
            icon: Users,
        },
        { label: "Total Students", value: "1,200+", icon: Calendar },
    ];

    const topTopics = [
        { topic: "Binary Search Trees", frequency: 87, trend: "up" },
        { topic: "Process Scheduling", frequency: 72, trend: "up" },
        { topic: "Normalization", frequency: 68, trend: "stable" },
        { topic: "TCP/IP Protocol", frequency: 64, trend: "down" },
        { topic: "React Hooks", frequency: 45, trend: "up" },
    ];


    // Fetch classrooms on mount
    useEffect(() => {
        if (user) {
            fetchClassrooms(false); // false = show loading
        }
    }, [user]);

    useSmoothRefresh(
        () => {
            if (user) fetchClassrooms(true); // true = silent refresh
        },
        30000,
        !!user
    );

    // Fetch classroom data when selected
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (selectedClassroom) {
            fetchClassroomData(false); // false = show loading initially

            if (activeClassroomTab === 'stream') {
                fetchClassroomFiles();
            }
        }
    }, [selectedClassroom, activeClassroomTab]);

    useSmoothRefresh(
        () => {
            if (selectedClassroom) {
                fetchClassroomData(true); // true = silent refresh
                if (activeClassroomTab === 'stream') {
                    fetchClassroomFiles();
                }
            }
        },
        30000,
        !!selectedClassroom
    );

    const fetchClassrooms = async (silent = false) => {
        try {
            if (!silent) setLoading(true); // Only show loading on initial load
            const response = await classroomAPI.getMyClassrooms();
            setClassrooms(response.data.classrooms);
        } catch (error) {
            console.error("Error fetching classrooms:", error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const fetchClassroomData = async (silent = false) => {
        if (!selectedClassroom) return;

        try {
            if (!silent) setLoading(true);

            if (activeClassroomTab === "stream") {
                const response = await announcementAPI.getAnnouncements(
                    selectedClassroom.id,
                );
                setAnnouncements(response.data.announcements);
            } else if (activeClassroomTab === "classwork") {
                const response = await assignmentAPI.getAssignments(
                    selectedClassroom.id,
                );
                setAssignments(response.data.assignments);
            } else if (activeClassroomTab === "doubts") {
                const response = await doubtAPI.getDoubts(selectedClassroom.id);
                setDoubts(response.data.doubts);
            } else if (activeClassroomTab === "people") {
                const response = await classroomAPI.getStudents(selectedClassroom.id);
                setStudents(response.data.students);
            }

            if (isTeacher && selectedClassroom) {
                const response = await classroomAPI.getJoinRequests(
                    selectedClassroom.id,
                );
                setJoinRequests(response.data.requests);
            }
        } catch (error) {
            console.error("Error fetching classroom data:", error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleAnswerDoubt = async () => {
        try {
            if (!selectedDoubt || !doubtAnswer.trim()) {
                toast.error("Please write an answer");
                return;
            }

            setLoading(true);

            await doubtAPI.answerDoubt(selectedDoubt.id, doubtAnswer);

            setShowAnswerDoubtModal(false);
            setSelectedDoubt(null);
            setDoubtAnswer("");

            fetchClassroomData();
            toast.success("Answer posted successfully! ✅");
        } catch (error) {
            console.error("Error answering doubt:", error);
            toast.error("Failed to post answer");
        } finally {
            setLoading(false);
        }
    };
    const handleJoinRequest = async (requestId, action) => {
        try {
            await classroomAPI.handleJoinRequest(requestId, action);
            fetchClassrooms();
            if (selectedClassroom) {
                const response = await classroomAPI.getJoinRequests(
                    selectedClassroom.id,
                );
                setJoinRequests(response.data.requests);
            }
        } catch (error) {
            console.error("Error handling join request:", error);
            toast.error("Failed to process request");
        }
    };

    const handleResolveDoubt = async (doubtId) => {
        try {
            await doubtAPI.resolveDoubt(doubtId);
            fetchClassroomData();
        } catch (error) {
            console.error("Error resolving doubt:", error);
        }
    };

    const handleUpvoteDoubt = async (doubtId) => {
        try {
            await doubtAPI.upvoteDoubt(doubtId);
            fetchClassroomData();
        } catch (error) {
            console.error("Error upvoting doubt:", error);
        }
    };

    const handleCreateAssignment = async () => {
        try {
            if (!selectedClassroom) {
                toast.error("Please select a classroom first");
                return;
            }

            setLoading(true);

            const assignmentData = {
                classroom_id: selectedClassroom.id,
                title: newAssignment.title,
                description: newAssignment.description,
                topic: newAssignment.topic,
                total_marks: parseInt(newAssignment.total_marks),
                deadline: newAssignment.deadline,
            };

            await assignmentAPI.createAssignment(assignmentData);

            setShowCreateAssignmentModal(false);
            setNewAssignment({
                title: "",
                description: "",
                topic: "",
                total_marks: "",
                deadline: "",
            });

            fetchClassroomData();
            toast.success("Assignment created successfully! ✅");
        } catch (error) {
            console.error("Error creating assignment:", error);
            toast.error(error.response?.data?.message || "Failed to create assignment");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClassroom = async () => {
        try {
            setLoading(true);

            const classroomData = {
                name: newClassroom.name,
                code: newClassroom.code,
                subject_id: newClassroom.subject_id || null, // Send null if not selected
            };

            console.log("Creating classroom with data:", classroomData); // Debug log

            await classroomAPI.createClassroom(classroomData);

            setShowCreateClassroomModal(false);
            setNewClassroom({
                name: "",
                code: "",
                subject_id: null,
            });

            fetchClassrooms();
            toast.success("Classroom created successfully! ✅");
        } catch (error) {
            console.error("Error creating classroom:", error);
            console.error("Error response:", error.response?.data); // Better error logging
            toast.error(
                error.response?.data?.message ||
                "Failed to create classroom. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleJoinClassroom = async () => {
        try {
            console.log("=== JOIN CLASSROOM DEBUG ===");
            console.log("Join Code:", joinCode);
            console.log("User:", user);

            setLoading(true);

            const response = await classroomAPI.joinClassroom(joinCode);

            console.log("Join Response:", response.data);

            setShowJoinClassroomModal(false);
            setJoinCode("");

            toast.success("Join request sent! Wait for teacher approval. ✅");
            fetchClassrooms();
        } catch (error) {
            console.error("Join Classroom Error:", error);
            console.error("Error Response:", error.response?.data);
            toast.error(error.response?.data?.message || "Failed to join classroom");
        } finally {
            setLoading(false);
        }
    };

    const handlePostAnnouncement = async () => {
        try {
            if (!selectedClassroom) {
                toast.error("Please select a classroom first");
                return;
            }

            setLoading(true);

            const announcementData = {
                classroom_id: selectedClassroom.id,
                text: newAnnouncement.text,
                important: newAnnouncement.important,
            };

            await announcementAPI.createAnnouncement(announcementData);

            setShowPostAnnouncementModal(false);
            setNewAnnouncement({
                text: "",
                important: false,
            });

            fetchClassroomData();
            toast.success("Announcement posted successfully! ✅");
        } catch (error) {
            console.error("Error posting announcement:", error);
            toast.error("Failed to post announcement");
        } finally {
            setLoading(false);
        }
    };

    const handlePostDoubt = async () => {
        try {
            if (!selectedClassroom) {
                toast.error("Please select a classroom first");
                return;
            }

            setLoading(true);

            const doubtData = {
                classroom_id: selectedClassroom.id,
                topic: newDoubt.topic,
                question: newDoubt.question,
            };

            await doubtAPI.createDoubt(doubtData);

            setShowPostDoubtModal(false);
            setNewDoubt({
                topic: "",
                question: "",
            });

            fetchClassroomData();
            toast.success("Doubt posted successfully! ✅");
        } catch (error) {
            console.error("Error posting doubt:", error);
            toast.error("Failed to post doubt");
        } finally {
            setLoading(false);
        }
    };
    const handleViewAnswers = async (doubtId) => {
        try {
            // Toggle answers visibility
            if (showAnswersSection[doubtId]) {
                setShowAnswersSection({ ...showAnswersSection, [doubtId]: false });
                return;
            }

            setLoading(true);

            // Fetch doubt with answers
            const response = await doubtAPI.getDoubt(doubtId);

            // Store answers for this doubt
            setDoubtAnswers((prev) => ({
                ...prev,
                [doubtId]: response.data.answers || [],
            }));

            // Show answers section
            setShowAnswersSection({ ...showAnswersSection, [doubtId]: true });
        } catch (error) {
            console.error("Error fetching answers:", error);
            toast.error("Failed to load answers");
        } finally {
            setLoading(false);
        }
    };
    const handleDeleteDoubt = async (doubtId) => {
        confirmAlert({
            title: 'Confirm Delete',
            message: 'Delete this doubt? All answers will also be deleted.',
            buttons: [
                {
                    label: 'Yes',
                    onClick: async () => {
                        try {
                            await doubtAPI.deleteDoubt(doubtId);
                            fetchClassroomData();
                            toast.success('Doubt deleted successfully!');
                        } catch (error) {
                            console.error('Error deleting doubt:', error);
                            toast.error('Failed to delete doubt');
                        }
                    }
                },
                {
                    label: 'No'
                }
            ]
        });
    };

    const handleDeleteAnswer = async (answerId, doubtId) => {
        confirmAlert({
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this answer?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: async () => {
                        try {
                            await doubtAPI.deleteAnswer(answerId);
                            await handleViewAnswers(doubtId); // Refresh answers
                            toast.success('Answer deleted successfully!');
                        } catch (error) {
                            console.error('Error deleting answer:', error);
                            toast.error('Failed to delete answer');
                        }
                    }
                },
                {
                    label: 'No'
                }
            ]
        });
    };
    const handleUploadFile = async () => {
        try {
            if (!selectedFile) {
                toast.error('Please select a file');
                return;
            }

            if (!selectedClassroom) {
                toast.error('Please select a classroom first');
                return;
            }

            setLoading(true);

            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('classroom_id', selectedClassroom.id);
            formData.append('description', fileDescription);

            await fileAPI.uploadFile(formData);

            setShowUploadFileModal(false);
            setSelectedFile(null);
            setFileDescription('');

            fetchClassroomFiles();
            toast.success('File uploaded successfully! ✅');
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error(error.response?.data?.message || 'Failed to upload file');
        } finally {
            setLoading(false);
        }
    };

    const fetchClassroomFiles = async () => {
        if (!selectedClassroom) return;

        try {
            const response = await fileAPI.getClassroomFiles(selectedClassroom.id);
            setFiles(response.data.files);
        } catch (error) {
            console.error('Error fetching files:', error);
        }
    };

    const handleDownloadFile = async (fileId, fileName) => {
        try {
            const response = await fileAPI.downloadFile(fileId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading file:', error);
            toast.error('Failed to download file');
        }
    };

    const handleDeleteFile = async (fileId) => {
        confirmAlert({
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this file?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: async () => {
                        // ✅ Delete logic INSIDE the onClick
                        try {
                            await fileAPI.deleteFile(fileId);
                            fetchClassroomFiles();
                            toast.success('File deleted successfully! ✅');
                        } catch (error) {
                            console.error('Error deleting file:', error);
                            toast.error('Failed to delete file');
                        }
                    }
                },
                {
                    label: 'No',
                    onClick: () => {

                    }
                }
            ]
        });
    };
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-light tracking-tight text-gray-900">
                                    PTU Nexus
                                </h1>
                                <p className="text-xs text-gray-500 -mt-1">
                                    Smart Learning Platform
                                </p>
                            </div>
                        </div>

                        <div className="hidden md:flex gap-8">
                            {[
                                { id: "home", label: "Home", icon: BookOpen },
                                { id: "classroom", label: "Classroom", icon: Users },
                                { id: "analytics", label: "Analytics", icon: BarChart3 },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id
                                        ? "bg-indigo-50 text-indigo-600"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                                        }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    <span className="font-light">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            </button>
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                    {user?.role === "teacher" ? "T" : "S"}
                                </div>
                                <span className="text-sm text-gray-700 hidden md:block">
                                    {user?.full_name || user?.username}
                                </span>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* HOME TAB */}
                {activeTab === "home" && (
                    <div className="space-y-16 animate-fadeIn">
                        {/* Hero Section */}
                        <div className="relative bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-12 text-white overflow-hidden">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                            <div className="relative z-10">
                                <div className="max-w-3xl">
                                    <h2 className="text-5xl font-light mb-4 leading-tight">
                                        Welcome back,{" "}
                                        <span className="font-normal">
                                            {user?.full_name?.split(" ")[0] || "Student"}
                                        </span>
                                        ! 👋
                                    </h2>
                                    <p className="text-xl text-white/90 font-light mb-8">
                                        Your personalized learning dashboard is ready. Let's make
                                        today productive!
                                    </p>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setActiveTab("classroom")}
                                            className="px-6 py-3 bg-white text-indigo-600 rounded-xl hover:bg-white/90 transition-all shadow-lg flex items-center gap-2 font-medium"
                                        >
                                            <Users className="w-5 h-5" />
                                            Go to Classrooms
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("analytics")}
                                            className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all border border-white/20 flex items-center gap-2"
                                        >
                                            <BarChart3 className="w-5 h-5" />
                                            View Analytics
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 hover:shadow-lg transition-all cursor-pointer group">
                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Question Papers
                                </h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    Browse 500+ past papers with solutions
                                </p>
                                <div className="flex items-center text-blue-600 text-sm font-medium">
                                    Explore <ArrowRight className="w-4 h-4 ml-1" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-all cursor-pointer group">
                                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <MessageSquare className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Doubt Forum
                                </h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    Ask questions and help others
                                </p>
                                <div className="flex items-center text-purple-600 text-sm font-medium">
                                    Ask Doubt <ArrowRight className="w-4 h-4 ml-1" />
                                </div>
                            </div>

                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 hover:shadow-lg transition-all cursor-pointer group">
                                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Brain className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    AI Insights
                                </h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    Get smart study recommendations
                                </p>
                                <div className="flex items-center text-green-600 text-sm font-medium">
                                    View Insights <ArrowRight className="w-4 h-4 ml-1" />
                                </div>
                            </div>
                        </div>
                        {/* Question Papers Course Cards Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">

                            {/* B.Tech CSE */}
                            <div
                                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                                onClick={() => {
                                    setShowQuestionPapersModal(true);
                                    setQuestionPapers([]);
                                    setQPFilter({ course: 'btech-cse' });
                                    setQPSearch('');
                                    questionPaperAPI.getAll({ course: 'btech-cse' })
                                        .then(res => setQuestionPapers(res.data.papers))
                                        .catch(console.error);
                                }}
                            >
                                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                                    <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">B.Tech CSE</h3>
                                <p className="text-gray-500 text-xs">All semesters available</p>
                            </div>

                            {/* B.Tech Civil */}
                            <div
                                className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-5 border border-orange-200 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                                onClick={() => {
                                    setShowQuestionPapersModal(true);
                                    setQuestionPapers([]);
                                    setQPFilter({ course: 'btech-civil' });
                                    setQPSearch('');
                                    questionPaperAPI.getAll({ course: 'btech-civil' })
                                        .then(res => setQuestionPapers(res.data.papers))
                                        .catch(console.error);
                                }}
                            >
                                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-4">
                                    <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">B.Tech Civil</h3>
                                <p className="text-gray-500 text-xs">All semesters available</p>
                            </div>

                            {/* B.Tech Mechanical */}
                            <div
                                className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-5 border border-green-200 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                                onClick={() => {
                                    setShowQuestionPapersModal(true);
                                    setQuestionPapers([]);
                                    setQPFilter({ course: 'btech-mechanical' });
                                    setQPSearch('');
                                    questionPaperAPI.getAll({ course: 'btech-mechanical' })
                                        .then(res => setQuestionPapers(res.data.papers))
                                        .catch(console.error);
                                }}
                            >
                                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                                    <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">B.Tech Mechanical</h3>
                                <p className="text-gray-500 text-xs">All semesters available</p>
                            </div>

                            {/* B.Tech Electrical */}
                            <div
                                className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-5 border border-yellow-200 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                                onClick={() => {
                                    setShowQuestionPapersModal(true);
                                    setQuestionPapers([]);
                                    setQPFilter({ course: 'btech-electrical' });
                                    setQPSearch('');
                                    questionPaperAPI.getAll({ course: 'btech-electrical' })
                                        .then(res => setQuestionPapers(res.data.papers))
                                        .catch(console.error);
                                }}
                            >
                                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mb-4">
                                    <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">B.Tech Electrical</h3>
                                <p className="text-gray-500 text-xs">All semesters available</p>
                            </div>

                            {/* B.Tech ECE */}
                            <div
                                className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-5 border border-purple-200 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                                onClick={() => {
                                    setShowQuestionPapersModal(true);
                                    setQuestionPapers([]);
                                    setQPFilter({ course: 'btech-ece' });
                                    setQPSearch('');
                                    questionPaperAPI.getAll({ course: 'btech-ece' })
                                        .then(res => setQuestionPapers(res.data.papers))
                                        .catch(console.error);
                                }}
                            >
                                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                                    <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">B.Tech ECE</h3>
                                <p className="text-gray-500 text-xs">All semesters available</p>
                            </div>

                            {/* B.Tech IT */}
                            <div
                                className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-5 border border-cyan-200 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                                onClick={() => {
                                    setShowQuestionPapersModal(true);
                                    setQuestionPapers([]);
                                    setQPFilter({ course: 'btech-it' });
                                    setQPSearch('');
                                    questionPaperAPI.getAll({ course: 'btech-it' })
                                        .then(res => setQuestionPapers(res.data.papers))
                                        .catch(console.error);
                                }}
                            >
                                <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center mb-4">
                                    <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">B.Tech IT</h3>
                                <p className="text-gray-500 text-xs">All semesters available</p>
                            </div>

                            {/* BBA */}
                            <div
                                className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl p-5 border border-pink-200 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                                onClick={() => {
                                    setShowQuestionPapersModal(true);
                                    setQuestionPapers([]);
                                    setQPFilter({ course: 'bba' });
                                    setQPSearch('');
                                    questionPaperAPI.getAll({ course: 'bba' })
                                        .then(res => setQuestionPapers(res.data.papers))
                                        .catch(console.error);
                                }}
                            >
                                <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center mb-4">
                                    <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">BBA</h3>
                                <p className="text-gray-500 text-xs">All years available</p>
                            </div>

                            {/* BCA */}
                            <div
                                className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-5 border border-indigo-200 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                                onClick={() => {
                                    setShowQuestionPapersModal(true);
                                    setQuestionPapers([]);
                                    setQPFilter({ course: 'bca' });
                                    setQPSearch('');
                                    questionPaperAPI.getAll({ course: 'bca' })
                                        .then(res => setQuestionPapers(res.data.papers))
                                        .catch(console.error);
                                }}
                            >
                                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
                                    <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">BCA</h3>
                                <p className="text-gray-500 text-xs">All semesters available</p>
                            </div>

                            {/* MBA */}
                            <div
                                className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-5 border border-red-200 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                                onClick={() => {
                                    setShowQuestionPapersModal(true);
                                    setQuestionPapers([]);
                                    setQPFilter({ course: 'mba' });
                                    setQPSearch('');
                                    questionPaperAPI.getAll({ course: 'mba' })
                                        .then(res => setQuestionPapers(res.data.papers))
                                        .catch(console.error);
                                }}
                            >
                                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center mb-4">
                                    <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">MBA</h3>
                                <p className="text-gray-500 text-xs">All semesters available</p>
                            </div>

                            {/* MCA */}
                            <div
                                className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-2xl p-5 border border-teal-200 hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                                onClick={() => {
                                    setShowQuestionPapersModal(true);
                                    setQuestionPapers([]);
                                    setQPFilter({ course: 'mca' });
                                    setQPSearch('');
                                    questionPaperAPI.getAll({ course: 'mca' })
                                        .then(res => setQuestionPapers(res.data.papers))
                                        .catch(console.error);
                                }}
                            >
                                <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center mb-4">
                                    <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-base font-semibold text-gray-900 mb-1">MCA</h3>
                                <p className="text-gray-500 text-xs">All semesters available</p>
                            </div>

                        </div>
                        {/* Stats Grid */}
                        <div>
                            <h3 className="text-2xl font-light text-gray-900 mb-6">
                                Platform Statistics
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {stats.map((stat, index) => (
                                    <div
                                        key={index}
                                        className="bg-white p-8 rounded-2xl border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <stat.icon className="w-8 h-8 text-indigo-600 group-hover:scale-110 transition-transform" />
                                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                                                <TrendingUp className="w-4 h-4 text-indigo-600" />
                                            </div>
                                        </div>
                                        <div className="text-3xl font-light text-gray-900 mb-1">
                                            {stat.value}
                                        </div>
                                        <div className="text-sm text-gray-500 font-light">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-2xl font-light text-gray-900">
                                    Recent Activity
                                </h3>
                                <button className="text-indigo-600 text-sm font-medium hover:text-indigo-700">
                                    View All
                                </button>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100 shadow-sm">
                                {[
                                    {
                                        icon: FileText,
                                        title: "New assignment posted in Data Structures",
                                        time: "2 hours ago",
                                        color: "blue",
                                    },
                                    {
                                        icon: MessageSquare,
                                        title: "Your doubt was answered in OS class",
                                        time: "5 hours ago",
                                        color: "green",
                                    },

                                    {
                                        icon: Bell,
                                        title: "Upcoming: Mid-term exam on March 20th",
                                        time: "2 days ago",
                                        color: "amber",
                                    },
                                ].map((activity, i) => (
                                    <div
                                        key={i}
                                        className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-4"
                                    >
                                        <div
                                            className={`w-10 h-10 bg-${activity.color}-50 rounded-lg flex items-center justify-center flex-shrink-0`}
                                        >
                                            <activity.icon
                                                className={`w-5 h-5 text-${activity.color}-600`}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-gray-900 text-sm font-medium">
                                                {activity.title}
                                            </p>
                                            <p className="text-gray-500 text-xs">{activity.time}</p>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* CLASSROOM TAB - List View */}
                {activeTab === "classroom" && !selectedClassroom && (
                    <div className="space-y-8 animate-fadeIn">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-3xl font-light text-gray-900 mb-2">
                                    My Classrooms
                                </h2>
                                <p className="text-gray-600 font-light">
                                    Manage your courses and collaborate
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    if (isTeacher) {
                                        setShowCreateClassroomModal(true);
                                    } else {
                                        setShowJoinClassroomModal(true);
                                    }
                                }}
                                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                            >
                                {isTeacher ? (
                                    <>
                                        <PlusCircle className="w-5 h-5" />
                                        Create Classroom
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-5 h-5" />
                                        Join Classroom
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Join Requests (Teacher Only) */}
                        {isTeacher && joinRequests.length > 0 && (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertCircle className="w-5 h-5 text-amber-600" />
                                    <h3 className="text-lg font-normal text-gray-900">
                                        Pending Join Requests ({joinRequests.length})
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    {joinRequests.map((request) => (
                                        <div
                                            key={request.id}
                                            className="bg-white p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div>
                                                <h4 className="font-normal text-gray-900">
                                                    {request.full_name || request.username}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    {request.email} •{" "}
                                                    {new Date(request.requested_at).toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() =>
                                                        handleJoinRequest(request.id, "accept")
                                                    }
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1 transition-colors"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                    Accept
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleJoinRequest(request.id, "reject")
                                                    }
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-1 transition-colors"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-500 mt-4">Loading classrooms...</p>
                            </div>
                        ) : classrooms.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-normal text-gray-900 mb-2">
                                    No Classrooms Yet
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    {isTeacher
                                        ? "Create your first classroom to get started"
                                        : "Join a classroom to start learning"}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {classrooms.map((classroom) => (
                                    <div
                                        key={classroom.id}
                                        onClick={() => setSelectedClassroom(classroom)}
                                        className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                                    >
                                        <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors"></div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                            <div className="absolute bottom-4 left-6 text-white">
                                                <h3 className="text-xl font-normal mb-1">
                                                    {classroom.name}
                                                </h3>
                                                <p className="text-sm opacity-90">
                                                    {classroom.teacher_name || "You"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="p-6">
                                            <div className="grid grid-cols-3 gap-4 mb-4">
                                                <div>
                                                    <div className="text-2xl font-light text-gray-900">
                                                        {classroom.student_count || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-500">Students</div>
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-light text-gray-900">
                                                        {classroom.assignment_count || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Assignments
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-light text-gray-900">
                                                        {classroom.doubt_count || 0}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Active Doubts
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                <span className="text-xs text-gray-500 px-3 py-1 bg-gray-50 rounded-full">
                                                    {classroom.code}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* CLASSROOM TAB - Inside Classroom */}
                {activeTab === "classroom" && selectedClassroom && (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Classroom Header */}
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
                            <button
                                onClick={() => setSelectedClassroom(null)}
                                className="text-white/80 hover:text-white mb-4 flex items-center gap-2 transition-colors"
                            >
                                ← Back to Classrooms
                            </button>
                            <h2 className="text-3xl font-light mb-2">
                                {selectedClassroom.name}
                            </h2>
                            <p className="text-white/90">
                                {selectedClassroom.teacher_name || "You"} •{" "}
                                {selectedClassroom.student_count || 0} students
                            </p>
                            <div className="mt-4">
                                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg inline-block">
                                    <span className="text-sm">Class Code: </span>
                                    <span className="font-medium">{selectedClassroom.code}</span>
                                </div>
                            </div>
                        </div>

                        {/* Classroom Tabs */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-md">
                            <div className="border-b border-gray-200 px-6 overflow-x-auto">
                                <div className="flex gap-8 min-w-max">
                                    {[
                                        { id: "stream", label: "Stream", icon: Bell },
                                        { id: "classwork", label: "Classwork", icon: FileText },
                                        {
                                            id: "doubts",
                                            label: "Doubts Forum",
                                            icon: MessageSquare,
                                        },
                                        { id: "people", label: "People", icon: Users },

                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveClassroomTab(tab.id)}
                                            className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-all whitespace-nowrap ${activeClassroomTab === tab.id
                                                ? "border-indigo-600 text-indigo-600"
                                                : "border-transparent text-gray-600 hover:text-gray-900"
                                                }`}
                                        >
                                            <tab.icon className="w-4 h-4" />
                                            <span className="font-light">{tab.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Stream Tab */}
                                {/* Stream Tab */}
                                {activeClassroomTab === 'stream' && (
                                    <div className="space-y-6">
                                        {isTeacher && (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setShowPostAnnouncementModal(true)}
                                                    className="flex-1 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Bell className="w-5 h-5" />Post Announcement
                                                </button>

                                                <button
                                                    onClick={() => setShowUploadFileModal(true)}
                                                    className="flex-1 py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Upload className="w-5 h-5" />Upload File
                                                </button>
                                            </div>
                                        )}

                                        {loading ? (
                                            <div className="text-center py-8">
                                                <div className="inline-block w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Files Section */}
                                                {files.length > 0 && (
                                                    <div>
                                                        <h3 className="text-lg font-medium text-gray-900 mb-4">📁 Shared Files</h3>
                                                        <div className="space-y-3">
                                                            {files.map((file) => (
                                                                <div key={file.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                            {file.file_type.startsWith('image/') ? (
                                                                                <img src={`${process.env.REACT_APP_API_URL}/uploads/${file.file_path}`} alt={file.file_name} className="w-full h-full object-cover rounded-lg" />
                                                                            ) : file.file_type === 'application/pdf' ? (
                                                                                <FileText className="w-6 h-6 text-red-600" />
                                                                            ) : (
                                                                                <FileText className="w-6 h-6 text-blue-600" />
                                                                            )}
                                                                        </div>

                                                                        <div className="flex-1">
                                                                            <h4 className="font-medium text-gray-900">{file.file_name}</h4>
                                                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                                <span>{file.uploader_name}</span>
                                                                                <span>•</span>
                                                                                <span>{(file.file_size / 1024 / 1024).toFixed(2)} MB</span>
                                                                                <span>•</span>
                                                                                <span>{new Date(file.created_at).toLocaleDateString()}</span>
                                                                            </div>
                                                                            {file.description && (
                                                                                <p className="text-sm text-gray-600 mt-1">{file.description}</p>
                                                                            )}
                                                                        </div>

                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                onClick={() => handleDownloadFile(file.id, file.file_name)}
                                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                                title="Download"
                                                                            >
                                                                                <Download className="w-5 h-5" />
                                                                            </button>

                                                                            {isTeacher && (
                                                                                <button
                                                                                    onClick={() => handleDeleteFile(file.id)}
                                                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                                    title="Delete"
                                                                                >
                                                                                    <Trash2 className="w-5 h-5" />
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Announcements Section */}
                                                {announcements.length === 0 && files.length === 0 ? (
                                                    <div className="text-center py-8 text-gray-500">
                                                        No announcements or files yet
                                                    </div>
                                                ) : (
                                                    announcements.length > 0 && (
                                                        <div>
                                                            <h3 className="text-lg font-medium text-gray-900 mb-4">📢 Announcements</h3>
                                                            <div className="space-y-4">
                                                                {announcements.map((announcement) => (
                                                                    <div key={announcement.id} className={`p-6 rounded-xl border shadow-sm ${announcement.important ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-white'}`}>
                                                                        <div className="flex items-start gap-4">
                                                                            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">T</div>
                                                                            <div className="flex-1">
                                                                                {announcement.important && (
                                                                                    <span className="inline-block px-2 py-1 bg-amber-200 text-amber-800 text-xs rounded-full mb-2 font-medium">Important</span>
                                                                                )}
                                                                                <p className="text-gray-900 mb-2">{announcement.text}</p>
                                                                                <p className="text-sm text-gray-500">{new Date(announcement.created_at).toLocaleDateString()}</p>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Classwork Tab */}
                                {activeClassroomTab === "classwork" && (
                                    <div className="space-y-6">
                                        {isTeacher && (
                                            <button
                                                onClick={() => setShowCreateAssignmentModal(true)}
                                                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                                            >
                                                <PlusCircle className="w-5 h-5" />
                                                Create Assignment
                                            </button>
                                        )}

                                        {loading ? (
                                            <div className="text-center py-8">
                                                <div className="inline-block w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        ) : assignments.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                No assignments yet
                                            </div>
                                        ) : (
                                            assignments.map((assignment) => (
                                                <div
                                                    key={assignment.id}
                                                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                                <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                                                                <h3 className="font-normal text-gray-900">
                                                                    {assignment.title}
                                                                </h3>
                                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                                                    Active
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-500 mb-3">
                                                                {assignment.topic}
                                                            </p>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <div className="text-2xl font-light text-gray-900">
                                                                {assignment.total_marks}
                                                            </div>
                                                            <div className="text-xs text-gray-500">marks</div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Clock className="w-4 h-4 text-gray-400" />
                                                            <span className="text-gray-600">
                                                                Due:{" "}
                                                                {new Date(
                                                                    assignment.deadline,
                                                                ).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Upload className="w-4 h-4 text-gray-400" />
                                                            <span className="text-gray-600">
                                                                {assignment.submission_count || 0} submitted
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {!isTeacher && (
                                                        <div className="flex justify-end">
                                                            <input
                                                                type="file"
                                                                id={`submit-${assignment.id}`}
                                                                accept=".pdf"
                                                                className="hidden"
                                                                onChange={async (e) => {
                                                                    const file = e.target.files[0];
                                                                    if (!file) return;

                                                                    if (file.type !== 'application/pdf') {
                                                                        toast.error('Only PDF files are allowed!');
                                                                        return;
                                                                    }

                                                                    const formData = new FormData();
                                                                    formData.append('file', file);

                                                                    try {
                                                                        await assignmentAPI.submitAssignment(assignment.id, formData);
                                                                        toast.success('Assignment submitted successfully! ✅');
                                                                        fetchClassroomData();
                                                                    } catch (error) {
                                                                        toast.error(error.response?.data?.message || 'Submission failed');
                                                                    }
                                                                }}
                                                            />
                                                            <label
                                                                htmlFor={`submit-${assignment.id}`}
                                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors cursor-pointer"
                                                            >
                                                                <Upload className="w-4 h-4" />
                                                                Submit Work (PDF Only)
                                                            </label>
                                                        </div>
                                                    )}

                                                    {isTeacher && (
                                                        <button
                                                            onClick={async () => {
                                                                const res = await assignmentAPI.getSubmissions(assignment.id);
                                                                setSelectedSubmissions(res.data.submissions);
                                                                setShowSubmissionsModal(true);
                                                            }}
                                                            className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                            View {assignment.submission_count || 0} Submissions
                                                        </button>
                                                    )}

                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* Doubts Forum Tab */}
                                {activeClassroomTab === "doubts" && (
                                    <div className="space-y-6">
                                        {!isTeacher && (
                                            <button
                                                onClick={() => setShowPostDoubtModal(true)}
                                                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                                            >
                                                <MessageSquare className="w-5 h-5" />
                                                Ask a Doubt
                                            </button>
                                        )}

                                        {loading ? (
                                            <div className="text-center py-8">
                                                <div className="inline-block w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        ) : doubts.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                No doubts yet
                                            </div>
                                        ) : (
                                            doubts.map((doubt) => (
                                                <div key={doubt.id} className={`border rounded-xl p-6 shadow-sm ${doubt.resolved ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}>
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium flex-shrink-0">
                                                            {doubt.student_name?.[0] || 'S'}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <span className="font-normal text-gray-900">{doubt.student_name || 'Student'}</span>
                                                                    <span className="text-sm text-gray-500">• {new Date(doubt.created_at).toLocaleDateString()}</span>
                                                                    {doubt.resolved && (
                                                                        <span className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full flex items-center gap-1">
                                                                            <CheckCircle className="w-3 h-3" />Resolved
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                {/* Delete Doubt Button - Only for Teacher */}
                                                                {isTeacher && (
                                                                    <button
                                                                        onClick={() => handleDeleteDoubt(doubt.id)}
                                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                        title="Delete Doubt"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                )}
                                                            </div>

                                                            <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full mb-2">{doubt.topic}</span>
                                                            <p className="text-gray-900 mb-3 font-medium">{doubt.question}</p>

                                                            <div className="flex items-center gap-4 text-sm flex-wrap">
                                                                <button
                                                                    onClick={() => handleUpvoteDoubt(doubt.id)}
                                                                    className={`flex items-center gap-1 transition-colors ${doubt.user_has_upvoted
                                                                        ? 'text-yellow-600 hover:text-yellow-700'
                                                                        : 'text-gray-600 hover:text-indigo-600'
                                                                        }`}
                                                                >
                                                                    <Star className={`w-4 h-4 ${doubt.user_has_upvoted ? 'fill-yellow-600' : ''}`} />
                                                                    {doubt.upvotes || 0}
                                                                </button>

                                                                <span className="flex items-center gap-1 text-gray-600">
                                                                    <MessageSquare className="w-4 h-4" />{doubt.answer_count || 0} answers
                                                                </span>

                                                                {/* ✅ ADD THIS: Answer Button for Everyone */}
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedDoubt(doubt);
                                                                        setShowAnswerDoubtModal(true);
                                                                    }}
                                                                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs transition-colors flex items-center gap-1.5"
                                                                >
                                                                    <Send className="w-3.5 h-3.5" />
                                                                    Answer
                                                                </button>

                                                                {isTeacher && !doubt.resolved && (
                                                                    <button
                                                                        onClick={() => handleResolveDoubt(doubt.id)}
                                                                        className="ml-auto px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs transition-colors"
                                                                    >
                                                                        Mark Resolved
                                                                    </button>
                                                                )}
                                                            </div>

                                                            {/* View Answers Section */}
                                                            {doubt.answer_count > 0 && (
                                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                                    <button
                                                                        onClick={() => handleViewAnswers(doubt.id)}
                                                                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 hover:underline"
                                                                    >
                                                                        {showAnswersSection[doubt.id] ? (
                                                                            <>
                                                                                <span>Hide {doubt.answer_count} {doubt.answer_count === 1 ? 'answer' : 'answers'}</span>
                                                                                <span className="text-lg">↑</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <span>View {doubt.answer_count} {doubt.answer_count === 1 ? 'answer' : 'answers'}</span>
                                                                                <span className="text-lg">↓</span>
                                                                            </>
                                                                        )}
                                                                    </button>

                                                                    {/* Answers List */}
                                                                    {showAnswersSection[doubt.id] && (
                                                                        <div className="mt-4 space-y-3">
                                                                            {loading ? (
                                                                                <div className="text-center py-4">
                                                                                    <div className="inline-block w-5 h-5 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                                                    <p className="text-gray-500 text-sm mt-2">Loading answers...</p>
                                                                                </div>
                                                                            ) : doubtAnswers[doubt.id] && doubtAnswers[doubt.id].length > 0 ? (
                                                                                doubtAnswers[doubt.id].map((answer) => (
                                                                                    <div key={answer.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                                                        <div className="flex items-start gap-3">
                                                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${answer.answerer_role === 'teacher'
                                                                                                ? 'bg-indigo-600 text-white'
                                                                                                : 'bg-gray-300 text-gray-700'
                                                                                                }`}>
                                                                                                {answer.answerer_role === 'teacher' ? 'T' : answer.answerer_name?.[0] || 'U'}
                                                                                            </div>
                                                                                            <div className="flex-1">
                                                                                                <div className="flex items-center justify-between mb-2">
                                                                                                    <div className="flex items-center gap-2">
                                                                                                        <span className="text-sm font-medium text-gray-900">
                                                                                                            {answer.answerer_full_name || answer.answerer_name}
                                                                                                        </span>
                                                                                                        {answer.answerer_role === 'teacher' && (
                                                                                                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                                                                                                                Teacher
                                                                                                            </span>
                                                                                                        )}
                                                                                                        <span className="text-xs text-gray-500">
                                                                                                            • {new Date(answer.created_at).toLocaleDateString()}
                                                                                                        </span>
                                                                                                    </div>

                                                                                                    {/* Delete Answer Button - Only for Teacher */}
                                                                                                    {isTeacher && (
                                                                                                        <button
                                                                                                            onClick={() => handleDeleteAnswer(answer.id, doubt.id)}
                                                                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                                                            title="Delete Answer"
                                                                                                        >
                                                                                                            <Trash2 className="w-4 h-4" />
                                                                                                        </button>
                                                                                                    )}
                                                                                                </div>
                                                                                                <p className="text-gray-700 text-sm whitespace-pre-wrap">{answer.answer}</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ))
                                                                            ) : (
                                                                                <p className="text-gray-500 text-sm text-center py-4">No answers yet</p>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {/* People Tab */}
                                {activeClassroomTab === "people" && (
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-normal text-gray-900 mb-4">
                                                Teacher
                                            </h3>
                                            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                                                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
                                                    T
                                                </div>
                                                <div>
                                                    <h4 className="font-normal text-gray-900">
                                                        {selectedClassroom.teacher_name || "You"}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        Course Instructor
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-normal text-gray-900 mb-4">
                                                Students ({students.length || 0})
                                            </h3>
                                            {loading ? (
                                                <div className="text-center py-8">
                                                    <div className="inline-block w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                </div>
                                            ) : students.length === 0 ? (
                                                <div className="text-center py-8 text-gray-500">
                                                    No students enrolled yet
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {students.map((student, i) => (
                                                        <div
                                                            key={i}
                                                            className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow"
                                                        >
                                                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                                                                {student.full_name?.[0] ||
                                                                    student.username?.[0] ||
                                                                    "S"}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-normal text-gray-900">
                                                                    {student.full_name || student.username}
                                                                </h4>
                                                                <p className="text-xs text-gray-500">
                                                                    {student.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}


                            </div>
                        </div>
                    </div>
                )}

                {/* ANALYTICS TAB */}
                {activeTab === "analytics" && (
                    <div className="space-y-8 animate-fadeIn">
                        <div>
                            <h2 className="text-3xl font-light text-gray-900 mb-2">
                                Analytics Dashboard
                            </h2>
                            <p className="text-gray-600 font-light">
                                Data-driven insights from past question papers
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-md">
                            <h3 className="text-xl font-normal text-gray-900 mb-6">
                                Most Frequently Asked Topics
                            </h3>
                            <div className="space-y-4">
                                {topTopics.map((topic, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-medium text-sm flex-shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-gray-900 font-normal">
                                                    {topic.topic}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-500 font-light">
                                                        {topic.frequency}%
                                                    </span>
                                                    {topic.trend === "up" && (
                                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                                                    style={{ width: `${topic.frequency}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-8 shadow-md">
                            <div className="flex items-start gap-4">
                                <Brain className="w-8 h-8 text-indigo-600 flex-shrink-0" />
                                <div>
                                    <h3 className="text-lg font-normal text-gray-900 mb-2">
                                        AI-Powered Insights
                                    </h3>
                                    <ul className="space-y-2 text-gray-700 font-light">
                                        <li>
                                            • Binary Search Trees appear 87% more frequently in recent
                                            papers
                                        </li>
                                        <li>
                                            • Process Scheduling questions have increased by 23% since
                                            2022
                                        </li>
                                        <li>
                                            • Database Normalization is consistently asked across all
                                            years
                                        </li>
                                        <li>
                                            • Focus on React Hooks - trending upward for Web
                                            Technologies
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* MODALS */}

            {/* Create Assignment Modal */}
            {showCreateAssignmentModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-normal text-gray-900">
                                Create New Assignment
                            </h3>
                            <button
                                onClick={() => {
                                    setShowCreateAssignmentModal(false);
                                    setNewAssignment({
                                        title: "",
                                        description: "",
                                        topic: "",
                                        total_marks: "",
                                        deadline: "",
                                    });
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Assignment Title *
                                </label>
                                <input
                                    type="text"
                                    value={newAssignment.title}
                                    onChange={(e) =>
                                        setNewAssignment({
                                            ...newAssignment,
                                            title: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., Binary Search Tree Implementation"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={newAssignment.description}
                                    onChange={(e) =>
                                        setNewAssignment({
                                            ...newAssignment,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Describe the assignment requirements..."
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Topic/Week *
                                </label>
                                <input
                                    type="text"
                                    value={newAssignment.topic}
                                    onChange={(e) =>
                                        setNewAssignment({
                                            ...newAssignment,
                                            topic: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., Week 3 - Trees"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Total Marks *
                                    </label>
                                    <input
                                        type="number"
                                        value={newAssignment.total_marks}
                                        onChange={(e) =>
                                            setNewAssignment({
                                                ...newAssignment,
                                                total_marks: e.target.value,
                                            })
                                        }
                                        placeholder="20"
                                        min="1"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Deadline *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={newAssignment.deadline}
                                        onChange={(e) =>
                                            setNewAssignment({
                                                ...newAssignment,
                                                deadline: e.target.value,
                                            })
                                        }
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowCreateAssignmentModal(false);
                                    setNewAssignment({
                                        title: "",
                                        description: "",
                                        topic: "",
                                        total_marks: "",
                                        deadline: "",
                                    });
                                }}
                                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateAssignment}
                                disabled={
                                    !newAssignment.title ||
                                    !newAssignment.topic ||
                                    !newAssignment.total_marks ||
                                    !newAssignment.deadline
                                }
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                <PlusCircle className="w-5 h-5" />
                                Create Assignment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Classroom Modal */}
            {showCreateClassroomModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
                        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-normal text-gray-900">
                                Create New Classroom
                            </h3>
                            <button
                                onClick={() => {
                                    setShowCreateClassroomModal(false);
                                    setNewClassroom({ name: "", code: "", subject_id: null });
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Classroom Name *
                                </label>
                                <input
                                    type="text"
                                    value={newClassroom.name}
                                    onChange={(e) =>
                                        setNewClassroom({ ...newClassroom, name: e.target.value })
                                    }
                                    placeholder="e.g., Data Structures - Section A"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Class Code *
                                </label>
                                <input
                                    type="text"
                                    value={newClassroom.code}
                                    onChange={(e) =>
                                        setNewClassroom({
                                            ...newClassroom,
                                            code: e.target.value.toUpperCase(),
                                        })
                                    }
                                    placeholder="e.g., DS2024A"
                                    maxLength={10}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Students will use this code to join
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Subject (Optional)
                                </label>
                                <select
                                    value={newClassroom.subject_id || ""}
                                    onChange={(e) =>
                                        setNewClassroom({
                                            ...newClassroom,
                                            subject_id: e.target.value
                                                ? parseInt(e.target.value)
                                                : null,
                                        })
                                    }
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">No subject selected</option>
                                    <option value="1">Data Structures (CS301)</option>
                                    <option value="2">Operating Systems (CS302)</option>
                                    <option value="3">Database Management (CS303)</option>
                                    <option value="4">Computer Networks (CS304)</option>
                                    <option value="5">Web Technologies (CS305)</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    You can add subjects in the database later
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowCreateClassroomModal(false);
                                    setNewClassroom({ name: "", code: "", subject_id: null });
                                }}
                                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateClassroom}
                                disabled={!newClassroom.name || !newClassroom.code}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                <PlusCircle className="w-5 h-5" />
                                Create Classroom
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Join Classroom Modal */}
            {showJoinClassroomModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-normal text-gray-900">
                                Join Classroom
                            </h3>
                            <button
                                onClick={() => {
                                    setShowJoinClassroomModal(false);
                                    setJoinCode("");
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Classroom Code *
                                </label>
                                <input
                                    type="text"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                    placeholder="Enter class code"
                                    maxLength={10}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase text-center text-2xl font-mono tracking-wider"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-2 text-center">
                                    Ask your teacher for the class code
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowJoinClassroomModal(false);
                                    setJoinCode("");
                                }}
                                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleJoinClassroom}
                                disabled={!joinCode || joinCode.length < 3}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                <UserPlus className="w-5 h-5" />
                                Join Classroom
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Post Announcement Modal */}
            {showPostAnnouncementModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
                        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-normal text-gray-900">
                                Post Announcement
                            </h3>
                            <button
                                onClick={() => {
                                    setShowPostAnnouncementModal(false);
                                    setNewAnnouncement({ text: "", important: false });
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <textarea
                                    value={newAnnouncement.text}
                                    onChange={(e) =>
                                        setNewAnnouncement({
                                            ...newAnnouncement,
                                            text: e.target.value,
                                        })
                                    }
                                    placeholder="What would you like to announce?"
                                    rows="4"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                    required
                                ></textarea>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="important"
                                    checked={newAnnouncement.important}
                                    onChange={(e) =>
                                        setNewAnnouncement({
                                            ...newAnnouncement,
                                            important: e.target.checked,
                                        })
                                    }
                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                />
                                <label
                                    htmlFor="important"
                                    className="text-sm text-gray-700 flex items-center gap-2"
                                >
                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                    Mark as important
                                </label>
                            </div>
                        </div>

                        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowPostAnnouncementModal(false);
                                    setNewAnnouncement({ text: "", important: false });
                                }}
                                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePostAnnouncement}
                                disabled={!newAnnouncement.text}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                <Send className="w-5 h-5" />
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Post Doubt Modal */}
            {showPostDoubtModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
                        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-normal text-gray-900">Ask a Doubt</h3>
                            <button
                                onClick={() => {
                                    setShowPostDoubtModal(false);
                                    setNewDoubt({ topic: "", question: "" });
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Topic *
                                </label>
                                <select
                                    value={newDoubt.topic}
                                    onChange={(e) =>
                                        setNewDoubt({ ...newDoubt, topic: e.target.value })
                                    }
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="">Select a topic</option>
                                    <option value="Trees">Trees</option>
                                    <option value="Graphs">Graphs</option>
                                    <option value="Hashing">Hashing</option>
                                    <option value="Sorting">Sorting</option>
                                    <option value="Dynamic Programming">
                                        Dynamic Programming
                                    </option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Question *
                                </label>
                                <textarea
                                    value={newDoubt.question}
                                    onChange={(e) =>
                                        setNewDoubt({ ...newDoubt, question: e.target.value })
                                    }
                                    placeholder="Describe your doubt in detail..."
                                    rows="5"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                    required
                                ></textarea>
                            </div>
                        </div>

                        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowPostDoubtModal(false);
                                    setNewDoubt({ topic: "", question: "" });
                                }}
                                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handlePostDoubt}
                                disabled={!newDoubt.topic || !newDoubt.question}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                <Send className="w-5 h-5" />
                                Post Doubt
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Answer Doubt Modal */}

            {showAnswerDoubtModal && selectedDoubt && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-gray-900">
                                Answer Doubt
                            </h3>
                            <button
                                onClick={() => {
                                    setShowAnswerDoubtModal(false);
                                    setSelectedDoubt(null);
                                    setDoubtAnswer("");
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Show the question */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                                        {selectedDoubt.topic}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        by {selectedDoubt.student_name}
                                    </span>
                                </div>
                                <p className="text-gray-900 font-medium">
                                    {selectedDoubt.question}
                                </p>
                            </div>

                            {/* Answer input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Answer
                                </label>
                                <textarea
                                    value={doubtAnswer}
                                    onChange={(e) => setDoubtAnswer(e.target.value)}
                                    placeholder="Write a detailed answer to help the student..."
                                    rows="6"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                    required
                                ></textarea>
                            </div>

                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-indigo-900">
                                        <p className="font-medium mb-1">Tips for good answers:</p>
                                        <ul className="space-y-1 text-indigo-700">
                                            <li>• Be clear and explain step-by-step</li>
                                            <li>• Provide examples if possible</li>
                                            <li>• Be encouraging and helpful</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowAnswerDoubtModal(false);
                                    setSelectedDoubt(null);
                                    setDoubtAnswer("");
                                }}
                                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAnswerDoubt}
                                disabled={!doubtAnswer.trim()}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                <Send className="w-5 h-5" />
                                Post Answer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload File Modal */}
            {showUploadFileModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
                        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-normal text-gray-900">Upload File</h3>
                            <button
                                onClick={() => {
                                    setShowUploadFileModal(false);
                                    setSelectedFile(null);
                                    setFileDescription('');
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select File *
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
                                    <input
                                        type="file"
                                        onChange={(e) => setSelectedFile(e.target.files[0])}
                                        className="hidden"
                                        id="file-upload"
                                        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-sm text-gray-600 mb-1">
                                            {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            PDF, Images, Documents, Archives (Max 50MB)
                                        </p>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={fileDescription}
                                    onChange={(e) => setFileDescription(e.target.value)}
                                    placeholder="Add a description for this file..."
                                    rows="3"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                ></textarea>
                            </div>
                        </div>

                        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowUploadFileModal(false);
                                    setSelectedFile(null);
                                    setFileDescription('');
                                }}
                                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUploadFile}
                                disabled={!selectedFile || loading}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                <Upload className="w-5 h-5" />
                                Upload File
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showSubmissionsModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="border-b px-6 py-4 flex items-center justify-between">
                            <h3 className="text-xl font-normal text-gray-900">Submissions</h3>
                            <button onClick={() => setShowSubmissionsModal(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-3">
                            {selectedSubmissions.length === 0 ? (
                                <p className="text-gray-500 text-center">No submissions yet</p>
                            ) : (
                                selectedSubmissions.map((sub) => (
                                    <div key={sub.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium">{sub.full_name}</p>
                                            <p className="text-sm text-gray-500">{sub.email}</p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(sub.submitted_at).toLocaleString()}
                                            </p>
                                        </div>

                                        <a
                                            href={`${(process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '')}/uploads/submissions/${sub.file_path}`}
                                            download
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download PDF
                                        </a>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Question Papers Modal */}
            {showQuestionPapersModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="border-b px-6 py-4 flex items-center justify-between flex-shrink-0">
                            <h3 className="text-2xl font-normal text-gray-900">📚 Question Papers</h3>
                            <button
                                onClick={() => {
                                    setShowQuestionPapersModal(false);
                                    setQPFilter({});
                                    setQPSearch('');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="px-6 py-4 border-b bg-gray-50 flex-shrink-0">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <select
                                    value={qpFilter.course || ''}
                                    onChange={(e) => setQPFilter({ ...qpFilter, course: e.target.value })}
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">All Courses</option>
                                    <option value="btech-cse">B.Tech CSE</option>
                                    <option value="btech-civil">B.Tech Civil</option>
                                    <option value="btech-mechanical">B.Tech Mechanical</option>
                                    <option value="btech-electrical">B.Tech Electrical</option>
                                    <option value="btech-ece">B.Tech ECE</option>
                                    <option value="btech-it">B.Tech IT</option>
                                    <option value="bba">BBA</option>
                                    <option value="bca">BCA</option>
                                    <option value="mba">MBA</option>
                                    <option value="mca">MCA</option>
                                </select>

                                {qpFilter.course?.startsWith('btech') && (
                                    <select
                                        value={qpFilter.semester || ''}
                                        onChange={(e) => setQPFilter({ ...qpFilter, semester: e.target.value })}
                                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">All Semesters</option>
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                            <option key={sem} value={`semester-${sem}`}>Semester {sem}</option>
                                        ))}
                                    </select>
                                )}

                                {qpFilter.course === 'bba' && (
                                    <select
                                        value={qpFilter.year || ''}
                                        onChange={(e) => setQPFilter({ ...qpFilter, year: e.target.value })}
                                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">All Years</option>
                                        <option value="year-1">Year 1</option>
                                        <option value="year-2">Year 2</option>
                                        <option value="year-3">Year 3</option>
                                    </select>
                                )}

                                <input
                                    type="text"
                                    placeholder="Search by subject..."
                                    value={qpSearch}
                                    onChange={(e) => setQPSearch(e.target.value)}
                                    className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />

                                <button
                                    onClick={async () => {
                                        try {
                                            const res = await questionPaperAPI.getAll({ ...qpFilter, search: qpSearch });
                                            setQuestionPapers(res.data.papers);
                                        } catch (error) {
                                            console.error('Error fetching papers:', error);
                                        }
                                    }}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
                                >
                                    <Search className="w-4 h-4" />
                                    Search
                                </button>
                            </div>
                        </div>

                        {/* Papers List */}
                        <div className="p-6 overflow-y-auto flex-1">
                            {questionPapers.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p>No question papers found</p>
                                    <p className="text-sm mt-2">Try adjusting your filters</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {questionPapers.map((paper) => (
                                        <div key={paper.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-start gap-3">
                                                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <FileText className="w-6 h-6 text-red-600" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900 truncate">{paper.title}</h4>
                                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                                                            {paper.course.replace('btech-', 'B.Tech ').replace('bba', 'BBA').toUpperCase()}
                                                        </span>
                                                        {paper.semester && (
                                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                                                {paper.semester.replace('-', ' ')}
                                                            </span>
                                                        )}
                                                        {paper.year && (
                                                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                                                                {paper.year.replace('-', ' ')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {paper.subject && (
                                                        <p className="text-sm text-gray-600 mt-1 truncate">{paper.subject}</p>
                                                    )}
                                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                                                        <span>{paper.year || 'N/A'}</span>
                                                        <span>•</span>
                                                        <span>{paper.download_count || 0} downloads</span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            const res = await questionPaperAPI.download(paper.id);
                                                            const url = window.URL.createObjectURL(new Blob([res.data]));
                                                            const link = document.createElement('a');
                                                            link.href = url;
                                                            link.setAttribute('download', paper.title);
                                                            document.body.appendChild(link);
                                                            link.click();
                                                            link.remove();
                                                        } catch (error) {
                                                            toast.error('Download failed');
                                                        }
                                                    }}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
        </div>
    );
}
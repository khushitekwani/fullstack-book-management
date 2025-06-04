"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  fetchAllBooksUser,
  updateBookProgress,
  fetchAllClubs,
  joinClub,
  leaveClub,
  getAllBooks,
  getDiscussions,
  createDiscussion,
  addReplyToDiscussion,
  likeDiscussionReply,
} from "../api/apiHandler";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Heart, MessageSquare, ThumbsUp } from "lucide-react";
import {
  FiMenu,
  FiLogOut,
  FiUser,
  FiShoppingBag,
  FiPackage,
} from "react-icons/fi";

const progressOptions = ["not-started", "reading", "completed"];
const defaultPercentages = {
  "not-started": 0,
  reading: 50,
  completed: 100,
};

const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  book: Yup.string().required("Book is required"),
  content: Yup.string()
    .min(10, "Content must be at least 10 characters")
    .required("Content is required"),
});

const ReplySection = ({
  discussion_id,
  replies,
  onReply,
  onLike,
  onComment,
}) => {
  const [comment, setComment] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [commentingOnReplyId, setCommentingOnReplyId] = useState(null);
  const [commentText, setCommentText] = useState("");

  const handleSubmitReply = async () => {
    if (!comment.trim()) return;
    try {
      setReplyLoading(true);
      await onReply(discussion_id, comment);
      setComment("");
    } catch (error) {
      console.error("Reply submission error:", error);
    } finally {
      setReplyLoading(false);
    }
  };

  const handleSubmitComment = async (replyId) => {
    if (!commentText.trim()) return;

    try {
      await onComment(discussion_id, replyId, commentText);
      setCommentText("");
      setCommentingOnReplyId(null);
    } catch (error) {
      console.error("Comment submission error:", error);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex gap-2">
        <input
          placeholder="Write a reply..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={replyLoading}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleSubmitReply}
          disabled={!comment.trim() || replyLoading}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {replyLoading ? "Sending..." : "Reply"}
        </button>
      </div>

      {replies && replies.length > 0 ? (
        <div className="space-y-4">
          {replies.map((reply) => (
            <div
              key={reply.id}
              className="border-l-4 border-gray-200 pl-4 space-y-2 mt-4"
            >
              <div className="flex justify-between">
                <p className="text-gray-800">{reply.text}</p>
                <span className="text-xs text-gray-500">
                  {new Date(reply.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-600">
                <button
                  onClick={() => onLike(discussion_id, reply.id)}
                  className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                >
                  <ThumbsUp size={14} /> {reply.likes || 0}
                </button>
                <button
                  onClick={() =>
                    setCommentingOnReplyId(
                      commentingOnReplyId === reply.id ? null : reply.id
                    )
                  }
                  className="text-blue-500 hover:underline"
                >
                  {commentingOnReplyId === reply.id ? "Cancel" : "Comment"}
                </button>
              </div>

              {commentingOnReplyId === reply.id && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                  <button
                    onClick={() => handleSubmitComment(reply.id)}
                    disabled={!commentText.trim()}
                    className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Post
                  </button>
                </div>
              )}

              {reply.comments && reply.comments.length > 0 && (
                <div className="pl-4 mt-2 space-y-2 text-sm text-gray-700 border-l border-gray-200">
                  {reply.comments.map((comment) => (
                    <div key={comment.id} className="py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">
                            {comment.commenter_name || "User"}:
                          </p>
                          <p className="text-gray-800">{comment.text}</p>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => onLike(discussion_id, comment.id)}
                          className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                        >
                          <ThumbsUp size={14} /> {comment.likes || 0}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm italic mt-2">Reply here</p>
      )}
    </div>
  );
};

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("progress");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [clubs, setClubs] = useState([]);
  const [processingClubId, setProcessingClubId] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchInitialData = async () => {
      try {
        setLoading(true);

        const booksResponse = await getAllBooks();
        setBooks(booksResponse.data || []);

        const discussionsResponse = await getDiscussions();

        const formattedDiscussions =
          discussionsResponse.data?.map((discussion) => ({
            id: discussion.discussion_id,
            title: discussion.title,
            content: discussion.content,
            created_at: discussion.created_at,
            name: discussion.user.name,
            replies: [],
            comments_by_user:
              discussion.comments_by_user?.map((comment) => ({
                ...comment,
                likes: comment.likes || 0,
              })) || [],
          })) || [];

        setDiscussions(formattedDiscussions);

        await loadClubs();
        await loadBooks();

        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
        setError("Failed to load data. Please try again later.");
        setLoading(false);
      }
    };

    fetchInitialData();
    loadBooks();
    loadClubs();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const res = await fetchAllBooksUser();
      if (res.code === "1") {
        setBooks(res.data);
      } else {
        setBooks([]);
      }
    } catch (err) {
      console.error("Error fetching books:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadClubs = async () => {
    setLoading(true);
    try {
      const response = await fetchAllClubs();
      const clubList = response.data || [];
      setClubs(clubList);
    } catch (error) {
      console.error("Failed to load clubs:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookState = async (book_id, newProgress, newPercentage) => {
    const book = books.find((b) => b.id === book_id);
    if (!book) return;

    const currentProgress = book.book_progress || "not-started";
    const currentPercentage = book.completion_percentage || 0;

    let finalProgress = currentProgress;
    let finalPercentage = currentPercentage;

    if (newPercentage !== undefined && newPercentage !== null) {
      const parsed = parseInt(newPercentage);
      if (isNaN(parsed) || parsed < 0 || parsed > 100) return;
      finalPercentage = parsed;

      if (parsed === 0) {
        finalProgress = "not-started";
      } else if (parsed === 100) {
        finalProgress = "completed";
      } else {
        finalProgress = "reading";
      }

      if (
        progressOptions.indexOf(finalProgress) <
        progressOptions.indexOf(currentProgress)
      ) {
        alert("Cannot revert progress.");
        return;
      }
    } else if (newProgress !== undefined && newProgress !== null) {
      if (
        progressOptions.indexOf(newProgress) <
        progressOptions.indexOf(currentProgress)
      ) {
        alert("Cannot revert progress.");
        return;
      }

      finalProgress = newProgress;
      finalPercentage = defaultPercentages[newProgress];
    }

    setUpdatingProgress(true);
    try {
      await updateBookProgress(book_id, finalProgress, finalPercentage);
      setBooks((prev) =>
        prev.map((b) =>
          b.id === book_id
            ? {
                ...b,
                book_progress: finalProgress,
                completion_percentage: finalPercentage,
              }
            : b
        )
      );

      if (selectedBook?.id === book_id) {
        setSelectedBook((prev) => ({
          ...prev,
          book_progress: finalProgress,
          completion_percentage: finalPercentage,
        }));
      }
    } catch (err) {
      console.error("Failed to update:", err);
    } finally {
      setUpdatingProgress(false);
    }
  };

  const filteredBooks = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return books.filter((book) => {
      const matchSearch =
        book.title?.toLowerCase()?.includes(query) ||
        book.author?.toLowerCase()?.includes(query) ||
        book.genre?.toLowerCase()?.includes(query);

      const matchStatus =
        filterStatus === "All" ||
        (book.book_progress || "not-started") === filterStatus;

      return matchSearch && matchStatus;
    });
  }, [books, searchQuery, filterStatus]);

  const bookStats = useMemo(() => {
    const stats = {
      total: books.length,
      "not-started": 0,
      reading: 0,
      completed: 0,
      avgCompletion: 0,
    };

    if (books.length === 0) return stats;

    let totalPercent = 0;

    books.forEach((book) => {
      const progress = book.book_progress || "not-started";
      stats[progress]++;
      totalPercent += book.completion_percentage || 0;
    }); 

    stats.avgCompletion = Math.round(totalPercent / books.length);
    return stats;
  }, [books]);

  const handleJoinClub = async (club_id) => {
    setProcessingClubId(club_id);
    try {
      await joinClub(club_id);
      setClubs((prevClubs) =>
        prevClubs.map((club) =>
          club.id === club_id
            ? {
                ...club,
                is_joined: true,
                active_members: (club.active_members || 0) + 1,
              }
            : club
        )
      );
    } catch (error) {
      console.error("Join club failed:", error);
    } finally {
      setProcessingClubId(null);
    }
  };

  const handleLeaveClub = async (club_id) => {
    setProcessingClubId(club_id);
    try {
      await leaveClub(club_id);
      setClubs((prevClubs) =>
        prevClubs.map((club) =>
          club.id === club_id
            ? {
                ...club,
                is_joined: false,
                active_members: Math.max((club.active_members || 1) - 1, 0),
              }
            : club
        )
      );
    } catch (error) {
      console.error("Leave club failed:", error);
    } finally {
      setProcessingClubId(null);
    }
  };

  const formik = useFormik({
    initialValues: {
      title: "",
      book: "",
      content: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm, setSubmitting, setErrors }) => {
      try {
        setSubmitting(true);
        const response = await createDiscussion(values);

       const newDiscussion = {
          id: response.data.discussion_id || response.data.id,
          title: response.data.title,
          content: response.data.content,
          created_at: response.data.created_at,
          name: response.data.user?.name || "You",
          replies: [],
          comments_by_user: [],
        };

         setDiscussions((prevDiscussions) => [
          newDiscussion,
          ...prevDiscussions,
        ]);
        resetForm();
      } catch (error) {
        console.error("Failed to create discussion", error);
        setErrors(error.response?.data?.errors || {});
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleAddReply = async (discussion_id, comment) => {
    try {
      const user_id = localStorage.getItem("userId"); 
      const response = await addReplyToDiscussion(
        discussion_id,
        user_id,
        comment
      );

      
      const newReply = {
        id: response.data.id || Date.now(),
        text: comment, 
        created_at: new Date().toISOString(),
        likes: 0,
        comments: [],
      };

      
      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === discussion_id
            ? {
                ...d,
                replies: [...(d.replies || []), newReply],
              }
            : d
        )
      );
    } catch (error) {
      console.error("Failed to add reply", error);
      setError("Failed to add reply. Please try again.");
    }
  };

  const handleLikeReply = async (discussion_id, comment_id) => {
    try {
      const currentDiscussion = discussions.find((d) => d.id === discussion_id);
      const currentReply = currentDiscussion?.replies?.find(
        (r) => r.id === comment_id
      );
      const currentlyLiked = currentReply?.is_liked;

      const response = await likeDiscussionReply(comment_id, !currentlyLiked); 

      setDiscussions((prev) =>
        prev.map((d) =>
          d.id === discussion_id
            ? {
                ...d,
                replies: (d.replies || []).map((r) =>
                  r.id === comment_id
                    ? {
                        ...r,
                        is_liked: !currentlyLiked,
                        likes: currentlyLiked ? r.likes - 1 : r.likes + 1,
                      }
                    : r
                ),
              }
            : d
        )
      );
    } catch (error) {
      
      console.error("Failed to like reply", error);
      setError("Failed to like reply. Please try again.");
    }
  };

  const handleLikeComment = async (discussion_id, comment_id) => {
    try {
      const response = await likeDiscussionReply(discussion_id, comment_id);
      if (response.code === "1") {
        setDiscussions((prev) =>
          prev.map((d) =>
            d.id === discussion_id
              ? {
                  ...d,
                  comments_by_user: (d.comments_by_user || []).map((c) =>
                    c.comment_id === comment_id
                      ? { ...c, likes: (c.likes || 0) + 1 }
                      : c
                  ),
                }
              : d
          )
        );
      } else {
        console.error("Failed to like comment:", response.message);
        setError(response.message || "Failed to like comment");
      }
    } catch (error) {
      console.error("Failed to like comment", error);
      setError("Failed to like comment. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    router.push("/login");
  };

  const filteredDiscussion =
    filter === "All"
      ? discussions
      : discussions.filter((d) => d.book_id === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-indigo-800 text-white transition-all duration-300 flex flex-col justify-between ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div>
          <div className="flex items-center justify-between p-4 border-b border-indigo-700">
            <h2
              className={`text-xl font-bold transition-opacity duration-300 ${
                sidebarOpen ? "opacity-100" : "opacity-0 hidden"
              }`}
            >
              My Dashboard
            </h2>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white text-xl"
            >
              <FiMenu />
            </button>
          </div>
          <nav className="mt-4">
            <button
              onClick={() => setActiveTab("progress")}
              className={`flex items-center gap-3 w-full text-left px-6 py-3 hover:bg-indigo-700 ${
                activeTab === "progress" ? "bg-indigo-700" : ""
              }`}
            >
              <FiUser />
              {sidebarOpen && "Progress"}
            </button>

            <button
              onClick={() => setActiveTab("clubs")}
              className={`flex items-center gap-3 w-full text-left px-6 py-3 hover:bg-indigo-700 ${
                activeTab === "clubs" ? "bg-indigo-700" : ""
              }`}
            >
              <FiShoppingBag />
              {sidebarOpen && "Clubs"}
            </button>

            <button
              onClick={() => setActiveTab("Discussions")}
              className={`flex items-center gap-3 w-full text-left px-6 py-3 hover:bg-indigo-700 ${
                activeTab === "Discussions" ? "bg-indigo-700" : ""
              }`}
            >
              <FiPackage />
              {sidebarOpen && "My Discussions"}
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-indigo-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full bg-red-600 hover:bg-red-700 py-2 px-4 rounded"
          >
            <FiLogOut />
            {sidebarOpen && "Logout"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {activeTab === "progress" && (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">All Books</h1>

            {/* 📊 Stats Summary */}
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h2 className="text-xl font-semibold mb-2">Progress Summary</h2>
              <p>Total Books: {bookStats.total}</p>
              <p>Not Started: {bookStats["not-started"]}</p>
              <p>Reading: {bookStats.reading}</p>
              <p>Completed: {bookStats.completed}</p>
              <p>
                Average Completion:{" "}
                <span className="text-indigo-600 font-semibold">
                  {bookStats.avgCompletion}%
                </span>
              </p>
              <progress
                value={bookStats.avgCompletion}
                max="100"
                className="w-full h-3 mt-2"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Search by title, author, or genre"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="p-2 border rounded w-full md:w-1/2"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="p-2 border rounded w-full md:w-1/4"
              >
                <option value="All">All Statuses</option>
                {progressOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Book Cards */}
            {loading ? (
              <p>Loading books...</p>
            ) : filteredBooks.length === 0 ? (
              <p>No books found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book, index) => {
                  const uniqueKey = `book-${book.id}-${index}-${
                    book.title
                      ? book.title.substring(0, 10).replace(/\s/g, "")
                      : "untitled"
                  }`;

                  return (
                    <div
                      key={uniqueKey}
                      className="bg-white rounded-lg shadow p-4 border"
                    >
                      <h3 className="text-xl font-semibold">{book.title}</h3>
                      <p className="text-sm text-gray-500">by {book.author}</p>
                      {book.genre && (
                        <p className="text-xs text-gray-400 mt-1">
                          Genre: {book.genre}
                        </p>
                      )}

                      <p className="mt-2 text-sm">
                        <strong>Progress:</strong>{" "}
                        <span className="text-blue-600">
                          {book.book_progress || "not-started"}
                        </span>
                      </p>

                      <progress
                        value={book.completion_percentage || 0}
                        max="100"
                        className="w-full h-3 mt-1 mb-2"
                      ></progress>

                      <div className="flex items-center mb-2">
                        <label className="text-sm mr-2">
                          <strong>Completed:</strong>
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={book.completion_percentage || 0}
                          onChange={(e) =>
                            updateBookState(book.id, null, e.target.value)
                          }
                          className="border rounded p-1 w-16 text-sm"
                          disabled={updatingProgress}
                        />
                        <span className="text-sm ml-1">%</span>
                      </div>

                      <select
                        value={book.book_progress || "not-started"}
                        onChange={(e) =>
                          updateBookState(book.id, e.target.value, null)
                        }
                        className="w-full mt-2 p-2 border rounded"
                        disabled={updatingProgress}
                      >
                        {progressOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => setSelectedBook(book)}
                        className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition w-full"
                      >
                        View Details
                      </button>

                      {book.club_id && (
                        <button
                          onClick={() => handleLeaveClub(book.club_id)}
                          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition w-full"
                        >
                          Leave Club
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Book Detail Modal */}
            {selectedBook && (
              <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg w-full max-w-lg relative">
                  <button
                    className="absolute top-2 right-3 text-gray-500 text-xl"
                    onClick={() => setSelectedBook(null)}
                  >
                    ×
                  </button>
                  <h2 className="text-2xl font-bold mb-2">
                    {selectedBook.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-2">
                    Author: {selectedBook.author}
                  </p>
                  {selectedBook.genre && (
                    <p className="text-sm text-gray-400 mb-2">
                      Genre: {selectedBook.genre}
                    </p>
                  )}
                  <p className="mb-4">{selectedBook.description}</p>

                  <h4 className="font-semibold mb-1">Reviews:</h4>
                  <ul className="list-disc list-inside text-sm mb-4 max-h-32 overflow-y-auto">
                    {selectedBook.reviews?.length > 0 ? (
                      selectedBook.reviews.map((rev, i) => (
                        <li key={i}>{rev}</li>
                      ))
                    ) : (
                      <li>No reviews yet.</li>
                    )}
                  </ul>

                  <div className="flex items-center mb-2">
                    <label className="font-medium mr-2">Completion %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={selectedBook.completion_percentage || 0}
                      onChange={(e) =>
                        updateBookState(selectedBook.id, null, e.target.value)
                      }
                      className="border rounded p-2 w-20"
                      disabled={updatingProgress}
                    />
                    <span className="ml-1">%</span>
                  </div>

                  <progress
                    value={selectedBook.completion_percentage || 0}
                    max="100"
                    className="w-full h-3 mb-3"
                  ></progress>

                  <label className="font-medium block mt-4">
                    Update Progress:
                  </label>
                  <select
                    value={selectedBook.book_progress || "not-started"}
                    onChange={(e) =>
                      updateBookState(selectedBook.id, e.target.value, null)
                    }
                    className="w-full mt-2 p-2 border rounded"
                    disabled={updatingProgress}
                  >
                    {progressOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "clubs" && (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">All Clubs</h1>

            {loading ? (
              <p>Loading clubs...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clubs.map((club) => {
                  const isProcessing = processingClubId === club.id;

                  return (
                    <div
                      key={club.id}
                      className="bg-white shadow-md rounded-lg p-4 border"
                    >
                      <h3 className="text-xl font-semibold mb-2">
                        {club.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Active Members: {club.active_members || 0}
                      </p>

                      {club.is_joined && (
                        <p className="text-green-600 text-sm mt-2 font-medium">
                          You are a member of this club
                        </p>
                      )}

                      <button
                        onClick={() =>
                          club.is_joined
                            ? handleLeaveClub(club.id)
                            : handleJoinClub(club.id)
                        }
                        className={`mt-4 w-full ${
                          club.is_joined
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        } text-white font-medium py-2 px-4 rounded-lg transition duration-300`}
                        disabled={isProcessing}
                      >
                        {isProcessing
                          ? club.is_joined
                            ? "Leaving..."
                            : "Joining..."
                          : club.is_joined
                          ? "Leave Club"
                          : "Join Club"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "Discussions" && (
          <div className="p-6 max-w-5xl mx-auto space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md mb-4">
                {error}
                <button
                  className="ml-4 text-red-900 underline"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </button>
              </div>
            )}

            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Create Discussion</h2>

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                <div>
                  <input
                    id="title"
                    name="title"
                    placeholder="Discussion Title"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    disabled={formik.isSubmitting}
                    className="w-full p-2 border rounded"
                  />
                  {formik.errors.title && formik.touched.title && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.title}
                    </p>
                  )}
                </div>

                <div>
                  <select
                    id="book"
                    name="book"
                    value={formik.values.book}
                    onChange={formik.handleChange}
                    disabled={formik.isSubmitting}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select a Book</option>
                    {books.map((book) => (
                      <option key={book.id} value={book.title}>
                        {book.title}
                      </option>
                    ))}
                  </select>
                  {formik.errors.book && formik.touched.book && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.book}
                    </p>
                  )}
                </div>

                <div>
                  <textarea
                    id="content"
                    name="content"
                    placeholder="What's on your mind?"
                    value={formik.values.content}
                    onChange={formik.handleChange}
                    disabled={formik.isSubmitting}
                    className="w-full p-2 border rounded h-32"
                  />
                  {formik.errors.content && formik.touched.content && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.content}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={formik.isSubmitting || !formik.isValid}
                  className="bg-blue-500 text-white p-2 rounded w-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {formik.isSubmitting ? "Posting..." : "Post Discussion"}
                </button>
              </form>
            </div>

            <div className="flex justify-between items-center flex-wrap">
              <h3 className="text-xl font-semibold">Discussions</h3>
              <div className="flex gap-2 flex-wrap mt-2 sm:mt-0">
                <button
                  onClick={() => setFilter("All")}
                  className={`py-1 px-3 rounded ${
                    filter === "All" ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
                >
                  All
                </button>
                {books.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => setFilter(book.title)}
                    className={`py-1 px-3 rounded ${
                      filter === book.title
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {book.title}
                  </button>
                ))}
              </div>
            </div>

            {filteredDiscussion.length === 0 ? (
              <div className="bg-white shadow-md rounded-lg p-6 text-center text-gray-500">
                No discussions found. Be the first to start a discussion!
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDiscussion.map((discussion) => (
                  <div
                    key={discussion.id}
                    className="bg-white shadow-md rounded-lg p-6 mb-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-bold">
                          {discussion.title}
                        </h4>
                        <span className="text-sm text-gray-500 block mt-1">
                          {"Created at - "}
                          {new Date(discussion.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-500 block mt-1">
                          {" Posted by - "}
                          {discussion.name}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <MessageSquare size={14} />{" "}
                        {discussion.comments_by_user[0]?.comments_count || 0}
                      </span>
                    </div>

                    <p className="mt-3 text-gray-700">{discussion.content}</p>

                    {/* Display comments with like buttons */}
                    {discussion.comments_by_user &&
                      discussion.comments_by_user.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h5 className="font-medium mb-2">Comments</h5>
                          {discussion.comments_by_user.map((comment) => (
                            <div
                              key={comment.comment_id}
                              className="pl-4 border-l-2 border-gray-200 my-2 py-1 text-gray-700"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold">
                                    {comment.commenter_name}:
                                  </p>
                                  <p>{comment.comment}</p>
                                </div>
                                <button
                                  onClick={() =>
                                    handleLikeComment(
                                      discussion.id,
                                      comment.comment_id
                                    )
                                  }
                                  className="flex items-center gap-1 text-sm hover:text-blue-500 transition-colors"
                                >
                                  <Heart size={14} /> {comment.likes || 0}
                                </button>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(
                                  comment.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                    <ReplySection
                      discussion_id={discussion.id}
                      replies={discussion.replies || []}
                      onReply={handleAddReply}
                      onLike={handleLikeReply}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

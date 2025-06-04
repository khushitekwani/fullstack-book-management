"use client";
import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ThumbsUp, MessageSquare, Heart } from "lucide-react";
import {
  getAllBooks,
  getDiscussions,
  createDiscussion,
  addReplyToDiscussion,
  likeDiscussionReply,
} from "../api/apiHandler";
import Swal from "sweetalert2";

const validationSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  book: Yup.string().required("Book is required"),
  content: Yup.string()
    .min(10, "Content must be at least 10 characters")
    .required("Content is required"),
});

const DiscussionForum = () => {
  const [discussions, setDiscussions] = useState([]);
  const [filter, setFilter] = useState("All");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch books and discussions from the API
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Fetch books
        const booksResponse = await getAllBooks();
        setBooks(booksResponse.data || []);

        // Fetch discussions
        const discussionsResponse = await getDiscussions();

        // Transform the API response to match our component's expected format
        const formattedDiscussions =
          discussionsResponse.data?.map((discussion) => ({
            id: discussion.discussion_id,
            title: discussion.title,
            content: discussion.content,
            created_at: discussion.created_at,
            name: discussion.user.name,
            replies: [],
            // Map comments to replies format if needed
            comments_by_user: discussion.comments_by_user?.map(comment => ({
              ...comment,
              likes: comment.likes || 0
            })) || [],
          })) || [];

        setDiscussions(formattedDiscussions);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch initial data", error);
        setError("Failed to load data. Please try again later.");
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

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

        // Format the response to match our component's expected structure
        const newDiscussion = {
          id: response.data.discussion_id || response.data.id,
          title: response.data.title,
          content: response.data.content,
          created_at: response.data.created_at,
          name: response.data.user?.name || "You",
          replies: [],
          comments_by_user: [],
        };

        // Add the new discussion to the state
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
      // Assuming you have the user_id available in your component
      // You might need to get this from your authentication context or state
      const user_id = localStorage.getItem('user_id'); // Or however you're storing the user ID
      
      const response = await addReplyToDiscussion(discussion_id, user_id, comment);
  
      console.log("Add reply response:", response);
  
      // Format the reply to match our component's expected structure
      const newReply = {
        id: response.data.id || Date.now(),
        text: comment, // Make sure this property name matches what's used in your render
        created_at: new Date().toISOString(),
        likes: 0,
        comments: [],
      };
  
      // Update the discussions state with the new reply
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
      // Get the current like status
      const currentDiscussion = discussions.find(d => d.id === discussion_id);
      const currentReply = currentDiscussion?.replies?.find(r => r.id === comment_id);
      const currentlyLiked = currentReply?.is_liked;
  
      // Toggle like status
      const response = await likeDiscussionReply(comment_id, !currentlyLiked); // pass new state
  
      // Update state
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
  
  // Handle liking a comment
  const handleLikeComment = async (discussion_id, comment_id) => {
    try {
      // Make API call to like the comment - using the same likeDiscussionReply function
      // You can reuse likeDiscussionReply if it works the same way for comments
      const response = await likeDiscussionReply(discussion_id, comment_id);
      if(response.code==='1'){
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
      }else{
        Swal.fire
        ({
          icon: 'error',
          title: 'Oops...',
          text: response.message,
          confirmButtonText: 'OK'
        });
      }
     
    } catch (error) {
      console.error("Failed to like comment", error);
      setError("Failed to like comment. Please try again.");
    }
  };

  const filteredDiscussion =
    filter === "All"
      ? discussions
      : discussions.filter((d) => d.book === filter);

  if (loading) return <div className="p-6 text-center">Loading data...</div>;

  return (
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
              <p className="text-red-500 text-sm mt-1">{formik.errors.title}</p>
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
              <p className="text-red-500 text-sm mt-1">{formik.errors.book}</p>
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
                filter === book.title ? "bg-blue-500 text-white" : "bg-gray-200"
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
                  <h4 className="text-lg font-bold">{discussion.title}</h4>
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
                            onClick={() => handleLikeComment(discussion.id, comment.comment_id)}
                            className="flex items-center gap-1 text-sm hover:text-blue-500 transition-colors"
                          >
                            <Heart size={14} /> {comment.likes || 0}
                          </button>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()}
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
  );
};

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

      {replies.length > 0 ? (
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
                  onClick={() => setCommentingOnReplyId(commentingOnReplyId === reply.id ? null : reply.id)}
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
                          <p className="font-semibold">{comment.commenter_name || "User"}:</p>
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
        <p className="text-gray-500 text-sm italic mt-2">
          Reply here
        </p>
      )}
    </div>
  );
};

export default DiscussionForum;

"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getDiscussionById } from "@/app/api/apiHandler";
import { useParams } from "next/navigation";

const DiscussionDetails = () => {
  const params = useParams();
  const id = params.id;
  
  const [discussion, setDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchDiscussion();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchDiscussion = async () => {
    try {
      const res = await getDiscussionById({ discussion_id: id });
      console.log("Discussion response:", res);
      if (res.code === "1") {
        // Based on the response structure, we need to properly handle the data
        setDiscussion(res.data);
      } else {
        setError("Failed to load discussion");
      }
    } catch (err) {
      console.error("Error fetching discussion:", err);
      setError("An error occurred while loading the discussion");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-600">Loading discussion...</div>;
  }

  if (error || !discussion) {
    return <div className="p-4 text-red-600">{error || "Discussion not found"}</div>;
  }
  
  // The discussion data is directly in the response, not nested
  const main = discussion;
  const chats = discussion.chats || [];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link href="/dashboard-admin">
        <span className="text-blue-600 hover:underline mb-4 block">
          Back to discussions
        </span>
      </Link>

      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">{main.title}</h1>
        <div className="flex items-center text-sm text-gray-600 mb-3 space-x-3">
          <img
            className="h-8 w-8 rounded-full"
            src={main.user_avatar || "/images/default-avatar.jpg"}
            alt="User"
          />
          <span>Posted by {main.user_name}</span>
          <span>•</span>
          <span>{new Date(main.created_at).toLocaleDateString()}</span>
        </div>
        <div className="mb-3 space-x-2">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Book: {main.book_title}
          </span>
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
            {chats?.length || 0} replies
          </span>
        </div>
        <p className="text-gray-700 mb-6">{main.content}</p>

        <h2 className="text-lg font-semibold mb-3">Replies</h2>
        {!chats || chats.length === 0 ? (
          <div className="text-gray-500">No replies yet.</div>
        ) : (
          <div className="space-y-4">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="border border-gray-200 rounded p-4 bg-gray-50"
              >
                <div className="flex items-center space-x-3 mb-1">
                  <img
                    className="h-6 w-6 rounded-full"
                    src={chat.avatar || "/images/default-avatar.jpg"}
                    alt="User"
                  />
                  <p className="text-sm font-medium">
                    {main.user_name}
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(chat.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-800">{chat.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionDetails;
"use client";
import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Link from "next/link";
import {
  FiMenu,
  FiLogOut,
  FiUsers,
  FiBook,
  FiMessageSquare,
  FiBarChart2,
} from "react-icons/fi";

import {
  fetchAllBooks,
  deleteBook,
  fetchAllMembers,
  updateUserRole,
  fetchAllDiscussions,
  moderateDiscussion,
  fetchStatistics,
  clubMemberListing,
  approveClubMember,
  removeClubMember,
} from "../api/apiHandler";

export default function DashboardAdmin() {
  const [activeTab, setActiveTab] = useState("books");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const [users, setUsers] = useState([]);

  // States
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statistics, setStatistics] = useState({
    total_members: 0,
    books_read: 0,
    completed_books: 0,
    discussions_created: 0,
  });

  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedBook, setSelectedBook] = useState("");
  const [sortOption, setSortOption] = useState("recent");

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

useEffect(() => {
  const loadUsers = async () => {
    try {
      const response = await fetchAllMembers();
      setUsers(response.data.users);
    } catch (error) {
      Swal.fire("Error", "Failed to load users", "error");
    }
  };

  loadUsers();
}, [fetchAllMembers]);


  const loadTabData = async (tab) => {
    setLoading(true);
    try {
      switch (tab) {
        case "books":
          await fetchBooks();
          break;
        case "members":
          await fetchMembers();
          break;
        case "clubMembersListing":
          await handlerClubMembersListing();
          break;
        case "discussions":
          await fetchDiscussionsList();
          break;
        case "statistics":
          await fetchStats();
          break;
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || `Failed to load ${tab}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const result = await fetchAllBooks();
      console.log(result);
      console.log(result.code);
      if (result.code === "1") {
        setBooks(result.data);
      } else {
        throw new Error(result.message || "Failed to load books");
      }
    } catch (error) {
      throw error;
    }
  };

  const fetchMembers = async () => {
    try {
      const result = await fetchAllMembers();
      if (result.code === "1") {
        setMembers(result.data);
      } else {
        throw new Error(result.message || "Failed to load members");
      }
    } catch (error) {
      throw error;
    }
  };

  const fetchDiscussionsList = async () => {
    try {
      const result = await fetchAllDiscussions();
      if (result.code === "1") {
        setDiscussions(result.data);
      } else {
        throw new Error(result.message || "Failed to load discussions");
      }
    } catch (error) {
      throw error;
    }
  };

  const fetchStats = async () => {
    try {
      const result = await fetchStatistics();
      console.log("result", result);
      if (result.code === "1") {
        setStatistics(result.data);
      } else {
        throw new Error(result.message || "Failed to load statistics");
      }
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteBook = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will remove the book and all associated discussions!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        performDeleteBook(id);
      }
    });
  };

  const performDeleteBook = async (id) => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const data = { book_id: id };
      const result = await deleteBook(data);
      if (result.code === "1") {
        setBooks((prev) => prev.filter((book) => book.id !== id));
        Swal.fire("Deleted!", result.message || "Book deleted.", "success");
      } else {
        throw new Error(result.message || "Failed to delete book");
      }
    } catch (error) {
      Swal.fire("Error", error.message || "Something went wrong", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewBook = (id) => {
    localStorage.setItem("ViewBookId", id);
    router.push("/bookDetails");
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const result = await updateUserRole({
        user_id: userId,
        new_role: newRole,
      });

      if (result.code === "1") {
        setUsers((prev = []) =>
          prev.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        );
        Swal.fire(
          "Success",
          `User role has been updated to ${newRole}.`,
          "success"
        );
        await fetchMembers();
      } else {
        throw new Error(
          result.data?.message?.keyword || "Failed to update user role"
        );
      }
    } catch (error) {
      Swal.fire("Error", error.message || "Something went wrong", "error");
    }
  };

  const handlerClubMembersListing = async () => {
    try {
      const result = await clubMemberListing();
      if (result?.code === "1") {
        setMembers(result.data);
      } else {
        throw new Error(result.message?.keyword || "Failed to load members");
      }
    } catch (error) {
      Swal.fire("Error", error.message || "Something went wrong", "error");
    }
  };

  const handleRemoveMember = (user_id, club_id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will remove the member from your book club!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove them!",
    }).then((result) => {
      if (result.isConfirmed) {
        performRemoveMember(user_id, club_id);
      }
    });
  };

  const performRemoveMember = async (user_id, club_id) => {
    try {
      const result = await removeClubMember(user_id, club_id);
      console.log("result", result);
      if (result.code === "1") {
        setMembers((prev) =>
          prev.filter(
            (member) =>
              !(member.user_id === user_id && member.club_id === club_id)
          )
        );
        Swal.fire(
          "Removed!",
          result.message?.keyword || "Member has been removed.",
          "success"
        );
      } else {
        throw new Error(result.message?.keyword || "Failed to remove member");
      }
    } catch (error) {
      console.error("Error in performRemoveMember:", error);
      Swal.fire("Error", error.message || "Something went wrong", "error");
    }
  };

  const handleApproveMember = (user_id, club_id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will approve the member for your book club!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove them!",
    }).then((result) => {
      if (result.isConfirmed) {
        performApproveMember(user_id, club_id);
      }
    });
  };

  const performApproveMember = async (user_id, club_id) => {
    try {
      const result = await approveClubMember(user_id, club_id);

      if (result.code === "1") {
        setMembers((prev) =>
          prev.filter(
            (member) =>
              !(member.user_id === user_id && member.club_id === club_id)
          )
        );
        Swal.fire(
          "Removed!",
          result.message || "Member has been approved.",
          "success"
        );
      } else {
        throw new Error(result.message || "Failed to approve member");
      }
    } catch (error) {
      console.error("Error in performApprovMember:", error);
      Swal.fire("Error", error.message || "Something went wrong", "error");
    }
  };

  const handleModerateDiscussion = async (discussionId, action) => {
    try {
      const result = await moderateDiscussion({
        discussion_id: discussionId,
        action,
      });
      if (result.code === "1") {
        setDiscussions((prev) =>
          prev.map((discussion) =>
            discussion.id === discussionId
              ? {
                  ...discussion,
                  status: action === "approve" ? "approved" : "hidden",
                }
              : discussion
          )
        );
        Swal.fire(
          "Success",
          `Discussion has been ${
            action === "approve" ? "approved" : "hidden"
          }.`,
          "success"
        );
      } else {
        throw new Error(result.message || "Failed to moderate discussion");
      }
    } catch (error) {
      Swal.fire("Error", error.message || "Something went wrong", "error");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const groupedClubs = Object.values(
    members.reduce((acc, item) => {
      if (!acc[item.club_id]) {
        acc[item.club_id] = {
          club_id: item.club_id,
          club_name: item.club_name,
          book_title: item.book_title,
          members: [],
        };
      }
      acc[item.club_id].members.push(item);
      return acc;
    }, {})
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`bg-gray-800 text-white transition-all duration-300 flex flex-col justify-between ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div>
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2
              className={`text-xl font-bold transition-opacity duration-300 ${
                sidebarOpen ? "opacity-100" : "opacity-0 hidden"
              }`}
            >
              Book Club Admin
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
              onClick={() => setActiveTab("books")}
              className={`flex items-center gap-3 w-full text-left px-6 py-3 hover:bg-gray-700 ${
                activeTab === "books" ? "bg-gray-700" : ""
              }`}
            >
              <FiBook />
              {sidebarOpen && "Book Management"}
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`flex items-center gap-3 w-full text-left px-6 py-3 hover:bg-gray-700 ${
                activeTab === "members" ? "bg-gray-700" : ""
              }`}
            >
              <FiUsers />
              {sidebarOpen && "Member Management"}
            </button>
            <button
              onClick={() => setActiveTab("discussions")}
              className={`flex items-center gap-3 w-full text-left px-6 py-3 hover:bg-gray-700 ${
                activeTab === "discussions" ? "bg-gray-700" : ""
              }`}
            >
              <FiMessageSquare />
              {sidebarOpen && "Discussions"}
            </button>
            <button
              onClick={() => setActiveTab("clubMembersListing")}
              className={`flex items-center gap-3 w-full text-left px-6 py-3 hover:bg-gray-700 ${
                activeTab === "clubMembersListing" ? "bg-gray-700" : ""
              }`}
            >
              <FiUsers />
              {sidebarOpen && "Club Members"}
            </button>

            <button
              onClick={() => setActiveTab("requestedMembers")}
              className={`flex items-center gap-3 w-full text-left px-6 py-3 hover:bg-gray-700 ${
                activeTab === "requestedMembers" ? "bg-gray-700" : ""
              }`}
            >
              <FiUsers />
              {sidebarOpen && "Requests"}
            </button>
            <button
              onClick={() => setActiveTab("statistics")}
              className={`flex items-center gap-3 w-full text-left px-6 py-3 hover:bg-gray-700 ${
                activeTab === "statistics" ? "bg-gray-700" : ""
              }`}
            >
              <FiBarChart2 />
              {sidebarOpen && "Statistics"}
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-gray-700">
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
        {/* Books Tab */}
        {activeTab === "books" && (
          <div>
            <div>
              <button
                onClick={() => router.push("/addBook")}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mb-4 ml-230"
              >
                Add New Book
              </button>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-2">Search Books</h3>
              <input
                type="text"
                placeholder="Search by title, author or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded"
              />
            </div>

            {Array.isArray(books) && books.length === 0 ? (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
                <p>No books found. Add your first book to start your club!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 gap-6">
                {books
                  .filter((book) => {
                    const query = searchQuery.toLowerCase();
                    return (
                      // Filter by title
                      book.title.toLowerCase().includes(query) ||
                      book.author.toLowerCase().includes(query) ||
                      (book.genres &&
                        book.genres
                          .split(",")
                          .some((genre) => genre.toLowerCase().includes(query)))
                    );
                  })
                  .map((book) => (
                    <div
                      key={book.id}
                      className="bg-white shadow-md rounded-xl overflow-hidden transition-transform transform hover:scale-105"
                    >
                      <img
                        src={
                          book.cover_image || "/images/default-book-cover.jpg"
                        }
                        alt={book.title}
                        className="h-5 "
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold truncate">
                          {book.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          by {book.author}
                        </p>
                        <p className="text-sm text-gray-500 truncate mt-1">
                          {book.description}
                        </p>

                        {book.genres && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {book.genres.split(",").map((genre, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full"
                              >
                                {genre.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* <div className="mt-3">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {book.readers_count || 0} readers
                          </span>
                        </div> */}

                        <div className="flex justify-between mt-4">
                          <button
                            onClick={() => handleViewBook(book.id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                            disabled={isDeleting}
                          >
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Member Management</h1>
            {members.length === 0 ? (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
                <p>No members found. Invite members to join your book club!</p>
              </div>
            ) : (
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Member
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Reading Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Books Read
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Discussions
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Role
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.map((member) => (
                      <tr key={member.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full"
                                src={
                                  member.avatar || "/images/default-avatar.jpg"
                                }
                                alt=""
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {member.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${
                                  member.reading_status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : member.reading_status === "reading"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                          >
                            {member.reading_status === "completed"
                              ? "Completed"
                              : member.reading_status === "reading"
                              ? "Reading"
                              : "Not Reading"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.books_read || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.discussion_count || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <select
                            value={member.user_role}
                            onChange={(e) =>
                              handleUpdateUserRole(member.id, e.target.value)
                            }
                            className="text-sm bg-gray-100 border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            <option value="user">User</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Club Members Listing Tab */}
        {activeTab === "clubMembersListing" && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Club Members Listing</h1>
            {groupedClubs.map((club) => (
              <div
                key={club.club_id}
                className="bg-white shadow-md rounded-lg p-6 border border-gray-200 mb-6"
              >
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {club.club_name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Book: <span className="italic">{club.book_title}</span>
                  </p>
                </div>

                {/* Active Members */}
                <h3 className="text-md font-semibold text-green-700 mb-2">
                  Approved Members
                </h3>
                {club.members.filter((m) => !m.is_deleted).length === 0 ? (
                  <p className="text-gray-500 italic mb-4">
                    No approved members yet.
                  </p>
                ) : (
                  club.members
                    .filter((member) => !member.is_deleted)
                    .map((member) => (
                      <div
                        key={member.user_id}
                        className="flex items-center gap-4 border-t pt-4"
                      >
                        <img
                          className="h-10 w-10 rounded-full"
                          src={member.avatar || "/images/default-avatar.jpg"}
                          alt="User avatar"
                        />
                        <div>
                          <p className="text-gray-900 font-medium">
                            {member.user_name}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {member.email || "No email available"}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <button
                            onClick={() =>
                              handleRemoveMember(member.user_id, club.club_id)
                            }
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))
                )}

                {/* Removed Members */}
                <h3 className="text-md font-semibold text-red-700 mt-6 mb-2">
                  Removed Members
                </h3>
                {club.members.filter((m) => m.is_deleted).length === 0 ? (
                  <p className="text-gray-500 italic">No removed members.</p>
                ) : (
                  club.members
                    .filter((member) => member.is_deleted)
                    .map((member) => (
                      <div
                        key={member.user_id}
                        className="flex items-center gap-4 border-t pt-4"
                      >
                        <img
                          className="h-10 w-10 rounded-full"
                          src={member.avatar || "/images/default-avatar.jpg"}
                          alt="User avatar"
                        />
                        <div>
                          <p className="text-gray-900 font-medium">
                            {member.user_name}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {member.email || "No email available"}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <button
                            onClick={() =>
                              handleApproveMember(member.user_id, club.club_id)
                            }
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "requestedMembers" && (
          <div>
            <h1 className="text-3xl font-bold mb-6">
              Pending Club Member Approvals
            </h1>
            {groupedClubs.map((club) => {
              const pendingMembers = club.members.filter(
                (m) => !m.is_approve && !m.is_deleted
              );

              return (
                <div
                  key={club.club_id}
                  className="bg-white shadow-md rounded-lg p-6 border border-gray-200 mb-6"
                >
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {club.club_name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      Book: <span className="italic">{club.book_title}</span>
                    </p>
                  </div>

                  {/* Pending Members */}
                  {pendingMembers.length === 0 ? (
                    <p className="text-gray-500 italic">
                      No members pending approval.
                    </p>
                  ) : (
                    pendingMembers.map((member) => (
                      <div
                        key={member.user_id}
                        className="flex items-center gap-4 border-t pt-4"
                      >
                        <img
                          className="h-10 w-10 rounded-full"
                          src={member.avatar || "/images/default-avatar.jpg"}
                          alt="User avatar"
                        />
                        <div>
                          <p className="text-gray-900 font-medium">
                            {member.user_name}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {member.email || "No email available"}
                          </p>
                        </div>
                        <div className="ml-auto">
                          <button
                            onClick={() =>
                              handleApproveMember(member.user_id, club.club_id)
                            }
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Discussions Tab */}
        {activeTab === "discussions" && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Discussion Management</h1>

            {/* Filters */}
            <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
              {/* Search */}
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded w-full sm:w-auto"
              />

              {/* Book filter */}
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded"
              >
                <option value="">All Books</option>
                {[...new Set(discussions.map((d) => d.book_title))].map(
                  (book) => (
                    <option key={book} value={book}>
                      {book}
                    </option>
                  )
                )}
              </select>

              {/* Sort */}
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {/* Discussion list */}
            {discussions.length === 0 ? (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded">
                <p>
                  No discussions found. Discussions will appear here once
                  members start them.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {discussions
                  .filter((discussion) => {
                    const query = searchQuery.toLowerCase();
                    return (
                      (!selectedBook ||
                        discussion.book_title === selectedBook) &&
                      (discussion.title.toLowerCase().includes(query) ||
                        discussion.created_at.toLowerCase().includes(query) ||
                        discussion.user_name.toLowerCase().includes(query))
                    );
                  })
                  .sort((a, b) =>
                    sortOption === "recent"
                      ? new Date(b.created_at) - new Date(a.created_at)
                      : new Date(a.created_at) - new Date(b.created_at)
                  )
                  .map((discussion) => (
                    <div
                      key={discussion.id}
                      className="bg-white shadow-md rounded-lg overflow-hidden p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold">
                            {discussion.title}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <img
                              className="h-6 w-6 rounded-full"
                              src={
                                discussion.user_avatar ||
                                "/images/default-avatar.jpg"
                              }
                              alt=""
                            />
                            <p className="text-sm text-gray-600">
                              Posted by {discussion.user_name}
                            </p>
                            <span className="text-xs text-gray-500">
                              {new Date(
                                discussion.created_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="mt-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Book: {discussion.book_title}
                            </span>
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full ml-2">
                              {discussion.replies_count || 0} replies
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-3">
                            {discussion.content}
                          </p>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <Link
                            href={`/viewDiscussion/${discussion.id}`}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 text-sm rounded"
                          >
                            View
                          </Link>
                          {/* {discussion.status !== "hidden" ? (
                            <button
                              onClick={() =>
                                handleModerateDiscussion(discussion.id, "hide")
                              }
                              className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 text-sm rounded"
                            >
                              Hide
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleModerateDiscussion(
                                  discussion.id,
                                  "approve"
                                )
                              }
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 text-sm rounded"
                            >
                              Approve
                            </button>
                          )} */}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === "statistics" && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Club Statistics</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-lg text-gray-500">Total Members</h3>
                <p className="text-3xl font-bold mt-2">
                  {statistics.total_members}
                </p>
              </div>
              <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-lg text-gray-500">Active Readers</h3>
                <p className="text-3xl font-bold mt-2">
                  {statistics.books_read}
                </p>
              </div>
              <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-lg text-gray-500">Books Completed</h3>
                <p className="text-3xl font-bold mt-2">
                  {statistics.completed_books}
                </p>
              </div>
              <div className="bg-white shadow-md rounded-lg p-6">
                <h3 className="text-lg text-gray-500">Active Discussions</h3>
                <p className="text-3xl font-bold mt-2">
                  {statistics.discussions_created}
                </p>
              </div>
            </div>

            {/* Additional charts and statistics could be added here */}
            <div className="mt-8 bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Reading Activity</h2>
              <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                <p className="text-gray-500">
                  Reading activity chart would go here
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Popular Books</h2>
                <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                  <p className="text-gray-500">
                    Popular books chart would go here
                  </p>
                </div>
              </div>
              <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Member Engagement</h2>
                <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
                  <p className="text-gray-500">
                    Member engagement chart would go here
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";
import React, { useEffect, useState, useMemo } from "react";
import { fetchAllBooksUser, updateBookProgress } from "../api/apiHandler";

const progressOptions = ["not-started", "reading", "completed"];
const defaultPercentages = {
  "not-started": 0,
  "reading": 50,
  "completed": 100,
};

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    loadBooks();
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
        progressOptions.indexOf(finalProgress) < progressOptions.indexOf(currentProgress)
      ) {
        alert("Cannot revert progress.");
        return;
      }
    } else if (newProgress !== undefined && newProgress !== null) {
      if (
        progressOptions.indexOf(newProgress) < progressOptions.indexOf(currentProgress)
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

  // 📊 Statistics
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

  return (
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

      {/* 🔍 Filters */}
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

      {/* 📚 Book Cards */}
      {loading ? (
        <p>Loading books...</p>
      ) : filteredBooks.length === 0 ? (
        <p>No books found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book, index) => (
            <div
              key={book.id || index}
              className="bg-white rounded-lg shadow p-4 border"
            >
              <h3 className="text-xl font-semibold">{book.title}</h3>
              <p className="text-sm text-gray-500">by {book.author}</p>
              {book.genre && (
                <p className="text-xs text-gray-400 mt-1">Genre: {book.genre}</p>
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
                onChange={(e) => updateBookState(book.id, e.target.value, null)}
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
            </div>
          ))}
        </div>
      )}

      {/* 📖 Book Detail Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg relative">
            <button
              className="absolute top-2 right-3 text-gray-500 text-xl"
              onClick={() => setSelectedBook(null)}
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-2">{selectedBook.title}</h2>
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
                selectedBook.reviews.map((rev, i) => <li key={i}>{rev}</li>)
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

            <label className="font-medium block mt-4">Update Progress:</label>
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
  );
};

export default BooksPage;

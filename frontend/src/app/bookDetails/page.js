"use client";
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { getBookById } from '../api/apiHandler';

function ViewBookDetailsPage({ book_id }) {
  const [book, setBook] = useState({
    title: '',
    description: '',
    author: '',
    genre: [] 
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const handleBack = () => {
    router.push('/dashboard-admin');
    localStorage.removeItem('bookId'); 
  }
  useEffect(() => {
    getBookByIdAndGenres();
  }, [book_id]);

  const getBookByIdAndGenres = async () => {
    try {
      const bookResult = await getBookById(book_id);
      if (bookResult.code === "1") {
        
        setBook({
          ...bookResult.data,
          genre: Array.isArray(bookResult.data.genre)
            ? bookResult.data.genre
            : [bookResult.data.genre]
        });
      } else {
        Swal.fire('Error', 'Failed to load book details', 'error');
      }
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      Swal.fire('Error', 'Failed to load book details', 'error');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">Loading book details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">View Book Details</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <p className="w-full px-3 py-2 border rounded-md">{book.title}</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <p className="w-full px-3 py-2 border rounded-md">{book.description}</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Author</label>
          <p className="w-full px-3 py-2 border rounded-md">{book.author}</p>
        </div>

        <div>
          <label className="block text-sm font-medium">Genres</label>
          <div className="flex flex-wrap gap-2">
            {book.genre && book.genre.length > 0 ? (
              book.genre.map((genre, index) => (
                <div key={index} className="flex items-center bg-gray-100 px-3 py-1 rounded">
                  <span>{genre}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No genres added</p>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => {handleBack()}}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewBookDetailsPage;

"use client";
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { addBook, fetchAllGenres } from '../api/apiHandler';

function AddBookPage() {
  const [book, setBook] = useState({
    title: '',
    description: '',
    author: '',
    genres: []
  });
  const [availableGenres, setAvailableGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const result = await fetchAllGenres();
      if (result.code === "1") {
        setAvailableGenres(result.data);
      } else {
        console.error("Error fetching genres:", result.message);
        Swal.fire('Warning', 'Failed to load genres', 'warning');
      }
      setLoading(false);
    } catch (err) {
      console.error("Error fetching genres:", err);
      Swal.fire('Error', 'Failed to load genres', 'error');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook({ ...book, [name]: value });
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
  };

  const addGenre = () => {
    if (selectedGenre) {
      const genreId = parseInt(selectedGenre, 10);
      const selectedGenreObj = availableGenres.find(genre => genre.id === genreId);
      
      // Only add if not already in the list
      if (!book.genres.some(g => g.id === genreId)) {
        setBook(prevState => ({
          ...prevState,
          genres: [...prevState.genres, {
            id: genreId,
            name: selectedGenreObj.name
          }]
        }));
        setSelectedGenre('');
      } else {
        Swal.fire('Already Added', 'This genre is already added to the book', 'info');
      }
    }
  };

  const removeGenre = (genreIdToRemove) => {
    setBook(prevState => ({
      ...prevState,
      genres: prevState.genres.filter(genre => genre.id !== genreIdToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate if we have at least one genre
    if (book.genres.length === 0) {
      Swal.fire('Warning', 'Please add at least one genre', 'warning');
      return;
    }
    
    // Extract just the IDs for the API payload
    const genreIds = book.genres.map(genre => genre.id);
    
    const payload = {
      title: book.title,
      description: book.description,
      author: book.author,
      genres: genreIds
    };

    console.log('Submitting book with payload:', payload);

    try {
      const result = await addBook(payload);

      if (result.code === "1") {
        Swal.fire({
          title: 'Book Added!',
          text: result.message.keyword || 'Book added successfully',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          router.push('/dashboard-admin');
        });
      } else {
        throw new Error(result.message.keyword || 'Failed to add book');
      }
    } catch (err) {
      console.error("Submit error:", err);
      Swal.fire('Error', err.message || 'Failed to add book', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">Loading genres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add New Book</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            name="title"
            type="text"
            value={book.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={book.description}
            onChange={handleChange}
            rows={4}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Author</label>
          <input
            name="author"
            type="text"
            value={book.author}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Genres</label>
          <div className="flex items-center mb-2">
            <select
              value={selectedGenre}
              onChange={handleGenreChange}
              className="w-full px-3 py-2 border rounded-l-md"
            >
              <option value="" className='bg-black-600'>Select a genre</option>
              {availableGenres.map(genre => (
                <option key={genre.id} value={genre.id}>
                  {genre.genre}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addGenre}
              className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
              disabled={!selectedGenre}
            >
              Add
            </button>
          </div>
          
          {book.genres.length > 0 ? (
            <div className="mt-3">
              <p className="text-sm font-medium mb-2">Added Genres:</p>
              <div className="flex flex-wrap gap-2">
                {book.genres.map(genre => (
                  <div key={genre.id} className="flex items-center bg-gray-100 px-3 py-1 rounded">
                    <span>{genre.name}</span>
                    <button
                      type="button"
                      onClick={() => removeGenre(genre.id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No genres added yet</p>
          )}
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.push('/dashboard-admin')}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Add Book
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddBookPage;
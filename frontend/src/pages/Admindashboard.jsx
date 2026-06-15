import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [userCount, setUserCount] = useState(0);

  // Add book form
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [publishYear, setPublishYear] = useState('');

  // Edit book
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editPublishYear, setEditPublishYear] = useState('');

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  useEffect(() => {
    // Redirect if not logged in or not admin
    if (!token || !user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchBooks();
    fetchUserCount();
  }, []);

  const fetchUserCount = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/count');
      setUserCount(res.data.count);
    } catch (error) {
      console.error('Error fetching user count:', error);
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const fetchBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/books');
      setBooks(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching books:', error);
      setLoading(false);
    }
  };

  const handleAddBook = async () => {
    if (!name || !author || !publishYear) {
      showMessage('Please fill all fields!', 'error');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/books', {
        name,
        author,
        publishYear: Number(publishYear),
      });
      showMessage('Book added successfully!', 'success');
      setName('');
      setAuthor('');
      setPublishYear('');
      fetchBooks();
    } catch (error) {
      console.error(error);
      showMessage('Error adding book!', 'error');
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/books/${id}`);
      showMessage('Book deleted successfully!', 'success');
      fetchBooks();
    } catch (error) {
      console.error(error);
      showMessage('Error deleting book!', 'error');
    }
  };

  const startEditing = (book) => {
    setEditingId(book._id);
    setEditName(book.name || '');
    setEditAuthor(book.author || '');
    setEditPublishYear(book.publishYear || '');
  };

  const handleUpdateBook = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/books/${id}`, {
        name: editName,
        author: editAuthor,
        publishYear: Number(editPublishYear),
      });
      setEditingId(null);
      showMessage('Book updated successfully!', 'success');
      fetchBooks();
    } catch (error) {
      console.error(error);
      showMessage('Error updating book!', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filteredBooks = books.filter((book) => {
    const bookName = book.name || '';
    return (
      bookName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📚</span>
          <div>
            <h1 className="text-xl font-bold text-white">Library Admin</h1>
            <p className="text-xs text-gray-400">Management Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300 bg-gray-800 px-3 py-1 rounded-lg">
            👥 Total Users: <span className="text-yellow-400 font-bold">{userCount}</span>
          </span>
          <span className="text-sm text-gray-300">
            👤 {user?.username}
            <span className="ml-2 bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-bold">ADMIN</span>
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-red-700 transition text-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Message */}
        {message.text && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === 'success'
              ? 'bg-green-900 text-green-300 border border-green-700'
              : 'bg-red-900 text-red-300 border border-red-700'
          }`}>
            {message.type === 'success' ? '✅' : '❌'} {message.text}
          </div>
        )}

        {/* Add Book Section */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-1">➕ Add New Book</h2>
          <p className="text-gray-400 text-sm mb-5">Fill in the details to add a book to the library.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Book Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 px-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 transition"
            />
            <input
              type="text"
              placeholder="Author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 px-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 transition"
            />
            <input
              type="number"
              placeholder="Publish Year"
              value={publishYear}
              onChange={(e) => setPublishYear(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 px-4 py-2.5 rounded-lg focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <button
            onClick={handleAddBook}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition"
          >
            Add Book to Library
          </button>
        </div>

        {/* Books List Section */}
        <div>
          <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
            <h2 className="text-xl font-bold text-white">📖 All Books ({books.length})</h2>
            <input
              type="text"
              placeholder="🔍 Search by name or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 px-4 py-2 rounded-full text-sm focus:outline-none focus:border-blue-500 transition w-72"
            />
          </div>

          {loading ? (
            <p className="text-center text-gray-500 py-10">Loading books...</p>
          ) : filteredBooks.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No books found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {filteredBooks.map((book) => (
                <div
                  key={book._id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col justify-between hover:border-gray-600 transition shadow-lg"
                >
                  {editingId === book._id ? (
                    // Edit Mode
                    <div className="flex flex-col gap-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Book Name"
                        className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="text"
                        value={editAuthor}
                        onChange={(e) => setEditAuthor(e.target.value)}
                        placeholder="Author"
                        className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="number"
                        value={editPublishYear}
                        onChange={(e) => setEditPublishYear(e.target.value)}
                        placeholder="Publish Year"
                        className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                      />
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => handleUpdateBook(book._id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold transition"
                        >
                          ✅ Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm font-semibold transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div>
                        <h3 className="text-lg font-bold text-blue-400 mb-1">{book.name || 'Untitled'}</h3>
                        <p className="text-sm text-gray-400 mb-1">✍️ {book.author || 'Unknown'}</p>
                        <p className="text-sm text-gray-500">📅 {book.publishYear || 'N/A'}</p>
                        <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-semibold ${
                          book.isAvailable !== false
                            ? 'bg-green-900 text-green-400'
                            : 'bg-red-900 text-red-400'
                        }`}>
                          {book.isAvailable !== false ? '● Available' : '● Borrowed'}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => startEditing(book)}
                          className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black py-2 rounded-lg text-sm font-semibold transition"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book._id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-semibold transition"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
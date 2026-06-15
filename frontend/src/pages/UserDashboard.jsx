import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function UserDashboard() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  // If not logged in, redirect to login
  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchBooks();
    }
  }, []);

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

  const handleBuy = async (bookId) => {
    try {
      const res = await axios.post(
        `http://localhost:5000/api/books/buy/${bookId}`,
        {},
        { headers: { authorization: token } }
      );
      setMessage(res.data.message);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error buying book');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-2xl font-bold">📚 Library</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">Welcome, {user?.username}!</span>
          <button
            onClick={() => navigate('/mybooks')}
            className="bg-white text-blue-600 px-4 py-1 rounded-lg font-semibold hover:bg-blue-50 transition text-sm"
          >
            My Books
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-1 rounded-lg font-semibold hover:bg-red-600 transition text-sm"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Message */}
      {message && (
        <div className="max-w-6xl mx-auto mt-4 px-4">
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">
            {message}
          </div>
        </div>
      )}

      {/* Books Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-6">📖 Available Books</h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading books...</p>
        ) : books.length === 0 ? (
          <p className="text-center text-gray-500">No books available right now.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {books.map((book) => (
              <div
                key={book._id}
                className="bg-white rounded-xl shadow p-6 flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">{book.name}</h3>
                  <p className="text-sm text-gray-500 mb-1">✍️ {book.author}</p>
                  <p className="text-sm text-gray-400">📅 {book.publishYear}</p>
                </div>
                <button
                  onClick={() => handleBuy(book._id)}
                  className="mt-4 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Buy Book
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;

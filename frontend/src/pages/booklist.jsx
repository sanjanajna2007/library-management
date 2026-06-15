import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // States to handle editing tracking
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editPublishYear, setEditPublishYear] = useState('');

  // 1. Fetch all books from your backend API when the page loads
  const fetchBooks = () => {
    axios.get('http://localhost:5000/api/books/all') // Updated route to match your backend /all
      .then((response) => {
        setBooks(response.data); 
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching books:", error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // 2. Turn on Edit Mode for a specific book card
  const handleEditClick = (book) => {
    setEditingId(book._id);
    setEditTitle(book.title || '');
    setEditAuthor(book.author || '');
    setEditPublishYear(book.publishYear || '');
  };

  // 3. Cancel Edit Mode
  const handleCancel = () => {
    setEditingId(null);
  };

  // 4. Save Updated Book to the Database
  const handleSave = (id) => {
    const updatedData = {
      title: editTitle,
      author: editAuthor,
      publishYear: editPublishYear
    };

    axios.put(`http://localhost:5000/api/books/update/${id}`, updatedData)
      .then((response) => {
        setBooks(books.map(book => book._id === id ? response.data : book));
        setEditingId(null); // Close input fields
      })
      .catch((error) => {
        console.error("Error updating book:", error);
        alert("Failed to update book.");
      });
  };

  // 5. Delete Book from Database
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      axios.delete(`http://localhost:5000/api/books/delete/${id}`)
        .then(() => {
          setBooks(books.filter(book => book._id !== id));
        })
        .catch((error) => {
          console.error("Error deleting book:", error);
          alert("Failed to delete book.");
        });
    }
  };
  
  // 6. Handle Toggling Borrow Status
  const handleBorrowToggle = async (bookId, currentStatus) => {
    // Standardize matching whatever casing your database uses ('borrowed' vs 'Available')
    const nextStatus = currentStatus === 'borrowed' ? 'Available' : 'borrowed';
   
    try {
      const response = await fetch(`http://localhost:5000/api/books/${bookId}/borrow`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const updatedBook = await response.json();

      if (response.ok) {
        // Update local React state instantly so the text changes on-screen
        setBooks(prevBooks => 
          prevBooks.map(book => book._id === bookId ? { ...book, status: nextStatus } : book)
        );
      } else {
        alert('Failed to update status: ' + updatedBook.message);
      }
    } catch (error) {
      console.error('Error updating borrow status:', error);
      alert('Could not connect to the backend server.');
    }
  };

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading books...</div>;
  }

  return (
    <div style={{ padding: '40px', color: 'white', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Admin Dashboard - Manage Books</h1>
      
      {books.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#aaa' }}>No books found in the database.</p>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '20px' 
        }}>
          {books.map((book) => (
            <div 
              key={book._id} 
              style={{ 
                background: '#1e1e24', 
                padding: '20px', 
                borderRadius: '8px', 
                border: '1px solid #333',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between'
              }}
            >
              {/* IF EDITING THIS BOOK CARD */}
              {editingId === book._id ? (
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#aaa' }}>Book Name/Title:</label>
                  <input 
                    type="text" 
                    value={editTitle} 
                    onChange={(e) => setEditTitle(e.target.value)} 
                    style={{ width: '100%', padding: '6px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #555', background: '#2a2a35', color: 'white' }}
                  />
                  
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#aaa' }}>Author:</label>
                  <input 
                    type="text" 
                    value={editAuthor} 
                    onChange={(e) => setEditAuthor(e.target.value)} 
                    style={{ width: '100%', padding: '6px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #555', background: '#2a2a35', color: 'white' }}
                  />
                  
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#aaa' }}>Published Year:</label>
                  <input 
                    type="text" 
                    value={editPublishYear} 
                    onChange={(e) => setEditPublishYear(e.target.value)} 
                    style={{ width: '100%', padding: '6px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #555', background: '#2a2a35', color: 'white' }}
                  />
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleSave(book._id)} style={{ flex: 1, padding: '8px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                    <button onClick={handleCancel} style={{ flex: 1, padding: '8px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                /* IF NOT EDITING: SHOW DETAILS AND ACTIONS */
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{book.title || "Untitled Book"}</h3>
                    <p style={{ margin: '5px 0', color: '#ccc' }}><strong>Author:</strong> {book.author || "Unknown"}</p>
                    <p style={{ margin: '5px 0', color: '#888' }}><strong>Published:</strong> {book.publishYear || "N/A"}</p>
                    <p style={{ margin: '5px 0', color: book.status === 'borrowed' ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>
                      <strong>Status:</strong> {book.status === 'borrowed' ? 'Borrowed' : 'Available'}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
                    {/* NEW BORROW BUTTON LINKED TO HANDLER */}
                    <button 
                      onClick={() => handleBorrowToggle(book._id, book.status || 'Available')} 
                      style={{ 
                        padding: '8px', 
                        background: book.status === 'borrowed' ? '#6c757d' : '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        fontWeight: 'bold',
                        cursor: 'pointer' 
                      }}
                    >
                      {book.status === 'borrowed' ? '↩ Return' : '☑ Borrow'}
                    </button>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={() => handleEditClick(book)} style={{ flex: 1, padding: '8px', background: '#ffc107', color: '#212529', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(book._id)} style={{ flex: 1, padding: '8px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookList;
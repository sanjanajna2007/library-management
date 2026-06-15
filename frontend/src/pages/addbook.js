import React, { useState } from 'react';
import axios from 'axios'; 

const AddBook = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publishYear, setPublishYear] = useState('');
  
  // New state to hold a success message on the screen
  const [successMessage, setSuccessMessage] = useState('');

  const handleSaveBook = () => {
  const data = { 
    title, 
    author, 
    publishYear: Number(publishYear || publishyear || year) 
  };
    
    axios.post('http://localhost:5000/api/books/add', data)
      .then(() => {
        // 1. Set the text message to show on the screen
        setSuccessMessage('Book added successfully to the library database!');
        
        // 2. Clear the inputs right away
        setTitle('');
        setAuthor('');
        setPublishYear('');

        // 3. Make the success message disappear automatically after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      })
      .catch((error) => {
        console.log(error);
        alert('An error occurred while saving the book.');
      });
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', color: 'white' }}>
      <h1>Library Admin Panel</h1>
      <p>Enter book details below to add them to the database.</p>
      
      {/* 👇 THIS WILL SHOW A GREEN SUCCESS MESSAGE ON THE PAGE IF IT EXISTS */}
      {successMessage && (
        <div style={{ color: '#28a745', marginBottom: '15px', fontWeight: 'bold' }}>
          {successMessage}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', width: '300px', margin: '0 auto', gap: '10px' }}>
        <input 
          type="text" 
          placeholder="Title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          style={{ padding: '10px', background: '#333', color: 'white', border: '1px solid #553' }}
        />
        <input 
          type="text" 
          placeholder="Author" 
          value={author} 
          onChange={(e) => setAuthor(e.target.value)} 
          style={{ padding: '10px', background: '#333', color: 'white', border: '1px solid #553' }}
        />
        <input 
          type="number" 
          placeholder="Year" 
          value={publishYear} 
          onChange={(e) => setPublishYear(e.target.value)} 
          style={{ padding: '10px', background: '#333', color: 'white', border: '1px solid #553' }}
        />
        <button onClick={handleSaveBook} style={{ backgroundColor: '#007bff', color: 'white', padding: '10px', border: 'none', cursor: 'pointer' }}>
          Add Book to Database
        </button>
      </div>
    </div>
  );
};

export default AddBook;
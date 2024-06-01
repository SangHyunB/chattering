import React, { useState } from 'react';        //검색창 바

function SearchBar({ setResults, rooms }) {
  const [input, setInput] = useState('');

  const handleChange = (value) => {
    setInput(value);
    const filteredRooms = rooms.filter(room => room.toLowerCase().includes(value.toLowerCase()));
    setResults(filteredRooms);
  };

  return (
    <div className='input_wrapper'>
      <input
        placeholder='검색'
        className='검색'
        value={input}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
}

export default SearchBar;

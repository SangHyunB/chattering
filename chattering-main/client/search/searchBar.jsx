import React, { useState } from 'react';
import { Bs1Circle } from "react-icons/bs";


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

/*import React,{useState} from 'react'

function SearchBar({setResults}) {
    const [input,setInput]=useState('');

    const fetchData = (value)=>{
       // fetch("https://localhost:3003/")
       fetch("https://jsonplaceholder.typicode.com/users")
       .then((response)=>response.json())
       .then(json=>{
        const result = json.filter((user)=>{
            return value&& user && user.name && user.name.toLowerCase().includes(value);
            })
           setResults(result);
        })
    }

    const handleChange = (value) =>{
        setInput(value)
        fetchData(value)
    }

    return (
    <div className='input_wrapper'>
        <input placeholder='검색' className='검색'
        value={input}
        onChange={(e)=>{handleChange(e.target.value)}} 
        />
    </div>
    )
}

export default SearchBar*/
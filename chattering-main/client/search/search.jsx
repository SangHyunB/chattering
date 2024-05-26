import React, { useState } from 'react';
import SearchBar from './searchBar.jsx';
import SearchResLi from './SearchResLi.jsx';

function Search({ setResults, rooms }) {
  return (
    <div className='search'>
      <div className='search_bar_container'>
        <SearchBar setResults={setResults} rooms={rooms} />
      </div>
    </div>
  );
}

export default Search;

/*import React, { useState } from 'react';
import SearchBar from './searchBar.jsx';
import SearchResLi from './SearchResLi.jsx';


function Search() {

  const [results,setResults]=useState([]);


  return(
    <div className='search' >
      <div className='search_bar_container'>
        <SearchBar setResults={setResults}/>
        <SearchResLi results={results}/>
      </div>
    </div>
  );
}

export default Search;*/

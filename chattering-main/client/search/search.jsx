import React from 'react';                    
import SearchBar from './searchBar.jsx';

function Search({ setResults, rooms }) {    //검색 컴포넌트
  return (
    <div className='search'>
      <div className='search_bar_container'>
        <SearchBar setResults={setResults} rooms={rooms} />
      </div>
    </div>
  );
}

export default Search;

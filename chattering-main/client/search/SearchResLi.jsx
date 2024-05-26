import React from 'react';

function SearchResLi({ results, onRoomSelect }) {
  return (
    <div className='res_list'>
      {results.map((room, id) => (
        <div key={id} className="result" onClick={() => onRoomSelect(room)}>
          {room}
        </div>
      ))}
    </div>
  );
}

export default SearchResLi;

/*import React from 'react'
import SearchRes from './SearchRes.jsx'
function SearchResLi({ rooms, onRoomSelect }) {
  return (
    <div className='res_list'>
            {results.map((room,id)=>{
                return <SearchRes result={room} onRoomSelect={onRoomSelect} key={id}/>
            })}
    </div>)
}
export default SearchResLi*/



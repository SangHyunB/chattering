import React from 'react';       // 검색목록 리스트

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
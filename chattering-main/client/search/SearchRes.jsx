import React from 'react'   //검색결과 클릭시 발동

function SearchRes({ rooms, onRoomSelect }) {
  return (
    <div className='search_Res'>
       {rooms.map(room => (
        <div key={room} className="result" onClick={() => onRoomSelect(room)}> 
          {room} 
        </div>
      ))}
    </div>
  )
}

export default SearchRes
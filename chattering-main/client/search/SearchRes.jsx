import React from 'react'

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
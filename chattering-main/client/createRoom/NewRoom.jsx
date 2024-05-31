import React, { useState, useEffect } from 'react';
import { createRoom, fetchRoomNames } from '../Indexdb.jsx';


function NewRoomForm({ onCreateRoom }) {
  const [newRoomName, setNewRoomName] = useState('');

  const handleChange = (e) => {
    setNewRoomName(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    onCreateRoom(newRoomName);
    setNewRoomName('');
    localStorage.setItem(`${newRoomName}`,newRoomName);
  };

  

  return (
    <form className='NewRoomForm' onSubmit={handleSubmit}>
      <input
        className='create_input'
        type="text"
        placeholder="새로운 방 이름"
        value={newRoomName}
        onChange={handleChange}
      />
      <button className='create_button' type="submit">방 생성</button>
    </form>
   
  );
}

function NewRoom({ get_roomName }) {
  const [db, setDb] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [prop,setProp] = useState([]);

  const loadRooms = (database) => {
      fetchRoomNames(database, (roomNames) => {
          setRooms(roomNames);
      });
  };

  const handleCreateRoom = (roomName) => {
    createRoom(roomName)
      .then((newDb) => {
        setDb(newDb);
        setRooms((prevRooms) => {
          const updatedRooms = [...prevRooms, roomName];
          get_roomName(updatedRooms); // 상위 컴포넌트로 방 목록 업데이트
          return updatedRooms;
        });
      })
      .catch((error) => {
        console.error('Failed to create room', error);
      });
  };


  return (
      <div>    
          <NewRoomForm  onCreateRoom={handleCreateRoom} />         
      </div>
  );
}

export default NewRoom;

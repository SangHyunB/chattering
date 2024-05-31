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
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="새로운 방 이름"
        value={newRoomName}
        onChange={handleChange}
      />
      <button type="submit">방 생성</button>
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
        
          <h1>채팅방 목록</h1>
          {/* 방 생성 폼 컴포넌트 */}
          <NewRoomForm onCreateRoom={handleCreateRoom} />
          {/* 방 목록 */}
          <ul>
              {rooms.map((room, index) => (
                  <li key={index}>{room}</li>
              ))}
          </ul>
      </div>
  );
}

export default NewRoom;

import React, { useState } from 'react';

function NewRoomForm({ onCreateRoom }) {
  const [newRoomName, setNewRoomName] = useState('');

  const handleChange = (e) => {
    setNewRoomName(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return; // 방 이름이 공백일 경우 무시
    onCreateRoom(newRoomName);
    setNewRoomName(''); // 폼 초기화
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

export default NewRoomForm;


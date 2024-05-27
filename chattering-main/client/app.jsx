
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import SearchResLi from './search/SearchResLi.jsx';
import Search from './search/search.jsx';

const socket = io.connect();

function UsersList({ users }) {
  return (
    <div className='users'>
      <h3>참여자들</h3>
      <ul>
        {users.map((user, i) => (
          <li key={i}>{user}</li>
        ))}
      </ul>
    </div>
  );
}

function Message({ message }) {
  const time = new Date(message.time);
  const formattedTime = isNaN(time.getTime()) ? "Invalid Date" : time.toLocaleString();

  return (
    <div className='message'>
      <strong>{message.user || "Guest"} :</strong> <span>{message.message || ""}</span>
      <div>Sent at: {formattedTime}</div>
    </div>
  );
}

function MessageList({ messages }) {
  const messageRooms = Object.keys(messages);

  return (
    <div className='messages'>
     
      {messageRooms.map((roomName, roomIndex) => (
        <div key={roomIndex}>
          <h2>{roomName}</h2>
          {messages[roomName].map((message, messageIndex) => (
            <Message key={messageIndex} message={message} />
          ))}
        </div>
      ))}
    </div>
  );
}

function MessageForm({ onMessageSubmit, user, selectedRoom }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return; // 공백 메시지 방지
    const currentTime = new Date().toISOString();
    const message = { user, message: text, time: currentTime, room: selectedRoom };
    console.log('Sending message:', message); // 메시지 전송 전 확인
    onMessageSubmit(message);
    setText('');
  };

  const changeHandler = (e) => {
    setText(e.target.value);
  };

  return (
    <div className='message_form'>
      <form onSubmit={handleSubmit}>
        <input
          placeholder='메시지 입력'
          className='textinput'
          onChange={changeHandler}
          value={text}
        />
      </form>
    </div>
  );
}

function ChatApp() {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState({});
  const [user, setUser] = useState('');
  const [rooms, setRooms] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    socket.on('init', _initialize);
    socket.on('send:message', _messageReceive);
    socket.on('user:join', _userJoin);
    socket.on('user:left', _userLeft);
    socket.on('change:name', _userNameChange);

    console.log("Initial messages from server:", messages);
    fetch('http://localhost:3003/rooms')
      .then(response => response.json())
      .then(data => {
        const roomNames = Object.keys(data);
        setRooms(roomNames);
      })
      .catch(error => console.error('Error fetching chat data:', error));

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const username = urlParams.get('username');
    console.log("Extracted username from URL:", username); // 디버깅을 위해 추가
    if (username) {
      setUser(username);
      socket.emit('user:join', { user: username });
    }

    return () => {
      socket.off('init', _initialize);
      socket.off('send:message', _messageReceive);
      socket.off('user:join', _userJoin);
      socket.off('user:left', _userLeft);
      socket.off('change:name', _userNameChange);
    };
  }, []);

  const _initialize = (data) => {
    console.log("Initialized users from server:", data.users);
    setUsers(data.users);
  };

  const _messageReceive = (message) => {
    console.log("New message received from server:", message); // 디버깅을 위해 추가
    setMessages((prevMessages) => {
      const room = message.room;
      const newMessages = { ...prevMessages };
      if (!newMessages[room]) {
        newMessages[room] = [];
      }
      newMessages[room].push(message);
      return newMessages;
    });
  };

  const _userJoin = (data) => {
    console.log("User joined:", data.user); // 디버깅을 위해 추가
    if (data.user) {
      setUsers(prevUsers => [...prevUsers, data.user]);
    }
  };

  const _userLeft = (data) => {
    console.log("User left:", data.user); // 디버깅을 위해 추가
    setUsers(prevUsers => prevUsers.filter(user => user !== data.user));
  };

  const _userNameChange = (data) => {
    console.log("User name changed:", data.oldName, "to", data.newName); // 디버깅을 위해 추가
    setUsers(prevUsers => prevUsers.map(user => user === data.oldName ? data.newName : user));
  };

  const handleMessageSubmit = (message) => {
    console.log("Message submitted:", message);
    if (!message.user || !message.message || !message.time || !message.room) {
      console.error("Invalid message data:", message);
      return;
    }
  
    setMessages((prevMessages) => {
      const room = message.room;
      const newMessages = { ...prevMessages };
      if (!newMessages[room]) {
        newMessages[room] = [];
      }
      newMessages[room].push(message);
      return newMessages;
    });
  
    socket.emit('send:message', message);
  };
  

  const handleRoomSelect = (roomName) => {
    setSelectedRoom(roomName);
    fetch('http://localhost:3003/rooms')
      .then(response => response.json())
      .then(data => {
        const chatMessages = data[roomName] || [];
        chatMessages.sort((a, b) => new Date(a.time) - new Date(b.time));
        setMessages({ [roomName]: chatMessages }); // Update messages for the selected room
      })
      .catch(error => console.error('Error fetching chat data:', error));
  };

  return (
    <div className='center'>
      <Search setResults={setResults} rooms={rooms} />
      <SearchResLi results={results} onRoomSelect={handleRoomSelect} />
      <MessageList messages={messages} />
      <MessageForm onMessageSubmit={handleMessageSubmit} user={user} selectedRoom={selectedRoom} />
    </div>
  );
}

// ReactDOM rendering code
const root = createRoot(document.getElementById('app'));
root.render(<ChatApp />);

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
  return (
    <div className='message'>
      <strong>{message.user} :</strong> <span>{message.message}</span>
      <div>Sent at: {new Date(message.time).toLocaleString()}</div>
    </div>
  );
}

function MessageList({ messages }) {
  const messageRooms = Object.keys(messages);

  return (
    <div className='messages'>
      <h2>채팅방</h2>
      {messageRooms.map((roomName, roomIndex) => (
        <div key={roomIndex}>
          <h3>Room {roomName}</h3>
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
    const currentTime = new Date().toISOString(); 
    const message = { user, message: text,time: currentTime, room: selectedRoom };
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
    socket.on('user:join', );
    socket.on('user:left', );
    socket.on('change:name', );

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
    if (!users.includes(username)) {
      setUser(username);
      setUsers(prevUsers => [...prevUsers, username]);
    }

    return () => {
      socket.off('init', _initialize);
      socket.off('send:message', _messageReceive);
      socket.off('user:join', );
      socket.off('user:left', );
      socket.off('change:name', );
    };
  }, []);

  const _initialize = (data) => {
    setUsers(data.users);
    console.log("Initialized users from server:", data.users);
  };

  const _messageReceive = (message) => {   //문제
    setMessages((prevMessages) => {
      const room = message.room;
      const newMessages = { ...prevMessages };
      if (!newMessages[room]) {
        newMessages[room] = [];
      }
      newMessages[room].push(message);
      return newMessages;
    });
    console.log("New message received from server:", message);
  };

  const handleMessageSubmit = (message) => {
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

const root = createRoot(document.getElementById('app'));
root.render(<ChatApp />);

/*import React, { useState, useEffect } from 'react';
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
  return (
    <div className='message'>
      <strong>{message.user} :</strong> <span>{message.message}</span>
      <div>Sent at: {new Date(message.time).toLocaleString()}</div>
    </div>
  );
}

function MessageList({ messages }) {
  return (
    <div className='messages'>
      <h2>채팅방</h2>
      {messages.map((roomMessages, roomIndex) => (
        <div key={roomIndex}>
          <h3>Room {roomIndex + 1}</h3>
          {roomMessages.map((message, messageIndex) => (
            <Message key={messageIndex} message={message} />
          ))}
        </div>
      ))}
    </div>
  );
}

function MessageForm({ onMessageSubmit, user }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = { user, text };
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

function ChangeNameForm({ onChangeName }) {
  const [newName, setNewName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onChangeName(newName);
    setNewName('');
  };

  const onKey = (e) => {
    setNewName(e.target.value);
  };

  return (
    <div className='change_name_form'>
      <h3>아이디 변경</h3>
      <form onSubmit={handleSubmit}>
        <input
          placeholder='변경할 아이디 입력'
          onChange={onKey}
          value={newName}
        />
      </form>
    </div>
  );
}

function ChatApp() {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState('');
  const [rooms, setRooms] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    socket.on('init', _initialize);
    socket.on('send:message', _messageReceive);
    socket.on('user:join', );
    socket.on('user:left', );
    socket.on('change:name', );

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
    if (!users.includes(username)) {
      setUser(username);
      setUsers(prevUsers => [...prevUsers, username]);
    }

    return () => {
      socket.off('init', _initialize);
      socket.off('send:message', _messageReceive);
      socket.off('user:join', );
      socket.off('user:left', );
      socket.off('change:name', );
    };
  }, []);

  const _initialize = (data) => {
    setUsers(data.users);
  };

  const _messageReceive = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const handleMessageSubmit = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
    socket.emit('send:message', message);
  };

  const handleChangeName = (newName) => {
    const oldName = user;
    socket.emit('change:name', { name: newName }, (result) => {
      if (!result) {
        return alert('There was an error changing your name');
      }
      setUsers((prevUsers) => {
        const index = prevUsers.indexOf(oldName);
        const updatedUsers = [...prevUsers];
        updatedUsers.splice(index, 1, newName);
        return updatedUsers;
      });
      setUser(newName);
    });
  };

  const handleRoomSelect = (roomName) => {
    setSelectedRoom(roomName);
    fetch('http://localhost:3003/rooms')
      .then(response => response.json())
      .then(data => {
        const chatMessages = data[roomName] || [];
        chatMessages.sort((a, b) => new Date(a.time) - new Date(b.time));
        setMessages(chatMessages);
        
      })
      .catch(error => console.error('Error fetching chat data:', error));
  };

  

  return (
    <div className='center'>
      <Search setResults={setResults} rooms={rooms} />
      <SearchResLi results={results} onRoomSelect={handleRoomSelect} />
      <MessageList messages={messages} />
      <MessageForm onMessageSubmit={handleMessageSubmit} user={user} />
    </div>
  );
}

const root = createRoot(document.getElementById('app'));
root.render(<ChatApp />);*/

/*'use strict';
import { createRoot } from 'react-dom/client';

import React, { useState, useEffect } from 'react';
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

function Message({ user, text }) {
  return (
    <div className='message'>
      <strong>{user} :</strong> <span>{text}</span>
    </div>
  );
}

function MessageList({ messages }) {
  return (
    <div className='messages'>
      <h2>채팅방</h2>
      {messages.map((message, i) => (
        <Message key={i} user={message.user} text={message.text} />
      ))}
    </div>
  );
}

function MessageForm({ onMessageSubmit, user }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const message = { user, text };
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

function ChangeNameForm({ onChangeName }) {
  const [newName, setNewName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onChangeName(newName);
    setNewName('');
  };

  const onKey = (e) => {
    setNewName(e.target.value);
  };

  return (
    <div className='change_name_form'>
      <h3>아이디 변경</h3>
      <form onSubmit={handleSubmit}>
        <input
          placeholder='변경할 아이디 입력'
          onChange={onKey}
          value={newName}
        />
      </form>
    </div>
  );
}

function ChatApp() {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [user, setUser] = useState('');

  const componentDidMount=()=> {
  socket.on('init',_initialize);
	socket.on('send:message', _messageRecieve);
	socket.on('user:join', _userJoined);
	socket.on('user:left', _userLeft);
	socket.on('change:name', _userChangedName);
  };

  
  const _initialize = (data) => {
    setUsers(data.users);
  };

  const _messageRecieve = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const handleMessageSubmit = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
    socket.emit('send: message', message);
  };

  const handleChangeName = (newName) => {
    const oldName = user;
    socket.emit('change:name', { name: newName }, (result) => {
      if (!result) {
        return alert('There was an error changing your name');
      }
      setUsers((prevUsers) => {
        const index = prevUsers.indexOf(oldName);
        const updatedUsers = [...prevUsers];
        updatedUsers.splice(index, 1, newName);
        return updatedUsers;
      });
      setUser(users);
	  
    })
	
  };

  	useEffect(() => {
    // URL에서 쿼리 문자열을 가져와 파싱합니다.
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // 쿼리 문자열에서 사용자 이름과 ID를 가져옵니다.
    const username = urlParams.get('username');

    // 가져온 사용자 이름을 현재 사용자로 설정하고, 사용자 목록에 추가합니다.
    if (!users.includes(username)) {
		// 가져온 사용자 이름을 현재 사용자로 설정하고, 사용자 목록에 추가합니다.
		setUser(username);
		setUsers(prevUsers => [...prevUsers, username]);
	  }
	});
  
  //<ChangeNameForm onChangeName={handleChangeName} />
  //<UsersList users={users} />

  return (
    <div className='center'>
      <Search/>
      <MessageList messages={messages} />
      <MessageForm onMessageSubmit={handleMessageSubmit} user={user} />  
    </div>
  );
}



const root = createRoot(document.getElementById('app'));

root.render(<ChatApp />);*/
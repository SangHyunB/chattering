import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import SearchResLi from './search/SearchResLi.jsx';
import Search from './search/search.jsx';
import { fetchRoomNames, fetchRoomData, addData, createRoom } from './Indexdb.jsx'; // 수정된 부분
import NewRoom from './createRoom/NewRoom.jsx';

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
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const username = urlParams.get('username');
    const isUser = message.user === username;

   
    return (
        <div className={`message ${isUser ? 'message-user' : 'message-other'}`}>      
            <div className='msgBlock' >
                <strong>{message.user || "Guest"} :</strong> <span>{message.message || ""}</span>
                <div>Sent at: {formattedTime}</div>
            </div>
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

        const roomKeys = [];
        for (const key in localStorage) {
            if (localStorage.hasOwnProperty(key)) { // 속성이 직접 소유한 것인지 확인
                roomKeys.push(key);
            }
          }
        console.log(roomKeys);
        setRooms(roomKeys); 

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const username = urlParams.get('username');
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
        setUsers(data.users);   
    };

    const get_roomName=(newRooms)=>{
        setRooms(prevRooms => [...prevRooms, ...newRooms]);
    };    

    const _messageReceive = (message) => {
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

    const _userJoin =(data) => {
        if (data.user) {
            setUsers(prevUsers => [...prevUsers, data.user]);
        }
    };

    const _userLeft = (data) => {
        setUsers(prevUsers => prevUsers.filter(user => user !== data.user));
    };

    const _userNameChange = (data) => {
        setUsers(prevUsers => prevUsers.map(user => user === data.oldName ? data.newName : user));
    };

    const handleMessageSubmit = (message) => {
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
     
              
        addData(message.room, message); 
            
        socket.emit('send:message', message);


    };

    const handleRoomSelect = (roomName) => {
        setSelectedRoom(roomName);
      
        // IndexedDB에서 선택한 방의 채팅 내용을 가져옵니다.
        const request = indexedDB.open(roomName);
    
        request.onsuccess = (event) => {
            const db = event.target.result;
            fetchRoomData(db, roomName, (chatMessages) => {
                // 가져온 채팅 메시지를 시간 순서대로 정렬합니다.
                chatMessages.sort((a, b) => new Date(a.time) - new Date(b.time));
                // 선택한 방에 해당하는 메시지를 설정합니다.
                setMessages({ [roomName]: chatMessages });
                db.close();
            });
        };
    
        request.onerror = (event) => {
            console.error('Failed to open database', event.target.error);
        };
    };
   
    return (
        <div className='center'>    
            <Search setResults={setResults} rooms={rooms} />
            <NewRoom get_roomName={get_roomName}/>
            <SearchResLi results={results} onRoomSelect={handleRoomSelect} />
            <MessageList messages={messages} />
            <MessageForm onMessageSubmit={handleMessageSubmit} user={user} selectedRoom={selectedRoom} />
        </div>
    );
}

// ReactDOM rendering code
const root = createRoot(document.getElementById('app'));
root.render(<ChatApp />);

/*export function openDB(roomName) {
    return new Promise((resolve, reject) => {
        let request = indexedDB.open("chatDB",1);

        request.onupgradeneeded = function(event) {
            let db = event.target.result;
            // Handle upgrades if needed
        };

        request.onerror = function() {
            console.error('ERROR', request.error);
            reject(request.error);
        };

        request.onsuccess = function() {
            let db = request.result;
            console.log("request success");
            resolve(db);
        };
    });
}*/


export function createRoom(roomName,callback) {
    return new Promise((resolve, reject) => {

        let storedRooms = localStorage.getItem(`${roomName}`);

        const request = indexedDB.open(roomName);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(roomName)) {
                const objectStore = db.createObjectStore(roomName, { autoIncrement: true });
                // room 필드 추가
                objectStore.createIndex(roomName, roomName, { unique: false });
            }
            const transaction = event.target.transaction;
            const objectStore = transaction.objectStore(roomName);
           
            const startData = { user: '운영자', message: `${roomName}방이 개설되었습니다!`, time: new Date().toISOString(), room: roomName};
            //const startData = { room: roomName, user: '운영자', message: `${roomName}방이 개설되었습니다!`, time: new Date().toISOString()};
            objectStore.add(startData); 
        };
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            db.close(); // DB를 닫아줍니다.
            if (callback && typeof callback === 'function') {
                callback(storedRooms); // 콜백 함수를 호출하여 storedRooms 값을 전달합니다.
              }
            resolve(db);
        };
        
        request.onerror = (event) => {
            console.error("Failed to create room", event.target.error);
            reject(event.target.error);
                };
        })
    }
                


    export function addData(roomName, message) {
        const request = indexedDB.open(roomName);
    
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction([roomName], 'readwrite');
            const store = transaction.objectStore(roomName);
    
            let req = store.add(message);
            req.onsuccess = function() {
                console.log("Data stored successfully", req.result);
            };
    
            req.onerror = function() {
                console.error('Data store failed', req.error);
            };
    
            transaction.oncomplete = function() {
                db.close();
            };
        };
    
        request.onerror = (event) => {
            console.error('Failed to open database', event.target.error);
        };
    }


/*export function addData(db,roomName, message) {
  
    const transaction = db.transaction([roomName], 'readwrite');
    const store = transaction.objectStore(roomName);

    let req = store.add(message); // message 전체 객체를 넣어줘야 함
    req.onsuccess = function() {
        console.log("store 성공", req.result);
    };

    req.onerror = function() {
        console.error('store 실패', req.error);
    };
}*/

export function fetchRoomData(db, roomName, callback) {
    const transaction = db.transaction([roomName], 'readonly');
    const store = transaction.objectStore(roomName);
    const request = store.getAll();

    request.onsuccess = (event) => {
        callback(event.target.result);
    };

    request.onerror = (event) => {
        console.error('Failed to fetch room data', event.target.error);
    };
}


export function fetchRoomNames(roomName, callback) {
    const transaction = roomName.transaction([roomName], 'readonly'); // database 이름 사용
    const store = transaction.objectStore(roomName); // database 이름 사용
    const request = store.get('room');

    request.onsuccess = (event) => {
        callback(event.target.result);
    };

    request.onerror = (event) => {
        console.error('Failed to fetch room names', event.target.error);
    };
}
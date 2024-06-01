export function createRoom(roomName,callback) {          //방 생성 
    return new Promise((resolve, reject) => {

        let storedRooms = localStorage.getItem(`${roomName}`);

        const request = indexedDB.open(roomName);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(roomName)) {
                const objectStore = db.createObjectStore(roomName, { autoIncrement: true });
                objectStore.createIndex(roomName, roomName, { unique: false });
            }
            const transaction = event.target.transaction;
            const objectStore = transaction.objectStore(roomName);
           
            const startData = { user: '운영자', message: `${roomName}방이 개설되었습니다!`, time: new Date().toISOString(), room: roomName};   //방 생성시 시작 메세지 하나 저장
            objectStore.add(startData); 
        };
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            db.close(); 
            if (callback && typeof callback === 'function') {
                callback(storedRooms); // 콜백 함수를 호출하여 storedRooms 값을 전달.
              }
            resolve(db);
        };
        
        request.onerror = (event) => {
            console.error("Failed to create room", event.target.error);
            reject(event.target.error);
                };
        })
    }
                

    export function addData(roomName, message) {            //해당 방에 데이터를 저장시킴
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


export function fetchRoomData(db, roomName, callback) {        //indexedDB에서 특정방에서 모든 데이터를 뽑아옴
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


export function fetchRoomNames(roomName, callback) {        //indexedDB에서 방이름을 가져오는 함수
    const transaction = roomName.transaction([roomName], 'readonly'); 
    const store = transaction.objectStore(roomName); 
    const request = store.get('room');

    request.onsuccess = (event) => {
        callback(event.target.result);
    };

    request.onerror = (event) => {
        console.error('Failed to fetch room names', event.target.error);
    };
}
const getFakePerson = () => fetch('https://randomuser.me/api/').then(data => data.json());

export const getFakePeople = count => {
    const persons = [];
    for (let i = 0; i < count; i++) {
        persons.push(getFakePerson())
    }
    return Promise.all(persons)
}

export const error = msg => {
    console.error(`%c ${msg}`, 'background: #721c24; color: #f8d7da; border:1px solid #f5c6cb');
}

export const onerror = (e) => {
    const label = "Database error:";
    error(`${label} ${e.target.errorCode}`);
}


export const log = (msg, ...rest) => {
    console.info(`%c ${msg}`, 'background: #d4edda; color: #155724; border:1px solid #c3e6cb', ...rest);
}


export const handleRequestCallback = (req, cb) => {
    const isCb = typeof cb === 'function';
    req.onerror = (err) => {
        onerror(err)
        isCb && cb(err, null)

    };
    req.onsuccess = (e) => {
        isCb && cb(null, req.result);
    };
}

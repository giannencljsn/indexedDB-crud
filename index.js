import DB from './Database.js';
import { getFakePeople } from './helpers.js';
import initUI, { showMsg } from './UI.js';
let db;


const populateDB = () => {
    return new Promise((res, rej) => {
        db.store.count().onsuccess = function (e) {
            const { result } = e.target;
            if (result !== 0) return res(db)
            showMsg("Need to generate fake data - stand by please...");
            const fakePeople = getFakePeople(5).then(data => data.map(p => {
                const [person] = p.results;
                const { title, first, last } = person.name;
                return {
                    name: `${title}. ${first} ${last}`,
                    email: person.email,
                    gender: person.gender,
                    phone: person.phone,
                }
            }))
            fakePeople.then(persons => db.insertAll(persons))
                // in case not able to fetch data
                .catch(() => db.insert({
                    name: "Aamir khan",
                    email: "aamir@diagnal.com",
                    gender: 'male',
                    phone: '9696969696'

                }))
                .finally(() => res(db))
        }
    })
}

const onsuccess = (e) => {
    populateDB().then(initUI)
}


const init = () => {
    db = new DB('employee', 1, { onsuccess });
}

export default init;
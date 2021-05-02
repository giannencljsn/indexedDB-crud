import { log } from './helpers.js';

const $ = document.querySelector.bind(document);
const on = (evtName, el, cb) => el.addEventListener(evtName, cb)
let db;

/*  ------------------------ templates Start ------------------------------- */
const createTable = (heads, body, actions) => `
    <table>
        <thead>
            <tr>
                %heads%
            </tr>
        </thead>
        <tbody >
            %body%
        </tbody>
    </table>`
    .replace("%heads%", [...heads, ...actions].map(th => `<th>${th}</th>`).join(""))
    .replace("%body%", body.map(d => `
                <tr>
                    ${Object.values(d).map(v => `<td> ${v}</td>`).join("")}
                    ${actions.map(type => `<td><button data-type=${type} data-id = ${d.id}>${type}</td>`).join("")}
                </tr>
                `
    ).join(""))


const createInput = (label, value) => {
    return `
        <label for=${label}>${label}</label>
        <input name=${label} value=${value} >
    `;
}
const createUpdateForm = (data, isUpdate) => {
    const inputs = Object.keys(data)
        .filter(key => key != 'id')
        .map(key => createInput(key, data[key]));
    return `
        <div class='updateForm'>
            <form id="updateForm" data-update=${isUpdate}>
                %inputs%
                <input name="id" type="hidden" value=${data.id}>
                <button class="btn-green" >${isUpdate ? 'Update' : 'Add'}</button>
            </form>
        </div>
    `.replace('%inputs%', inputs.join(""))
}

const prepareTable = data => {
    const table = $("#table");

    if (!data.length) {
        table.classList.add('warning');
        table.textContent = "No Records Found Please reload your browser";
        return;
    }

    table.classList.remove('warning');
    const [head] = data;
    table.innerHTML = createTable(Object.keys(head), data, Object.keys(userActions));


}
/*  ------------------------ templates End---------------------------------- */

/*  ------------------------ Update Form Start ------------------------------- */


const userActions = {
    add(id) { showUpdateForm() },
    edit(id) { db.get(id, showUpdateForm) },
    remove(id) {
        showMsg("Deleting");
        setTimeout(() => { // using setTimeout just to fake some loading
            db.delete(id, updateUI)
        }, 200);
    },

}


const handleTableActions = e => {
    const { id, type } = e.target.dataset;
    type && userActions[type](parseInt(id));
}
const handleForm = e => {
    e.preventDefault();
    let { update } = e.target.dataset;
    update = update == "true" ? true : false;
    showMsg(`${update ? 'Updating' : 'Adding'} Data`)


    const values = Array.prototype.slice.call(e.target.elements).reduce((acc, curr) => {
        const { name, value } = curr;
        if (name) acc[name] = value;
        return acc;
    }, {});

    const { id, ...updates } = values;

    // using settimeout just fake some loading
    setTimeout(() => {
        if (update) db.update(parseInt(id), updates, updateUI);
        else db.insert(updates, updateUI);
    }, 200);

    sideNavClose();
}


const sideNavOpen = html => {
    const sidenav = $('#sidenav');
    $('#body').classList.add('blur');
    sidenav.querySelector('div').innerHTML = html;
    sidenav.style.display = 'block';
}

const sideNavClose = () => {
    const sidenav = $('#sidenav');
    $('#body').classList.remove('blur');
    sidenav.style.display = 'none';
}

const showUpdateForm = (err, data) => {
    if (data) {
        return sideNavOpen(createUpdateForm(data, true));
    }
    const fields = "name,email,gender,phone".split(',').reduce((acc, curr) => {
        acc[curr] = ''
        return acc;
    }, {});
    return sideNavOpen(createUpdateForm(fields, false));
}
/*  ------------------------ Update Form End---------------------------------- */



export const showMsg = (msg, type = 'info') => {
    log(msg);
    $("#body").classList.add('blur');
    const el = $('#msg');
    el.style.display = 'flex';
    el.dataset.type = type;
    el.textContent = msg;
}

export const hideMsg = () => {
    $("#body").classList.remove('blur');
    $('#msg').style.display = 'none';
}

const updateUI = () => db.getAll((err, data) => {
    log('updating ui');
    prepareTable(data);
    hideMsg();
})

const registerEvents = () => {
    on('keyup', document, e => e.key === "Escape" && sideNavClose())
    on('click', $('#table'), handleTableActions)
    on('submit', $('#sidenav'), handleForm)
    on('click', $('#sidenav .close-btn'), sideNavClose);
}



const initUI = (dataBase) => {
    showMsg('loading ui');
    db = dataBase;
    registerEvents();
    updateUI();
}

export default initUI;
const inputing = document.querySelector('#inputfield');
const button1 = document.querySelector('#button1');
const todolist = document.querySelector('#todolist');
const counting = document.querySelector('#count');
const container = document.createElement('ol');

// Connect to Ethereum provider and request accounts explicitly
async function initWeb3() {
    if (window.ethereum) {
        try {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log('MetaMask connected');
        } catch (error) {
            console.error('User denied account access', error);
        }
    } else {
        console.error('No Ethereum provider detected');
    }
}

initWeb3();

const contractAddress = '0x45b836A4a501699d428119D481186804ACeD9C9C';  
const contractABI = [
    {
        "inputs": [{ "internalType": "string", "name": "_content", "type": "string" }],
        "name": "createTask",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

const contract = new web3.eth.Contract(contractABI, contractAddress);

function gettodolist() {
    return JSON.parse(localStorage.getItem('mainlocaltodolist')) || [];
}

let localtodolist = gettodolist();
let count = localtodolist.length;

function addtodo(input) {
    counting.textContent = `${count}`;
    const creating = document.createElement('li');
    creating.innerHTML = `${input} <button class="delete">Delete</button>`;
    container.appendChild(creating);
    
    const dele = creating.querySelector(".delete");
    dele.addEventListener('click', (e) => {
        creating.remove();
        count -= 1;
        counting.textContent = `${count}`;
        const todoremove = e.target;
        const todoele = todoremove.parentElement.textContent.replace(' Delete', '').trim();
        
        const todolistindex = localtodolist.indexOf(todoele);
        if (todolistindex !== -1) {
            localtodolist.splice(todolistindex, 1);
            localStorage.setItem("mainlocaltodolist", JSON.stringify(localtodolist));
        }
    });
}

async function addTaskToBlockchain(content) {
    try {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length === 0) {
            console.error('No accounts found. Ensure MetaMask is connected.');
            return false;
        }
        await contract.methods.createTask(content).send({ from: accounts[0] });
        return true;
    } catch (error) {
        console.error('Failed to add task to blockchain:', error);
        return false;
    }
}

async function createtodo() {
    const input = inputing.value.trim();
    inputing.value = "";
    if (input && !localtodolist.includes(input)) {
        const success = await addTaskToBlockchain(input);  // Ensure MetaMask opens before adding to UI
        if (success) {
            count += 1;
            addtodo(input);  // Add to UI only if transaction succeeds
            localtodolist.push(input);
            localStorage.setItem("mainlocaltodolist", JSON.stringify(localtodolist));
        } else {
            console.error('Task not added to blockchain. Not adding to UI.');
        }
    }
}

function adder() {
    createtodo();
    if (!todolist.contains(container)) {
        todolist.appendChild(container);
    }
}

button1.addEventListener('click', () => {
    adder();
});

inputing.addEventListener('keydown', (event) => {
    if (event.code === 'Enter') {
        adder();
    }
});
    


const reload = () => {
    localtodolist.forEach((currele) => {
        addtodo(currele);
    });
    if (!todolist.contains(container)) {
        todolist.appendChild(container);
    }
};

reload();
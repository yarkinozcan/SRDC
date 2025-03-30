document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const headerMessage = document.getElementById('headerMessage');
    const loginError = document.getElementById('loginError');
    const welcomeMessage = document.getElementById('welcomeMessage');

    const sendMessageForm = document.getElementById('sendMessageForm');
    const createUsrForm = document.getElementById('createUsrForm');
    const updateUsrForm = document.getElementById('updateUsrForm');
    const listAllUsersForm = document.getElementById('listAllUsersForm');
    const userInfoDisplay = document.getElementById('userInfoDisplay');
    const inboxForm = document.getElementById('inboxForm');
    const outboxForm = document.getElementById('outboxForm');
    const inboxInside = document.getElementById('inboxInside');
    const outboxInside = document.getElementById('outboxInside');

    const headerButtons = document.getElementById('headerButtons');
    const sendMsgBtn = document.getElementById('sendMsgBtn');
    const createUsrBtn = document.getElementById('createUsrBtn');
    const listAllUsersBtn = document.getElementById('listAllUsersBtn');
    const viewUserInfoBtn = document.getElementById('viewUserInfoBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    const updateUserForm = document.getElementById('updateUserForm');
    const sendMsgForm = document.getElementById('sendMsgForm');
    const createUserForm = document.getElementById('createUserForm');
    const inboxMessages = document.querySelector('#inboxMessages tbody');
    const outboxMessages = document.querySelector('#outboxMessages tbody');

    const sendMsgSuccess = document.getElementById('sendMsgSuccess');
    const sendMsgError = document.getElementById('sendMsgError');
    const createUsrSuccess = document.getElementById('createUsrSuccess');
    const createUsrError = document.getElementById('createUsrError');
    const updateUsrSuccess = document.getElementById('updateUsrSuccess');

    const userPagination = document.getElementById('userPagination');
    const inboxPagination = document.getElementById('inboxPagination');
    const outboxPagination = document.getElementById('outboxPagination');

    const nextUserPageBtn = document.getElementById('nextUserPage');
    const prevUserPageBtn = document.getElementById('prevUserPage');
    const nextInboxPageBtn = document.getElementById('nextInboxPage');
    const prevInboxPageBtn = document.getElementById('prevInboxPage');
    const nextOutboxPageBtn = document.getElementById('nextOutboxPage');
    const prevOutboxPageBtn = document.getElementById('prevOutboxPage');

    const userPageInfo = document.getElementById('userPageInfo');
    const inboxPageInfo = document.getElementById('inboxPageInfo');
    const outboxPageInfo = document.getElementById('outboxPageInfo');
    const deleteConfirmationModal = document.getElementById('deleteConfirmationModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

    let userToDelete = '';
    let currentUserPage = 0;
    let totalUserPages = 0;
    let currentInboxPage = 0;
    let totalInboxPages = 0;
    let currentOutboxPage = 0;
    let totalOutboxPages = 0;
    let sortedInboxMessages = [];
    let sortedOutboxMessages = [];
    let inboxFilterField = '';
    let inboxFilterValue = '';
    let outboxFilterField = '';
    let outboxFilterValue = '';

    const pageSize = 5;

    function showElement(element) {
        element.classList.remove('hidden');
    }

    function hideElement(element) {
        element.classList.add('hidden');
    }

    function hideAllForms() {
        hideElement(welcomeMessage);
        hideElement(sendMessageForm);
        hideElement(createUsrForm);
        hideElement(updateUsrForm);
        hideElement(listAllUsersForm);
        hideElement(userInfoDisplay);
        hideElement(inboxForm);
        hideElement(outboxForm);
        hideElement(sendMsgSuccess);
        hideElement(createUsrSuccess);
    }

    function showAlert(message) {
        alertMessage.textContent = message;
        showElement(alertBox);
        setTimeout(() => {
            hideElement(alertBox);
        }, 3000);
    }

    function updatePaginationButtons(currentPage, totalPages, prevBtn, nextBtn, pageInfo) {
        pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages}`;
        if (currentPage === 0) {
            hideElement(prevBtn);
        } else {
            showElement(prevBtn);
        }
        if (currentPage === totalPages - 1) {
            hideElement(nextBtn);
        } else {
            showElement(nextBtn);
        }
    }

    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:8081/api/login', true);
        setAuthHeader(xhr);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function() {
            if (xhr.status === 200) {
                token = xhr.responseText;
                localStorage.setItem('jwtToken', token);
                const user = parseJWT(token);
                showElement(headerButtons);
                hideElement(loginForm);
                hideElement(headerMessage);
                hideElement(loginError);
                showElement(welcomeMessage);
                if(user.admin){
                    showElement(createUsrBtn);
                    showElement(listAllUsersBtn);
                }
                welcomeMessage.textContent = `Welcome, ${user.name}`;
                displayUserInfo(user);
                showAlert('Login successful');
                fetchAllUsers(); // Fetch all users for dropdowns
            } else {
                showElement(loginError);
            }
        };

        xhr.onerror = function() {
            console.error('Request failed');
        };

        xhr.send(JSON.stringify({ username, password }));
    });

    function parseJWT(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    }

    token = localStorage.getItem('token');
    if (token && isTokenValid(token)) {
        // Valid Token
        const user = parseToken(token);
        hideElement(loginForm);
        hideElement(headerMessage);
        showElement(headerButtons);
        if (user.admin) {
            showElement(createUsrBtn);
            showElement(listAllUsersBtn);
        }
        welcomeMessage.textContent = `Welcome, ${user.name}`;
        displayUserInfo(user);
        fetchAllUsers(); // Fetch all users for dropdowns
    } else {
        // Invalid Token
        localStorage.removeItem('token');
    }

    // Parse Token Function
    function parseToken(token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return {
            username: payload.username,
            name: payload.name,
            surname: payload.surname,
            email: payload.email,
            address: payload.address,
            gender: payload.gender,
            birthdate: payload.birthdate,
            admin: payload.admin,
        };
    }

    // Token Validation Function
    function isTokenValid(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        } catch (e) {
            return false;
        }
    }

    function displayUserInfo(user) {
        document.getElementById('currentUsername').textContent = user.username;
        document.getElementById('currentName').textContent = user.name;
        document.getElementById('currentSurname').textContent = user.surname;
        document.getElementById('currentEmail').textContent = user.email;
        document.getElementById('currentAddress').textContent = user.address;
        document.getElementById('currentGender').textContent = user.gender;
        document.getElementById('currentBirthdate').textContent = user.birthdate;
        document.getElementById('currentAdmin').textContent = user.admin ? 'Yes' : 'No';
    }

    document.getElementById('sortInboxAscBtn').addEventListener('click', function() {
        sortMessages('inbox', 'asc');
    });

    document.getElementById('sortInboxDescBtn').addEventListener('click', function() {
        sortMessages('inbox', 'desc');
    });

    document.getElementById('sortOutboxAscBtn').addEventListener('click', function() {
        sortMessages('outbox', 'asc');
    });

    document.getElementById('sortOutboxDescBtn').addEventListener('click', function() {
        sortMessages('outbox', 'desc');
    });

    function sortMessages(type, order) {
        const currentUser = parseJWT(token);
        const username = currentUser.username;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `http://localhost:8081/api/message/${username}?page=0&size=10000&field=${type === 'inbox' ? inboxFilterField : outboxFilterField}&value=${type === 'inbox' ? inboxFilterValue : outboxFilterValue}&inbox=${(type === 'inbox')}`, true);
        setAuthHeader(xhr);
        xhr.onload = function() {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                let messages = response.content;
                messages.sort((a, b) => {
                    const dateA = new Date(a.timestamp);
                    const dateB = new Date(b.timestamp);
                    return order === 'asc' ? dateA - dateB : dateB - dateA;
                });
                if (type === 'inbox') {
                    sortedInboxMessages = messages;
                    currentInboxPage = 0;
                    totalInboxPages = Math.ceil(sortedInboxMessages.length / pageSize);
                    displayInboxMessagesPaginated(currentInboxPage);
                } else {
                    sortedOutboxMessages = messages;
                    currentOutboxPage = 0;
                    totalOutboxPages = Math.ceil(sortedOutboxMessages.length / pageSize);
                    displayOutboxMessagesPaginated(currentOutboxPage);
                }
            } else {
                alert(`Failed to fetch ${type} messages`);
            }
        };

        xhr.onerror = function() {
            console.error('Request failed');
        };

        xhr.send();
    }

    function displayInboxMessagesPaginated(page) {
        inboxMessages.innerHTML = '';
        const start = page * pageSize;
        const end = start + pageSize;
        const paginatedMessages = sortedInboxMessages.slice(start, end);
        if (paginatedMessages.length > 0) {
            paginatedMessages.forEach(message => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${message.sender}</td>
                    <td>${message.title}</td>
                    <td>${message.body}</td>
                    <td>${message.timestamp.split("T")[0] + ", " + message.timestamp.split("T")[1].split(".")[0]}</td>
                `;
                inboxMessages.appendChild(row);
            });
            showElement(inboxInside);
        }
        showElement(inboxPagination);
        updatePaginationButtons(currentInboxPage, totalInboxPages, prevInboxPageBtn, nextInboxPageBtn, inboxPageInfo);
    }

    function displayOutboxMessagesPaginated(page) {
        outboxMessages.innerHTML = '';
        const start = page * pageSize;
        const end = start + pageSize;
        const paginatedMessages = sortedOutboxMessages.slice(start, end);
        if (paginatedMessages.length > 0) {
            paginatedMessages.forEach(message => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${message.receiver}</td>
                    <td>${message.title}</td>
                    <td>${message.body}</td>
                    <td>${message.timestamp.split("T")[0] + ", " + message.timestamp.split("T")[1].split(".")[0]}</td>
                `;
                outboxMessages.appendChild(row);
            });
            showElement(outboxInside);
        }
        showElement(outboxPagination);
        updatePaginationButtons(currentOutboxPage, totalOutboxPages, prevOutboxPageBtn, nextOutboxPageBtn, outboxPageInfo);
    }

    function logout(){
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `http://localhost:8081/api/logout`, true);
        setAuthHeader(xhr);
        xhr.send();
    }

    logoutBtn.addEventListener('click', function() {
        logout();
        localStorage.removeItem('jwtToken');
        showElement(loginForm);
        showElement(headerMessage);
        hideElement(headerButtons);
        hideElement(createUsrBtn);
        hideElement(listAllUsersBtn);
        hideElement(welcomeMessage);
        hideAllForms();
        token = null;
        showAlert('Logout successful');
    });

    sendMsgBtn.addEventListener('click', function() {
        hideAllForms();
        showElement(sendMessageForm);
    });

    createUsrBtn.addEventListener('click', function() {
        hideAllForms();
        showElement(createUsrForm);
    });

    listAllUsersBtn.addEventListener('click', function() {
        hideAllForms();
        currentUserPage = 0;
        listAllUsers(currentUserPage);
    });

    viewUserInfoBtn.addEventListener('click', function() {
        hideAllForms();
        displayUserInfo(parseJWT(token));
        showElement(userInfoDisplay);
    });

    // Fetch and populate all users for dropdowns
    function fetchAllUsers() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://localhost:8081/api/users/get-all-users?size=10000', true); // Fetch all users, assuming max 10000 users
        setAuthHeader(xhr);
        xhr.onload = function() {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                populateUserDropdowns(response.content);
            } else {
                alert('Failed to fetch users');
            }
        };

        xhr.onerror = function() {
            console.error('Request failed');
        };

        xhr.send();
    }

    function populateUserDropdowns(users) {
        const deleteUsername = document.getElementById('deleteUsername');
        const updateUsername = document.getElementById('updateUsername');
        const receiverUsername = document.getElementById('receiver');
        deleteUsername.innerHTML = '';
        updateUsername.innerHTML = '';
        receiverUsername.innerHTML = '';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.username;
            option.textContent = user.username;
            deleteUsername.appendChild(option);
            updateUsername.appendChild(option.cloneNode(true));
            receiverUsername.appendChild(option.cloneNode(true));
        });
    }

    function fetchUserDetails(username) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `http://localhost:8081/api/users/get-user/${username}`, true);
        setAuthHeader(xhr);
        xhr.onload = function() {
            if (xhr.status === 200) {
                const user = JSON.parse(xhr.responseText);
                populateUserDetails(user);
            } else {
                alert('Failed to fetch user details');
            }
        };

        xhr.onerror = function() {
            console.error('Request failed');
        };

        xhr.send();
    }

    function populateUserDetails(user) {
        document.getElementById('updateUsername').value = user.username;
        document.getElementById('updateName').value = user.name;
        document.getElementById('updateSurname').value = user.surname;
        document.getElementById('updateEmail').value = user.email;
        document.getElementById('updateAddress').value = user.address;
        document.getElementById('updateGender').value = user.gender;
        document.getElementById('updateBirthdate').value = user.birthdate;
        document.getElementById('updateAdmin').checked = user.admin;
    }

    document.getElementById('filterValue').addEventListener('input', function() {
        currentUserPage = 0; // Reset to the first page when filtering
        listAllUsers(currentUserPage);
    });

    document.getElementById('filterValueInbox').addEventListener('input', function() {
        currentInboxPage = 0; // Reset to the first page when filtering
        inboxFilterField = document.getElementById('filterFieldInbox').value;
        inboxFilterValue = document.getElementById('filterValueInbox').value;
        getInbox(currentInboxPage, inboxFilterField, inboxFilterValue);
    });

    document.getElementById('filterValueOutbox').addEventListener('input', function() {
        currentOutboxPage = 0; // Reset to the first page when filtering
        outboxFilterField = document.getElementById('filterFieldOutbox').value;
        outboxFilterValue = document.getElementById('filterValueOutbox').value;
        getOutbox(currentOutboxPage, outboxFilterField, outboxFilterValue);
    });

    function listAllUsers(page) {
        const filterField = document.getElementById('filterField').value;
        const filterValue = document.getElementById('filterValue').value;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `http://localhost:8081/api/users/get-all-users?page=${page}&size=5&field=${filterField}&value=${filterValue}`, true);
        setAuthHeader(xhr);
        xhr.onload = function() {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                displayAllUsers(response.content);
                totalUserPages = response.totalPages;
                updatePaginationButtons(currentUserPage, totalUserPages, prevUserPageBtn, nextUserPageBtn, userPageInfo);
            } else {
                alert('Failed to fetch users');
            }
        };

        xhr.onerror = function() {
            console.error('Request failed');
        };

        xhr.send();
    }

    function setAuthHeader(xhr) {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        }
    }

    function displayAllUsers(users) {
        const allUsersList = document.querySelector('#allUsersList tbody');
        allUsersList.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.name}</td>
                <td>${user.surname}</td>
                <td>${user.email}</td>
                <td>${user.address}</td>
                <td>${user.gender}</td>
                <td>${user.birthdate}</td>
                <td>${user.admin ? 'Yes' : 'No'}</td>
                <td>
                    <button class="updateUserBtn" data-username="${user.username}">Update</button>
                </td>
                <td>
                    <button class="deleteUserBtn" data-username="${user.username}">Delete</button>
                </td>
            `;
            allUsersList.appendChild(row);
        });

        document.querySelectorAll('.updateUserBtn').forEach(button => {
            button.addEventListener('click', function() {
                const username = this.getAttribute('data-username');
                fetchUserDetails(username);
                showUpdateForm();
            });
        });

        document.querySelectorAll('.deleteUserBtn').forEach(button => {
            button.addEventListener('click', function() {
                userToDelete = this.getAttribute('data-username');
                showDeleteElement(deleteConfirmationModal);
            });
        });

        showElement(listAllUsersForm);
        showElement(userPagination);
    }

    confirmDeleteBtn.addEventListener('click', function() {
        hideDeleteElement(deleteConfirmationModal);
        deleteUser(userToDelete);
        userToDelete = '';
    });

    function showDeleteElement(element) {
        element.classList.remove('hidden');
        element.style.display = 'block'; // Ensure element is displayed
    }

    function hideDeleteElement(element) {
        element.classList.add('hidden');
        element.style.display = 'none'; // Ensure element is hidden
    }

    cancelDeleteBtn.addEventListener('click', function() {
        hideDeleteElement(deleteConfirmationModal);
        userToDelete = '';
    });

    function showUpdateForm() {
        hideAllForms();
        showElement(updateUsrForm);
    }

    function deleteUser(username) {
        const xhr = new XMLHttpRequest();
        xhr.open('DELETE', `http://localhost:8081/api/users/delete-by-username/${username}`, true);
        setAuthHeader(xhr);
        xhr.onload = function() {
            if (xhr.status === 204) {
                fetchAllUsers();
                listAllUsers(currentUserPage); // Refresh user lists
            } else {
                alert('Failed to delete user');
            }
        };

        xhr.onerror = function() {
            console.error('Request failed');
        };

        xhr.send();
    }

    updateUserForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('updateUsername').value;
        const name = document.getElementById('updateName').value;
        const surname = document.getElementById('updateSurname').value;
        const password = document.getElementById('updatePassword').value;
        const email = document.getElementById('updateEmail').value;
        const address = document.getElementById('updateAddress').value;
        const gender = document.getElementById('updateGender').value;
        const birthdate = document.getElementById('updateBirthdate').value;
        const admin = document.getElementById('updateAdmin').checked;
        updateUser(username, name, surname, password, email, address, gender, birthdate, admin);
    });

    function updateUser(username, name, surname, password, email, address, gender, birthdate, admin) {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', `http://localhost:8081/api/users/update-user/${username}`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        setAuthHeader(xhr);
        xhr.onload = function() {
            if (xhr.status === 200) {
                fetchAllUsers(); // Refresh user lists
                showElement(updateUsrSuccess);
            } else {
                alert('Failed to update user');
            }
        };

        xhr.onerror = function() {
            console.error('Request failed');
        };

        xhr.send(JSON.stringify({ username, name, surname, password, email, address, gender, birthdate, admin }));
    }

    // Send Message function
    sendMsgForm.addEventListener('submit', function(event) {
        event.preventDefault();
        sendMessage();
    });

    function sendMessage() {
        const currentUser = parseJWT(token);
        const receiverName = document.getElementById('receiver').value;
        const titleName = document.getElementById('title').value;
        const bodyText = document.getElementById('messageContent').value;
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:8081/api/message/send-msg', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        setAuthHeader(xhr);
        xhr.onload = function() {
            if (xhr.status === 201) {
                showElement(sendMsgSuccess);
                hideElement(sendMsgError);
            } else if(xhr.status === 404){
                showElement(sendMsgError);
                hideElement(sendMsgSuccess);
            } else {
                alert('Failed to send message');
            }
        };

        xhr.onerror = function() {
            console.error('Request failed');
        };

        xhr.send(JSON.stringify({ sender: currentUser.username, receiver: receiverName, title: titleName, body: bodyText }));
    }

    // Read Messages functions
    document.getElementById('getInboxBtn').addEventListener('click', function() {
        currentInboxPage = 0;
        inboxFilterField = document.getElementById('filterFieldInbox').value;
        inboxFilterValue = document.getElementById('filterValueInbox').value;
        hideAllForms();
        getInbox(currentInboxPage, inboxFilterField, inboxFilterValue);
    });

    document.getElementById('getOutboxBtn').addEventListener('click', function() {
        currentOutboxPage = 0;
        outboxFilterField = document.getElementById('filterFieldOutbox').value;
        outboxFilterValue = document.getElementById('filterValueOutbox').value;
        hideAllForms();
        getOutbox(currentOutboxPage, outboxFilterField, outboxFilterValue);
    });

    function getInbox(page, filterField = '', filterValue = '') {
        inboxFilterField = filterField;
        inboxFilterValue = filterValue;
        const username = parseJWT(token).username;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `http://localhost:8081/api/message/${username}?page=${page}&size=5&field=${filterField}&value=${filterValue}&inbox=true`, true);
        setAuthHeader(xhr);
        xhr.onload = function() {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                displayInboxMessages(response.content);
                totalInboxPages = response.totalPages;
                updatePaginationButtons(currentInboxPage, totalInboxPages, prevInboxPageBtn, nextInboxPageBtn, inboxPageInfo);
                showElement(inboxForm);
            } else {
                alert('Failed to fetch inbox messages');
                console.error(xhr.responseText);
            }
        };

        xhr.onerror = function() {
            console.error('Request failed');
        };

        xhr.send();
    }

    function getOutbox(page, filterField = '', filterValue = '') {
        outboxFilterField = filterField;
        outboxFilterValue = filterValue;
        const username = parseJWT(token).username;
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `http://localhost:8081/api/message/${username}?page=${page}&size=5&field=${filterField}&value=${filterValue}&inbox=false`, true);
        setAuthHeader(xhr);
        xhr.onload = function() {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                displayOutboxMessages(response.content);
                totalOutboxPages = response.totalPages;
                updatePaginationButtons(currentOutboxPage, totalOutboxPages, prevOutboxPageBtn, nextOutboxPageBtn, outboxPageInfo);
                showElement(outboxForm);
            } else {
                alert('Failed to fetch outbox messages');
                console.error(xhr.responseText);
            }
        };

        xhr.onerror = function() {
            console.error('Request failed');
        };

        xhr.send();
    }

    function displayInboxMessages(messages) {
        inboxMessages.innerHTML = '';
        if (messages.length > 0) {
            messages.forEach(message => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${message.sender}</td>
                    <td>${message.title}</td>
                    <td>${message.body}</td>
                    <td>${message.timestamp.split("T")[0] + ", " + message.timestamp.split("T")[1].split(".")[0]}</td>
                `;
                inboxMessages.appendChild(row);
            });
            showElement(inboxInside);
        }
        showElement(inboxPagination);
    }

    function displayOutboxMessages(messages) {
        outboxMessages.innerHTML = '';
        if (messages.length > 0) {
            messages.forEach(message => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${message.receiver}</td>
                    <td>${message.title}</td>
                    <td>${message.body}</td>
                    <td>${message.timestamp.split("T")[0] + ", " + message.timestamp.split("T")[1].split(".")[0]}</td>
                `;
                outboxMessages.appendChild(row);
            });
            showElement(outboxInside);
        }
        showElement(outboxPagination);
    }

    // Create User function
    createUserForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('newUsername').value;
        const password = document.getElementById('newPassword').value;
        const name = document.getElementById('newName').value;
        const surname = document.getElementById('newSurname').value;
        const email = document.getElementById('newEmail').value;
        const address = document.getElementById('newAddress').value;
        const gender = document.getElementById('newGender').value;
        const birthdate = document.getElementById('newBirthdate').value;
        const admin = document.getElementById('newAdmin').checked;
        createUser(username, password, email, address, gender, birthdate, admin, name, surname);
    });
    function createUser(username, password, email, address, gender, birthdate, admin, name, surname) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'http://localhost:8081/api/users/create-user', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        setAuthHeader(xhr);
        xhr.onload = function() {
            if (xhr.status === 201) {
                fetchAllUsers();
                showElement(createUsrSuccess);
                hideElement(createUsrError);
            } else if(xhr.status === 409) {
                showElement(createUsrError);
                hideElement(createUsrSuccess);
            } else {
                alert('Failed to create user');
            }
        };
        xhr.onerror = function() {
            console.error('Request failed');
        };
        xhr.send(JSON.stringify({ username, password, email, address, gender, birthdate, admin, name, surname }));
    }

    nextUserPageBtn.addEventListener('click', function() {
        if (currentUserPage < totalUserPages - 1) {
            currentUserPage++;
            listAllUsers(currentUserPage);
        }
    });

    prevUserPageBtn.addEventListener('click', function() {
        if (currentUserPage > 0) {
            currentUserPage--;
            listAllUsers(currentUserPage);
        }
    });

    nextInboxPageBtn.addEventListener('click', function() {
        if (currentInboxPage < totalInboxPages - 1) {
            currentInboxPage++;
            getInbox(currentInboxPage, inboxFilterField, inboxFilterValue);
        }
    });

    prevInboxPageBtn.addEventListener('click', function() {
        if (currentInboxPage > 0) {
            currentInboxPage--;
            getInbox(currentInboxPage, inboxFilterField, inboxFilterValue);
        }
    });

    nextOutboxPageBtn.addEventListener('click', function() {
        if (currentOutboxPage < totalOutboxPages - 1) {
            currentOutboxPage++;
            getOutbox(currentOutboxPage, outboxFilterField, outboxFilterValue);
        }
    });

    prevOutboxPageBtn.addEventListener('click', function() {
        if (currentOutboxPage > 0) {
            currentOutboxPage--;
            getOutbox(currentOutboxPage, outboxFilterField, outboxFilterValue);
        }
    });
});

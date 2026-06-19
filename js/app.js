// ============ STATE MANAGEMENT ============
let appState = {
    ownerPhone: localStorage.getItem('ownerPhone') || '+1 (555) 000-0000',
    contacts: JSON.parse(localStorage.getItem('contacts')) || [
        { id: 1, name: 'Alice Johnson', phone: '+1 (555) 123-4567' },
        { id: 2, name: 'Bob Smith', phone: '+1 (555) 987-6543' },
        { id: 3, name: 'Carol White', phone: '+1 (555) 456-7890' }
    ],
    messages: JSON.parse(localStorage.getItem('messages')) || {
        '+1 (555) 123-4567': [
            { id: 1, text: 'Hi! How are you?', sent: false, timestamp: Date.now() - 3600000 },
            { id: 2, text: 'I\'m doing great! How about you?', sent: true, timestamp: Date.now() - 3480000 }
        ],
        '+1 (555) 987-6543': [
            { id: 3, text: 'Thanks for the message!', sent: false, timestamp: Date.now() - 1800000 },
            { id: 4, text: 'Great! I just sent you a file. Check your inbox!', sent: true, timestamp: Date.now() - 1740000 }
        ]
    },
    selectedContact: null,
    composeFiles: [],
    messageFiles: {},
    deleteContactId: null
};

// ============ INITIALIZATION ============
function init() {
    updateOwnerPhoneDisplay();
    renderContacts();
    setupEventListeners();
}

function setupEventListeners() {
    document.getElementById('composeMessage').addEventListener('input', (e) => {
        document.getElementById('charCount').textContent = e.target.value.length + ' characters';
    });
}

// ============ PAGE NAVIGATION ============
function switchPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    if (page === 'messages') {
        document.getElementById('messagesPage').classList.add('active');
        document.querySelector('[onclick="switchPage(\'messages\')"']').classList.add('active');
    } else {
        document.getElementById('composePage').classList.add('active');
        document.querySelector('[onclick="switchPage(\'compose\')"']').classList.add('active');
        resetComposeForm();
    }
}

// ============ OWNER PHONE MANAGEMENT ============
function updateOwnerPhoneDisplay() {
    document.getElementById('ownerPhoneDisplay').textContent = appState.ownerPhone;
}

function openOwnerPhoneModal() {
    document.getElementById('ownerPhoneInput').value = appState.ownerPhone;
    document.getElementById('ownerPhoneModal').classList.add('active');
}

function closeOwnerPhoneModal() {
    document.getElementById('ownerPhoneModal').classList.remove('active');
}

function saveOwnerPhone() {
    const phone = document.getElementById('ownerPhoneInput').value.trim();
    if (!phone) {
        showToast('Please enter a phone number', 'error');
        return;
    }
    appState.ownerPhone = phone;
    localStorage.setItem('ownerPhone', phone);
    updateOwnerPhoneDisplay();
    closeOwnerPhoneModal();
    showToast('Phone number updated!', 'success');
}

// ============ CONTACT MANAGEMENT ============
function renderContacts() {
    const contactList = document.getElementById('contactList');
    contactList.innerHTML = '';

    appState.contacts.forEach(contact => {
        const div = document.createElement('div');
        div.className = `contact-item ${appState.selectedContact?.id === contact.id ? 'active' : ''}`;
        div.innerHTML = `
            <span class="contact-name" onclick="selectContact(${contact.id})">${contact.name}<br><small style="font-size: 12px; font-weight: 400;">${contact.phone}</small></span>
            <button class="contact-delete-btn" onclick="openDeleteContactModal(${contact.id}, '${contact.name}')">×</button>
        `;
        contactList.appendChild(div);
    });
}

function selectContact(contactId) {
    const contact = appState.contacts.find(c => c.id === contactId);
    if (contact) {
        appState.selectedContact = contact;
        renderContacts();
        renderMessages();
        document.getElementById('chatName').textContent = contact.name;
        document.getElementById('chatPhone').textContent = contact.phone;
        switchPage('messages');
    }
}

function openAddContactModal() {
    document.getElementById('contactName').value = '';
    document.getElementById('contactPhone').value = '';
    document.getElementById('addContactModal').classList.add('active');
}

function closeAddContactModal() {
    document.getElementById('addContactModal').classList.remove('active');
}

function saveContact() {
    const name = document.getElementById('contactName').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();

    if (!name || !phone) {
        showToast('Please fill in all fields', 'error');
        return;
    }

    const newContact = {
        id: Math.max(...appState.contacts.map(c => c.id), 0) + 1,
        name,
        phone
    };

    appState.contacts.push(newContact);
    localStorage.setItem('contacts', JSON.stringify(appState.contacts));
    renderContacts();
    closeAddContactModal();
    showToast(`Contact "${name}" added!`, 'success');
}

function openDeleteContactModal(contactId, contactName) {
    appState.deleteContactId = contactId;
    document.getElementById('deleteContactName').textContent = contactName;
    document.getElementById('deleteContactModal').classList.add('active');
}

function closeDeleteContactModal() {
    document.getElementById('deleteContactModal').classList.remove('active');
    appState.deleteContactId = null;
}

function confirmDeleteContact() {
    const contactId = appState.deleteContactId;
    const contact = appState.contacts.find(c => c.id === contactId);

    appState.contacts = appState.contacts.filter(c => c.id !== contactId);
    localStorage.setItem('contacts', JSON.stringify(appState.contacts));

    if (appState.selectedContact?.id === contactId) {
        appState.selectedContact = null;
        document.getElementById('chatName').textContent = 'Select a contact';
        document.getElementById('chatPhone').textContent = '';
        document.getElementById('messagesArea').innerHTML = '';
    }

    renderContacts();
    closeDeleteContactModal();
    showToast(`Contact "${contact.name}" deleted!`, 'success');
}

// ============ MESSAGE MANAGEMENT ============
function renderMessages() {
    if (!appState.selectedContact) {
        document.getElementById('messagesArea').innerHTML = '<p style="text-align: center; color: var(--gray-medium);">Select a contact to start messaging</p>';
        return;
    }

    const phone = appState.selectedContact.phone;
    const messages = appState.messages[phone] || [];
    const messagesArea = document.getElementById('messagesArea');
    messagesArea.innerHTML = '';

    messages.forEach(msg => {
        const div = document.createElement('div');
        div.className = `message ${msg.sent ? 'sent' : 'received'}`;

        let content = `<div class="message-bubble">${escapeHtml(msg.text)}`;

        if (msg.files && msg.files.length > 0) {
            msg.files.forEach(file => {
                const icon = getFileIcon(file.type);
                content += `<div class="message-attachment"><span class="attachment-icon">${icon}</span> ${escapeHtml(file.name)}</div>`;

                if (file.type.startsWith('image/')) {
                    content += `<div class="attachment-preview"><img src="${file.data}" alt="Image"></div>`;
                } else if (file.type.startsWith('video/')) {
                    content += `<div class="attachment-preview"><video controls style="width: 100%;"><source src="${file.data}" type="${file.type}"></video></div>`;
                }
            });
        }

        content += `</div><div class="message-time">${formatTime(msg.timestamp)}</div>`;
        div.innerHTML = content;
        messagesArea.appendChild(div);
    });

    messagesArea.scrollTop = messagesArea.scrollHeight;
}

function sendMessage() {
    const text = document.getElementById('messageInput').value.trim();
    if (!text && appState.messageFiles.length === 0) {
        showToast('Please type a message or attach a file', 'warning');
        return;
    }

    if (!appState.selectedContact) {
        showToast('Please select a contact', 'error');
        return;
    }

    const phone = appState.selectedContact.phone;
    if (!appState.messages[phone]) {
        appState.messages[phone] = [];
    }

    const message = {
        id: Date.now(),
        text: text,
        sent: true,
        timestamp: Date.now(),
        files: appState.messageFiles
    };

    appState.messages[phone].push(message);
    localStorage.setItem('messages', JSON.stringify(appState.messages));

    document.getElementById('messageInput').value = '';
    appState.messageFiles = [];
    renderFileList();
    renderMessages();
    showToast('Message sent!', 'success');

    // Simulate receiving a reply after 2 seconds
    setTimeout(() => {
        const replies = [
            'Thanks for the message!',
            'Got it! Thanks for sending that.',
            'I agree completely',
            'Sounds good to me!',
            'Perfect! I\'ll check it out.'
        ];
        const reply = {
            id: Date.now(),
            text: replies[Math.floor(Math.random() * replies.length)],
            sent: false,
            timestamp: Date.now(),
            files: []
        };
        appState.messages[phone].push(reply);
        localStorage.setItem('messages', JSON.stringify(appState.messages));
        renderMessages();
    }, 2000);
}

// ============ FILE HANDLING ============
function getFileIcon(fileType) {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    return '📎';
}

function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            appState.messageFiles.push({
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result
            });
            renderFileList();
        };
        reader.readAsDataURL(file);
    });
    event.target.value = '';
}

function renderFileList() {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';

    appState.messageFiles.forEach((file, index) => {
        const tag = document.createElement('div');
        tag.className = 'file-tag';
        tag.innerHTML = `
            ${getFileIcon(file.type)} ${escapeHtml(file.name)}
            <span class="file-tag-remove" onclick="removeMessageFile(${index})">×</span>
        `;
        fileList.appendChild(tag);
    });
}

function removeMessageFile(index) {
    appState.messageFiles.splice(index, 1);
    renderFileList();
}

// ============ COMPOSE PAGE ============
function handleComposeDragOver(event) {
    event.preventDefault();
    document.getElementById('composeFileUploadArea').classList.add('dragging');
}

function handleComposeDragLeave(event) {
    event.preventDefault();
    document.getElementById('composeFileUploadArea').classList.remove('dragging');
}

function handleComposeDrop(event) {
    event.preventDefault();
    document.getElementById('composeFileUploadArea').classList.remove('dragging');
    const files = Array.from(event.dataTransfer.files);
    handleComposeFiles(files);
}

function handleComposeFileSelect(event) {
    const files = Array.from(event.target.files);
    handleComposeFiles(files);
    event.target.value = '';
}

function handleComposeFiles(files) {
    files.forEach(file => {
        if (file.size > 25 * 1024 * 1024) {
            showToast(`File "${file.name}" is too large (max 25MB)`, 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            appState.composeFiles.push({
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result
            });
            renderComposeFileList();
        };
        reader.readAsDataURL(file);
    });
}

function renderComposeFileList() {
    const fileList = document.getElementById('composeFileList');
    fileList.innerHTML = '';

    appState.composeFiles.forEach((file, index) => {
        const tag = document.createElement('div');
        tag.className = 'file-tag';
        tag.innerHTML = `
            ${getFileIcon(file.type)} ${escapeHtml(file.name)}
            <span class="file-tag-remove" onclick="removeComposeFile(${index})">×</span>
        `;
        fileList.appendChild(tag);
    });
}

function removeComposeFile(index) {
    appState.composeFiles.splice(index, 1);
    renderComposeFileList();
}

function sendComposeMessage() {
    const channel = document.querySelector('input[name="channel"]:checked').value;
    const recipient = document.getElementById('composeRecipient').value.trim();
    const subject = document.getElementById('composeSubject').value.trim();
    const message = document.getElementById('composeMessage').value.trim();

    if (!recipient) {
        showToast('Please enter a recipient', 'error');
        return;
    }

    if (!message && appState.composeFiles.length === 0) {
        showToast('Please type a message or attach a file', 'error');
        return;
    }

    if (channel === 'email' && !subject) {
        showToast('Please enter a subject for email', 'error');
        return;
    }

    // Add to messages
    if (!appState.messages[recipient]) {
        appState.messages[recipient] = [];
    }

    const msg = {
        id: Date.now(),
        text: message,
        subject: subject,
        channel: channel,
        sent: true,
        timestamp: Date.now(),
        files: appState.composeFiles
    };

    appState.messages[recipient].push(msg);
    localStorage.setItem('messages', JSON.stringify(appState.messages));

    showToast(`Message sent via ${channel.toUpperCase()}!`, 'success');
    resetComposeForm();
}

function resetComposeForm() {
    document.getElementById('composeRecipient').value = '';
    document.getElementById('composeSubject').value = '';
    document.getElementById('composeMessage').value = '';
    document.getElementById('charCount').textContent = '0 characters';
    appState.composeFiles = [];
    renderComposeFileList();
}

// ============ UTILITIES ============
function formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return new Date(timestamp).toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ============ CLOSE MODALS ON OUTSIDE CLICK ============
window.addEventListener('click', (e) => {
    if (e.target.id === 'addContactModal') closeAddContactModal();
    if (e.target.id === 'ownerPhoneModal') closeOwnerPhoneModal();
    if (e.target.id === 'deleteContactModal') closeDeleteContactModal();
});

// ============ INITIALIZE APP ============
init();
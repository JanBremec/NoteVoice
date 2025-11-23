// Toast notification system
function showToast(title, message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'check',
        error: 'error',
        warning: 'warning',
        info: 'info'
    };

    toast.innerHTML = `
                <div class="toast-icon">
                    <span class="material-symbols-outlined">${icons[type] || 'info'}</span>
                </div>
                <div class="toast-content">
                    <h4 class="toast-title">${title}</h4>
                    <p class="toast-message">${message}</p>
                </div>
                <button class="toast-close" aria-label="Zapri obvestilo">
                    <span class="material-symbols-outlined">close</span>
                </button>
            `;

    container.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }, 5000);

    // Close button functionality
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    });
}

// --- FILE EXPLORER LOGIC ---
const fileExplorer = document.getElementById('file-explorer');
const fileSearch = document.getElementById('file-search');

// Dummy data for file explorer
const dummyFileData = {
    "Matematika": [
        { name: "Algebra - Osnove", size: "2.4 MB", type: "pdf", date: "2023-10-15" },
        { name: "Geometrija - Trikotniki", size: "1.8 MB", type: "docx", date: "2023-11-02" },
        { name: "Statistika - Uvod", size: "3.2 MB", type: "pptx", date: "2023-09-28" }
    ],
    "Biologija": [
        { name: "Celična struktura", size: "4.1 MB", type: "pdf", date: "2023-10-20" },
        { name: "Genetika - Osnove", size: "2.7 MB", type: "docx", date: "2023-11-05" },
        { name: "Ekologija - Ekosistemi", size: "0.8 MB", type: "txt", date: "2023-09-15" }
    ],
    "Zgodovina": [
        { name: "Srednji vek - Pregled", size: "5.2 MB", type: "pdf", date: "2023-10-10" },
        { name: "Renesansa - Umetnost", size: "4.5 MB", type: "pptx", date: "2023-11-12" }
    ],
    "Fizika": [
        { name: "Mehanika - Newtonovi zakoni", size: "3.6 MB", type: "pdf", date: "2023-10-25" },
        { name: "Elektrika - Osnove", size: "2.1 MB", type: "docx", date: "2023-11-08" }
    ],
    "Kemija": [
        { name: "Periodni sistem", size: "1.9 MB", type: "pdf", date: "2023-10-18" },
        { name: "Organska kemija - Ogljikovi hidrati", size: "3.8 MB", type: "pptx", date: "2023-11-01" }
    ]
};

// --- DOCUMENT VIEWER LOGIC ---
const documentViewer = document.getElementById('document-viewer');
const documentViewerTitle = document.getElementById('document-viewer-title');
const documentContent = document.getElementById('document-content');
const documentClose = document.getElementById('document-close');
const prevFileBtn = document.getElementById('prev-file');
const nextFileBtn = document.getElementById('next-file');
const currentFile = document.getElementById('current-file');
const fileCount = document.getElementById('file-count');

let currentSubject = null;
let currentFiles = [];
let currentFileIndex = 0;

// Function to get correct Slovenian plural form
function getSlovenianPlural(count) {
    if (count === 1) {
        return "dokument";
    } else if (count === 2) {
        return "dokumenta";
    } else if (count === 3 || count === 4) {
        return "dokumenti";
    } else {
        return "dokumentov";
    }
}

// Function to open document viewer
function openDocumentViewer(subject, files, fileIndex = 0) {
    currentSubject = subject;
    currentFiles = files;
    currentFileIndex = fileIndex;

    documentViewer.classList.add('active');
    loadFile(fileIndex);

    // Speak that we're opening the subject
    const documentCount = files.length;
    const pluralForm = getSlovenianPlural(documentCount);
    speak(`Odpiram predmet ${subject}. Vsebuje ${documentCount} ${pluralForm}.`);
}

// Function to close document viewer
function closeDocumentViewer() {
    documentViewer.classList.remove('active');
    currentSubject = null;
    currentFiles = [];
    currentFileIndex = 0;

    // Speak that we're closing the subject
    speak(`Zaprl predmet.`);
}

// Function to load a file in the viewer
function loadFile(index) {
    if (currentFiles.length === 0) return;

    const file = currentFiles[index];
    currentFileIndex = index;

    // Update UI
    documentViewerTitle.textContent = file.name;
    currentFile.textContent = file.name;
    fileCount.textContent = `od ${currentFiles.length}`;

    // Enable/disable navigation buttons
    prevFileBtn.disabled = index === 0;
    nextFileBtn.disabled = index === currentFiles.length - 1;

    documentContent.innerHTML = `
                <h2>${file.name}</h2>
                <p><strong>Predmet:</strong> ${currentSubject}</p>
                <p><strong>Velikost:</strong> ${file.size}</p>
                <p><strong>Datum:</strong> ${formatDate(file.date)}</p>
                <hr>
                <p>To je vsebina dokumenta "${file.name}".</p>`;

    // Speak the file name
    speak(`Odprl dokument ${file.name}`);
}

// Function to navigate to previous file
function prevFile() {
    if (currentFileIndex > 0) {
        loadFile(currentFileIndex - 1);
    }
}

// Function to navigate to next file
function nextFile() {
    if (currentFileIndex < currentFiles.length - 1) {
        loadFile(currentFileIndex + 1);
    }
}

// Event listeners for document viewer
documentClose.addEventListener('click', closeDocumentViewer);
prevFileBtn.addEventListener('click', prevFile);
nextFileBtn.addEventListener('click', nextFile);

// ESC key to close document viewer
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && documentViewer.classList.contains('active')) {
        closeDocumentViewer();
    }
});

// --- KEYBOARD NAVIGATION FOR FILE EXPLORER ---
let selectedSubjectIndex = 0;
let selectedFileIndex = 0;
let subjects = [];
let currentSubjectFiles = [];
let isInFileMode = false;

// Function to select a subject
function selectSubject(index) {
    if (subjects.length === 0) return;

    // Remove selection from all subjects and files
    const subjectHeaders = document.querySelectorAll('.subject-header');
    const fileCards = document.querySelectorAll('.file-card');
    subjectHeaders.forEach(header => header.classList.remove('selected'));
    fileCards.forEach(card => card.classList.remove('selected'));

    // Select the new subject
    if (subjectHeaders[index]) {
        subjectHeaders[index].classList.add('selected');
        selectedSubjectIndex = index;

        // Expand the subject if it's not already expanded
        const content = subjectHeaders[index].nextElementSibling;
        if (!content.classList.contains('expanded')) {
            subjectHeaders[index].click();
        }

        // Update current files
        const subjectName = subjects[index];
        currentSubjectFiles = dummyFileData[subjectName] || [];
        selectedFileIndex = 0;
        isInFileMode = false;

        // Speak the subject name
        const documentCount = currentSubjectFiles.length;
        const pluralForm = getSlovenianPlural(documentCount);
        speak(`Predmet ${subjectName}. ${documentCount} ${pluralForm}.`);
    }
}

// Function to select a file
function selectFile(index) {
    if (currentSubjectFiles.length === 0) return;

    // Remove selection from all files
    const fileCards = document.querySelectorAll('.file-card');
    fileCards.forEach(card => card.classList.remove('selected'));

    // Select the new file
    const subjectFiles = document.querySelectorAll(`[data-subject="${subjects[selectedSubjectIndex]}"]`);
    if (subjectFiles[index]) {
        subjectFiles[index].classList.add('selected');
        selectedFileIndex = index;

        // Speak the file name
        speak(`Dokument ${currentSubjectFiles[index].name}`);
    }
}

// Function to enter file mode
function enterFileMode() {
    if (currentSubjectFiles.length === 0) return;
    isInFileMode = true;
    selectFile(0);
}

// Function to exit file mode
function exitFileMode() {
    isInFileMode = false;
    const fileCards = document.querySelectorAll('.file-card');
    fileCards.forEach(card => card.classList.remove('selected'));
}

// Function to open selected file
function openSelectedFile() {
    if (currentSubjectFiles.length === 0) return;

    const subjectName = subjects[selectedSubjectIndex];
    openDocumentViewer(subjectName, currentSubjectFiles, selectedFileIndex);
}

// Function to handle keyboard navigation
function handleKeyboardNavigation(e) {
    // Only handle if we're in the document preview tab
    if (currentTabIndex !== 0) return;

    // If document viewer is open, handle navigation within it
    if (documentViewer.classList.contains('active')) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            prevFile();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            nextFile();
        }
        return;
    }

    // Otherwise, handle navigation in file explorer
    switch (e.key) {
        case 'ArrowUp':
            e.preventDefault();
            if (isInFileMode) {
                if (selectedFileIndex > 0) {
                    selectFile(selectedFileIndex - 1);
                } else {
                    // If at first file, exit file mode
                    exitFileMode();
                }
            } else {
                if (selectedSubjectIndex > 0) {
                    selectSubject(selectedSubjectIndex - 1);
                }
            }
            break;

        case 'ArrowDown':
            e.preventDefault();
            if (isInFileMode) {
                if (selectedFileIndex < currentSubjectFiles.length - 1) {
                    selectFile(selectedFileIndex + 1);
                }
            } else {
                if (selectedSubjectIndex < subjects.length - 1) {
                    selectSubject(selectedSubjectIndex + 1);
                } else if (currentSubjectFiles.length > 0) {
                    // If at last subject and there are files, enter file mode
                    enterFileMode();
                }
            }
            break;

        case 'Enter':
            e.preventDefault();
            if (isInFileMode) {
                openSelectedFile();
            } else if (currentSubjectFiles.length > 0) {
                enterFileMode();
            }
            break;

        case 'Escape':
            if (isInFileMode) {
                e.preventDefault();
                exitFileMode();
            }
            break;
    }
}

// Add keyboard event listener
document.addEventListener('keydown', handleKeyboardNavigation);

// Function to render file explorer
function renderFileExplorer(data, searchTerm = '') {
    fileExplorer.innerHTML = '';

    subjects = Object.keys(data);

    if (subjects.length === 0) {
        fileExplorer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <span class="material-symbols-outlined">folder_off</span>
                        </div>
                        <h3>Ni dokumentov</h3>
                        <p>Naložite prve dokumente v zavihku "Nalaganje"</p>
                    </div>
                `;
        return;
    }

    subjects.forEach((subject, index) => {
        let files = data[subject];

        // Filter files based on search term
        if (searchTerm) {
            files = files.filter(file =>
                file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                subject.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (files.length === 0) return;

        const subjectGroup = document.createElement('div');
        subjectGroup.className = 'subject-group';

        subjectGroup.innerHTML = `
                    <div class="subject-header" data-subject="${subject}" data-index="${index}">
                        <span class="material-symbols-outlined">folder</span>
                        <h3 class="subject-title">${subject}</h3>
                        <span class="subject-file-count">${files.length} ${getSlovenianPlural(files.length)}</span>
                        <span class="material-symbols-outlined">expand_more</span>
                    </div>
                    <div class="subject-content">
                        <div class="file-grid">
                            ${files.map((file, fileIndex) => `
                                <div class="file-card" data-file="${file.name}" data-subject="${subject}" data-index="${fileIndex}">
                                    <div class="file-card-icon">
                                        <span class="material-symbols-outlined">${getFileIcon(file.type)}</span>
                                    </div>
                                    <h4 class="file-card-name">${file.name}</h4>
                                    <div class="file-card-details">
                                        <span>${file.size}</span>
                                        <span>${formatDate(file.date)}</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

        fileExplorer.appendChild(subjectGroup);

        // Add click event to expand/collapse subject
        const header = subjectGroup.querySelector('.subject-header');
        const content = subjectGroup.querySelector('.subject-content');

        header.addEventListener('click', (e) => {
            // Don't trigger if clicking on a file card inside
            if (e.target.closest('.file-card')) return;

            content.classList.toggle('expanded');
            const icon = header.querySelector('.material-symbols-outlined:last-child');
            icon.textContent = content.classList.contains('expanded') ? 'expand_less' : 'expand_more';

            // Select this subject when clicked
            selectSubject(index);
        });

        // Add click events to file cards
        const fileCards = subjectGroup.querySelectorAll('.file-card');
        fileCards.forEach((card, fileIndex) => {
            card.addEventListener('click', () => {
                const fileName = card.getAttribute('data-file');
                const subjectName = card.getAttribute('data-subject');

                // Select this subject and file
                selectSubject(index);
                selectFile(fileIndex);

                // Open the file
                openDocumentViewer(subjectName, files, fileIndex);
            });
        });
    });

    // Select the first subject by default
    if (subjects.length > 0) {
        selectSubject(0);
    }
}

// Function to get appropriate icon for file type
function getFileIcon(fileType) {
    const iconMap = {
        'pdf': 'picture_as_pdf',
        'docx': 'description',
        'pptx': 'slideshow',
        'txt': 'article',
        'md': 'article'
    };
    return iconMap[fileType] || 'description';
}

// Function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('sl-SI');
}

let cachedDocs = {};

// Function to fetch and render documents
async function fetchAndRenderDocuments() {
    try {
        fileExplorer.innerHTML = '<div class="status">Nalaganje dokumentov...</div>';

        // In a real app, we would fetch from an API
        // For now, we'll use the dummy data
        cachedDocs = dummyFileData;

        renderFileExplorer(cachedDocs);
    } catch (err) {
        console.error(err);
        fileExplorer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <span class="material-symbols-outlined">error</span>
                        </div>
                        <h3>Napaka pri nalaganju</h3>
                        <p>Ni bilo mogoče naložiti dokumentov. Poskusite osvežiti stran.</p>
                    </div>
                `;
        showToast('Napaka', 'Ni bilo mogoče naložiti dokumentov.', 'error');
    }
}

// Initialize file explorer
fetchAndRenderDocuments();

// Add search functionality
fileSearch.addEventListener('input', (e) => {
    renderFileExplorer(cachedDocs, e.target.value);
});

// --- TTS SETUP ---
let isSpeaking = false;

function speak(text) {
    return new Promise((resolve) => {
        if (!window.speechSynthesis) {
            console.log("Text-to-speech not supported");
            resolve();
            return;
        }

        window.speechSynthesis.cancel();
        isSpeaking = true;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'sl-SI';
        utterance.rate = 0.9;

        utterance.onend = () => {
            isSpeaking = false;
            resolve();
        };

        utterance.onerror = () => {
            isSpeaking = false;
            resolve();
        };

        window.speechSynthesis.speak(utterance);
    });
}

// --- MICROPHONE PERMISSION MANAGEMENT ---
let microphonePermissionGranted = false;
let microphonePermissionRequested = false;

// Function to request microphone permission once
async function requestMicrophonePermissionOnce() {
    if (microphonePermissionRequested) {
        return microphonePermissionGranted;
    }

    microphonePermissionRequested = true;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately stop using the stream - we just needed permission
        stream.getTracks().forEach(track => track.stop());
        microphonePermissionGranted = true;
        console.log('Microphone permission granted');
        return true;
    } catch (error) {
        console.error('Microphone permission denied:', error);
        microphonePermissionGranted = false;
        showToast('Dovoljenje za mikrofon', 'Dovoljenje za uporabo mikrofona je bilo zavrnjeno.', 'error');
        return false;
    }
}

// --- TABS LOGIC ---
const tabs = document.querySelectorAll('[role="tab"]');
const panels = document.querySelectorAll('[role="tabpanel"]');
let currentTabIndex = 0;

// Function to switch tabs
function switchTab(index) {
    tabs.forEach(t => t.setAttribute('aria-selected', 'false'));
    panels.forEach(p => p.hidden = true);

    tabs[index].setAttribute('aria-selected', 'true');
    panels[index].hidden = false;
    currentTabIndex = index;

    // Speak the tab name
    const tab = tabs[index];
    // Get only the text node that is not empty
    const tabName = Array.from(tab.childNodes)
        .filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '')
        .map(node => node.textContent.trim())
        .join(' ');

    console.log(tabName);
    speak(`Zavihek ${tabName}`);
}

tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
        switchTab(index);
    });
});

// Handle deep linking on page load
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
        const tab = document.getElementById(`tab-${hash}`);
        if (tab) {
            tab.click();
        }
    }
});

// --- SPEECH RECOGNITION SETUP ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let lectureRecognition;

// Function to initialize speech recognition
function initializeSpeechRecognition() {
    if (!SpeechRecognition) {
        showToast('Združljivost brskalnika', 'Web Speech API ni podprt v tem brskalniku.', 'warning');
        return null;
    }

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.lang = 'sl-SI';
    recog.interimResults = true;

    return recog;
}

// Function to initialize lecture recognition
function initializeLectureRecognition() {
    if (!SpeechRecognition) {
        return null;
    }

    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = 'sl-SI';

    return recog;
}

// --- VPRASAJ FEATURE ---
const vprasajMicBtn = document.getElementById('vprasaj-mic-btn');
const vprasajInput = document.getElementById('vprasaj-input');
const vprasajSubject = document.getElementById('vprasaj-subject');
const vprasajSubmitBtn = document.getElementById('vprasaj-submit-btn');
const vprasajResponse = document.getElementById('vprasaj-response');
const vprasajStatus = document.getElementById('vprasaj-status');
const listeningIndicator = document.getElementById('listening-indicator');

let isListeningForQuestion = false;

// Function to toggle question listening
async function toggleQuestionListening() {
    setTimeout(() => {
        // code
    }, 3000);
    // Don't start listening if we're currently speaking
    if (!isListeningForQuestion && isSpeaking) {
        showToast('Počakajte', 'Počakajte, da se konča govorjenje.', 'warning');
        return;
    }

    if (!isListeningForQuestion) {
        // Check and request microphone permission if needed
        if (!microphonePermissionGranted) {
            const permissionGranted = await requestMicrophonePermissionOnce();
            if (!permissionGranted) {
                return;
            }
        }
        setTimeout(() => {
            // code
        }, 5000);

        // Initialize recognition if not already done
        if (!recognition) {
            recognition = initializeSpeechRecognition();
            if (!recognition) return;

            // Set up recognition events
            recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                vprasajInput.value = transcript;
            };

            recognition.onend = () => {
                if (!isListeningForQuestion) {
                    vprasajStatus.textContent = "Pritisnite za govorjenje vprašanja";
                    vprasajMicBtn.classList.remove('listening');
                    vprasajMicBtn.innerHTML = '<span class="material-symbols-outlined">mic</span> Začni poslušati';
                    listeningIndicator.style.display = 'none';
                } else {
                    // If we're still supposed to be listening, restart
                    recognition.start();
                }
            };

            recognition.onerror = (event) => {
                console.error(event.error);
                vprasajStatus.textContent = "Napaka: " + event.error;
                vprasajMicBtn.classList.remove('listening');
                vprasajMicBtn.innerHTML = '<span class="material-symbols-outlined">mic</span> Začni poslušati';
                listeningIndicator.style.display = 'none';
                isListeningForQuestion = false;

                if (event.error === 'not-allowed') {
                    showToast('Dovoljenje za mikrofon', 'Dovoljenje za uporabo mikrofona je potrebno.', 'error');
                    microphonePermissionGranted = false;
                } else {
                    showToast('Napaka prepoznavanja govora', event.error, 'error');
                }
            };
        }

        // Start listening
        recognition.start();
        isListeningForQuestion = true;

        // Update UI
        vprasajStatus.textContent = "Poslušam...";
        vprasajMicBtn.classList.add('listening');
        vprasajMicBtn.innerHTML = '<span class="material-symbols-outlined">stop</span> Ustavi poslušanje';
        listeningIndicator.style.display = 'block';

        // Audio feedback
        await speak("Poslušam vaše vprašanje.");

        showToast('Poslušanje aktivirano', 'Povejte svoje vprašanje.', 'info');
    } else {
        // Stop listening and send question
        if (recognition) {
            recognition.stop();
            isListeningForQuestion = false;

            // Update UI
            vprasajStatus.textContent = "Vprašanje poslano...";
            vprasajMicBtn.classList.remove('listening');
            vprasajMicBtn.innerHTML = '<span class="material-symbols-outlined">mic</span> Začni poslušati';
            listeningIndicator.style.display = 'none';

            // Audio feedback
            await speak("Vprašanje poslano.");

            // Automatically submit the question
            if (vprasajInput.value.trim()) {
                submitQuestion();
            } else {
                vprasajStatus.textContent = "Ni zaznanega vprašanja";
                showToast('Ni vprašanja', 'Ni bilo zaznanega vprašanja.', 'warning');
            }
        }
    }
}

// Button click handler
vprasajMicBtn.addEventListener('click', toggleQuestionListening);

// Ctrl+Space handler for question tab
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();

        // Only handle in the question tab
        if (currentTabIndex === 1) {
            toggleQuestionListening();
        }
    }
});

// Function to submit question
async function submitQuestion() {
    const question = vprasajInput.value.trim();
    const subject = vprasajSubject.value.trim() || null;
    if (!question) {
        showToast('Vnos je potreben', 'Prosimo, vnesite ali izgovorite vprašanje.', 'warning');
        return;
    }

    vprasajStatus.textContent = "Razmišljam...";
    vprasajResponse.hidden = false;
    vprasajResponse.textContent = "Razmišljam...";
    vprasajSubmitBtn.disabled = true;

    try {
        // Use the actual API call from your original script
        const res = await fetch('/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, subject })
        });

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        vprasajResponse.textContent = data.answer;
        await speak(data.answer);
        vprasajStatus.textContent = "Odgovorjeno.";
        vprasajSubmitBtn.disabled = false;
        showToast('Vprašanje odgovorjeno', 'Odgovor je bil prebran na glas.', 'success');
    } catch (err) {
        vprasajResponse.textContent = "Napaka: " + err.message;
        await speak("Oprostite, prišlo je do napake.");
        vprasajStatus.textContent = "Prišlo je do napake.";
        vprasajSubmitBtn.disabled = false;
        showToast('Napaka', 'Ni bilo mogoče dobiti odgovora: ' + err.message, 'error');
    }
}

vprasajSubmitBtn.addEventListener('click', submitQuestion);

// --- SNEMANJE PREDAVANJA FEATURE ---
const snemajBtn = document.getElementById('snemaj-btn');
const snemajTranscript = document.getElementById('snemaj-transcript');
const shraniPredavanjeBtn = document.getElementById('shrani-predavanje-btn');
const naslovPredavanja = document.getElementById('naslov-predavanja');
const predavanjeSubject = document.getElementById('predavanje-subject');
const snemajStatus = document.getElementById('snemaj-status');
const statusDot = document.querySelector('#snemaj-status .status-dot');
const userNotes = document.getElementById('user-notes');
const insertNoteBtn = document.getElementById('insert-note-btn');
const noteIndicator = document.getElementById('note-indicator');
const cursorPosition = document.getElementById('cursor-position');

let isRecording = false;
let noteInsertionPoint = 0;
let transcriptLengthAtNoteStart = 0;
let notes = [];
let currentRawTranscript = "";

// Set up lecture recognition events
if (SpeechRecognition) {
    lectureRecognition = initializeLectureRecognition();

    if (lectureRecognition) {
        lectureRecognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');

            currentRawTranscript = transcript;

            // Update transcript display
            updateTranscriptDisplay(transcript);

            // Update cursor position indicator
            if (document.activeElement !== userNotes) {
                noteInsertionPoint = transcript.length;
            }
            updateCursorPosition();
        };

        lectureRecognition.onerror = (event) => {
            console.error(event.error);
            snemajStatus.innerHTML = `<span class="status-indicator"><span class="status-dot"></span>Napaka: ${event.error}</span>`;
            showToast('Napaka snemanja', event.error, 'error');
        };

        lectureRecognition.onend = () => {
            if (isRecording) {
                // If we're still supposed to be recording, restart
                lectureRecognition.start();
            }
        };
    }
}

// Function to update transcript display with notes
function updateTranscriptDisplay(transcript) {
    // Sort notes by index
    const sortedNotes = [...notes].sort((a, b) => a.index - b.index);

    let parts = [];
    let lastIndex = 0;

    for (const note of sortedNotes) {
        const pos = Math.min(note.index, transcript.length);
        if (pos < lastIndex) continue;

        parts.push(transcript.substring(lastIndex, pos));
        parts.push(`<div class="note-marker"><strong>Opomba:</strong> ${note.text}</div>`);
        lastIndex = pos;
    }
    parts.push(transcript.substring(lastIndex));

    let finalHtml = parts.join('').replace(/\n/g, '<br>');
    snemajTranscript.innerHTML = finalHtml;
}

// Function to update cursor position indicator
function updateCursorPosition() {
    const position = noteInsertionPoint;
    const charsBefore = position;
    noteIndicator.textContent = `Pozicija za vstavljanje opomb: ${charsBefore} znakov od začetka`;
}

// Set note insertion point when user focuses on note textarea
userNotes.addEventListener('focus', () => {
    noteInsertionPoint = currentRawTranscript.length;
    transcriptLengthAtNoteStart = noteInsertionPoint;
    cursorPosition.classList.add('visible');
    updateCursorPosition();
    showToast('Pozicija nastavljena', 'Opomba bo vstavljena na trenutno mesto v prepisu.', 'info');
});

userNotes.addEventListener('blur', () => {
    cursorPosition.classList.remove('visible');
});

// Function to insert note
function insertNote() {
    const noteText = userNotes.value.trim();
    if (!noteText) {
        showToast('Ni opombe', 'Prosimo, vnesite opombo.', 'warning');
        return;
    }

    let index = noteInsertionPoint;
    if (index > currentRawTranscript.length) index = currentRawTranscript.length;

    notes.push({
        text: noteText,
        index: index
    });

    updateTranscriptDisplay(currentRawTranscript);

    userNotes.value = '';
    showToast('Opomba vstavljena', 'Opomba je bila uspešno vstavljena.', 'success');

    noteInsertionPoint = currentRawTranscript.length;
    updateCursorPosition();
}

insertNoteBtn.addEventListener('click', insertNote);

// Also allow Enter key to insert note (but not Shift+Enter for new line)
userNotes.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        insertNote();
    }
});

// Function to toggle recording
async function toggleRecording() {
    // Don't start recording if we're currently speaking
    if (!isRecording && isSpeaking) {
        showToast('Počakajte', 'Počakajte, da se konča govorjenje.', 'warning');
        return;
    }

    // Check and request microphone permission if needed
    if (!isRecording && !microphonePermissionGranted) {
        const permissionGranted = await requestMicrophonePermissionOnce();
        if (!permissionGranted) {
            return;
        }
    }

    if (!isRecording) {
        if (lectureRecognition) {
            lectureRecognition.start();
            isRecording = true;
            snemajBtn.innerHTML = '<span class="material-symbols-outlined">stop</span> Ustavi snemanje';
            snemajBtn.classList.remove('btn-record');
            snemajBtn.classList.add('btn-stop');
            statusDot.classList.add('recording');
            snemajStatus.innerHTML = '<span class="status-indicator"><span class="status-dot recording"></span>Snemam...</span>';
            await speak("Snemanje predavanja se je začelo.");
            showToast('Snemanje začeto', 'Snemanje predavanja je zdaj aktivno.', 'success');
        }
    } else {
        if (lectureRecognition) {
            lectureRecognition.stop();
            isRecording = false;
            snemajBtn.innerHTML = '<span class="material-symbols-outlined">fiber_manual_record</span> Začni snemanje';
            snemajBtn.classList.remove('btn-stop');
            snemajBtn.classList.add('btn-record');
            statusDot.classList.remove('recording');
            snemajStatus.innerHTML = '<span class="status-indicator"><span class="status-dot"></span>Snemanje ustavljeno.</span>';
            await speak("Snemanje predavanja je ustavljeno.");
            const content = snemajTranscript.innerHTML;
            const textContent = content.replace(/<div class="note-marker">.*?<\/div>/g, '')
                .replace(/<br>/g, '\n')
                .trim();
            const title = naslovPredavanja.value || "Posnetek predavanja " + new Date().toLocaleString();

            if (!textContent) {
                showToast('Ni vsebine', 'Ni prepisa za shranjevanje.', 'warning');
                return;
            }

            try {
                // Use the actual API call from your original script
                await fetch('/add_lecture', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: textContent, title, subject: predavanjeSubject.value.trim() || "Splošno" })
                });

                showToast('Predavanje shranjeno', `"${title}" je bil uspešno shranjen.`, 'success');
                snemajTranscript.innerHTML = "";
                naslovPredavanja.value = "";
                userNotes.value = "";
                noteInsertionPoint = 0;
                transcriptLengthAtNoteStart = 0;
                notes = [];
                currentRawTranscript = "";
                updateCursorPosition();
            } catch (err) {
                showToast('Shranjevanje ni uspelo', 'Napaka pri shranjevanju predavanja: ' + err.message, 'error');
            }
            showToast('Snemanje ustavljeno', 'Snemanje predavanja je bilo ustavljeno.', 'info');
        }
    }
}

snemajBtn.addEventListener('click', toggleRecording);

// Ctrl+Space shortcut for recording in the recording tab
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        // Check which tab is active and start appropriate recording
        if (currentTabIndex === 2) { // Snemaj tab
            toggleRecording();
        }
    }
});

shraniPredavanjeBtn.addEventListener('click', async () => {
    const content = snemajTranscript.innerHTML;
    const textContent = content.replace(/<div class="note-marker">.*?<\/div>/g, '')
        .replace(/<br>/g, '\n')
        .trim();
    const title = naslovPredavanja.value || "Neimenovano predavanje " + new Date().toLocaleString();

    if (!textContent) {
        showToast('Ni vsebine', 'Ni prepisa za shranjevanje.', 'warning');
        return;
    }

    try {
        // Use the actual API call from your original script
        await fetch('/add_lecture', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: textContent, title, subject: predavanjeSubject.value.trim() || "Splošno" })
        });

        showToast('Predavanje shranjeno', `"${title}" je bil uspešno shranjen.`, 'success');
        snemajTranscript.innerHTML = "";
        naslovPredavanja.value = "";
        userNotes.value = "";
        noteInsertionPoint = 0;
        transcriptLengthAtNoteStart = 0;
        notes = [];
        currentRawTranscript = "";
        updateCursorPosition();
    } catch (err) {
        showToast('Shranjevanje ni uspelo', 'Napaka pri shranjevanju predavanja: ' + err.message, 'error');
    }
});

// --- NALAGANJE FEATURE ---
const fileInput = document.getElementById('file-input');
const selectFilesBtn = document.getElementById('select-files-btn');
const fileUploadArea = document.getElementById('file-upload-area');
const fileList = document.getElementById('file-list');
const uploadBtn = document.getElementById('upload-btn');
const uploadStatus = document.getElementById('upload-status');
const uploadProgress = document.getElementById('upload-progress');
const uploadProgressFill = document.getElementById('upload-progress-fill');
const uploadSubject = document.getElementById('upload-subject');

selectFilesBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
});

fileInput.addEventListener('change', updateFileList);

// Drag and drop functionality
fileUploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    fileUploadArea.classList.add('dragover');
});

fileUploadArea.addEventListener('dragleave', () => {
    fileUploadArea.classList.remove('dragover');
});

fileUploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    fileUploadArea.classList.remove('dragover');
    fileInput.files = e.dataTransfer.files;
    updateFileList();
});

fileUploadArea.addEventListener('click', () => {
    fileInput.click();
});

function updateFileList() {
    fileList.innerHTML = "";
    if (fileInput.files.length > 0) {
        uploadBtn.disabled = false;
        Array.from(fileInput.files).forEach(file => {
            const div = document.createElement('div');
            div.className = 'file-item';

            const fileSize = formatFileSize(file.size);

            div.innerHTML = `
                        <span class="material-symbols-outlined file-icon">description</span>
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">${fileSize}</span>
                    `;
            fileList.appendChild(div);
        });
    } else {
        uploadBtn.disabled = true;
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

uploadBtn.addEventListener('click', async () => {
    uploadProgress.style.display = 'block';
    uploadStatus.textContent = "Nalagam...";
    uploadBtn.disabled = true;

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += 5;
        uploadProgressFill.style.width = `${progress}%`;

        if (progress >= 100) {
            clearInterval(interval);
            const formData = new FormData();
            Array.from(fileInput.files).forEach(file => {
                formData.append('files', file);
            });
            formData.append('subject', uploadSubject.value.trim() || "Splošno");

            fetch('/upload', {
                method: 'POST',
                body: formData
            })
                .then(res => {
                    if (res.ok) {
                        uploadStatus.textContent = "Nalaganje uspešno!";
                        fileList.innerHTML = "";
                        fileInput.value = "";
                        uploadProgress.style.display = 'none';
                        uploadBtn.disabled = true;
                        showToast('Nalaganje končano', 'Datoteke so bile uspešno naložene.', 'success');

                        // Refresh file explorer
                        renderFileExplorer(dummyFileData);
                    } else {
                        throw new Error("Nalaganje ni uspelo");
                    }
                })
                .catch(err => {
                    uploadStatus.textContent = "Napaka: " + err.message;
                    uploadBtn.disabled = false;
                    showToast('Nalaganje ni uspelo', 'Napaka pri nalaganju datotek: ' + err.message, 'error');
                });
        }
    }, 100);
});

// Add this function to handle Ctrl+Enter in transcription tab
function handleTranscriptionTabShortcuts(e) {
    // Only handle in the transcription tab (tab index 2)
    if (currentTabIndex !== 2) return;

    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();

        // If user notes input is not focused, focus it
        if (document.activeElement !== userNotes) {
            userNotes.focus();
            userNotes.setSelectionRange(userNotes.value.length, userNotes.value.length); // Move cursor to end
            showToast('Vnos opombe', 'Lahko vnesete opombo. Pritisnite Ctrl+Enter za dokončanje.', 'info');
        } else {
            // If user notes is focused, blur it and insert the note
            userNotes.blur();
            if (userNotes.value.trim()) {
                insertNote();
            } else {
                showToast('Ni opombe', 'Opomba je prazna. Nič ni bilo vstavljeno.', 'warning');
            }
        }
    }
}

// Add this event listener to the document
document.addEventListener('keydown', handleTranscriptionTabShortcuts);

// Also modify the existing keydown handler to exclude Ctrl+Enter from other handlers
document.addEventListener('keydown', (e) => {
    // If it's Ctrl+Enter in transcription tab, let the dedicated handler deal with it
    if (e.ctrlKey && e.key === 'Enter' && currentTabIndex === 2) {
        return;
    }

    // Your existing keydown handler code for other shortcuts...
    if (e.key === 'ArrowLeft') {
        // Move to previous tab
        const newIndex = currentTabIndex === 0 ? tabs.length - 1 : currentTabIndex - 1;
        switchTab(newIndex);
    } else if (e.key === 'ArrowRight') {
        // Move to next tab
        const newIndex = currentTabIndex === tabs.length - 1 ? 0 : currentTabIndex + 1;
        switchTab(newIndex);
    }
});

// Update the userNotes focus event to provide better feedback
userNotes.addEventListener('focus', () => {
    noteInsertionPoint = currentRawTranscript.length;
    transcriptLengthAtNoteStart = noteInsertionPoint;
    cursorPosition.classList.add('visible');
    updateCursorPosition();
    // Removed the toast here to avoid duplication with Ctrl+Enter toast
});

// Optional: Add visual indicator when notes input is focused
userNotes.addEventListener('focus', () => {
    userNotes.parentElement.classList.add('notes-focused');
});

userNotes.addEventListener('blur', () => {
    userNotes.parentElement.classList.remove('notes-focused');
    cursorPosition.classList.remove('visible');
});
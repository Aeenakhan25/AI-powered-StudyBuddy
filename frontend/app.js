/**
 * StudyAI - Full Stack Application Logic
 */

const API_BASE = '/api';

const StudyAI = {
    token: localStorage.getItem('studyai_token'),
    user: JSON.parse(localStorage.getItem('studyai_user')),
    theme: localStorage.getItem('studyai_theme') || 'light',
    notes: [],
    currentNoteId: null,

    init() {
        console.log('StudyAI System Initializing...');
        this.applyTheme();
        this.setupEventListeners();
        this.injectThemeToggle();
        if (this.token) {
            this.loadUserData();
        } else if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
            window.location.href = 'index.html';
        }
    },

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('studyai_theme', this.theme);
    },

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
    },

    injectThemeToggle() {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && !document.getElementById('themeToggle')) {
            const btn = document.createElement('button');
            btn.id = 'themeToggle';
            btn.className = 'btn btn-glass';
            btn.style.marginTop = 'auto';
            btn.style.width = '100%';
            btn.innerHTML = '🌓 Toggle Theme';
            btn.onclick = () => this.toggleTheme();
            sidebar.appendChild(btn);
        }
    },

    setAuth(token, user) {
        this.token = token;
        this.user = user;
        localStorage.setItem('studyai_token', token);
        localStorage.setItem('studyai_user', JSON.stringify(user));
    },

    logout() {
        localStorage.removeItem('studyai_token');
        localStorage.removeItem('studyai_user');
        window.location.href = 'index.html';
    },

    async api(endpoint, method = 'GET', body = null) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.token}`
            }
        };
        if (body) options.body = JSON.stringify(body);

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, options);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'API Error');
            return data;
        } catch (err) {
            console.error(`API Error (${endpoint}):`, err);
            throw err;
        }
    },

    setupEventListeners() {
        // Login Form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;
                try {
                    const data = await this.api('/auth/login', 'POST', { email, password });
                    this.setAuth(data.token, data.user);
                    window.location.href = 'dashboard.html';
                } catch (err) {
                    alert('Login failed: ' + err.message);
                }
            });
        }

        // Registration Form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('regUsername').value;
                const email = document.getElementById('regEmail').value;
                const password = document.getElementById('regPassword').value;
                try {
                    const data = await this.api('/auth/register', 'POST', { username, email, password });
                    this.setAuth(data.token, data.user);
                    window.location.href = 'dashboard.html';
                } catch (err) {
                    alert('Registration failed: ' + err.message);
                }
            });
        }

        // Modal Logic
        const saveModalNoteBtn = document.getElementById('saveModalNoteBtn');
        if (saveModalNoteBtn) {
            saveModalNoteBtn.addEventListener('click', () => this.saveNoteFromModal());
        }

        // Chat Logic
        const sendBtn = document.getElementById('sendBtn');
        const userInput = document.getElementById('userInput');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendChatMessage());
            userInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendChatMessage();
            });
        }
    },

    async loadUserData() {
        if (window.location.pathname.includes('dashboard.html')) {
            this.loadDashboard();
        } else if (window.location.pathname.includes('notes.html')) {
            this.loadNotes();
        } else if (window.location.pathname.includes('chat.html')) {
            this.loadChatHistory();
        } else if (window.location.pathname.includes('flashcards.html')) {
            this.loadFlashcardsPage();
        } else if (window.location.pathname.includes('planner.html')) {
            this.loadPlannerPage();
        } else if (window.location.pathname.includes('quiz.html')) {
            this.loadQuizPage();
        }
    },

    // --- PLANNER MODULE ---
    async loadPlannerPage() {
        const form = document.getElementById('addTaskForm');
        if (!form) return;

        form.onsubmit = (e) => {
            e.preventDefault();
            this.addTask();
        };

        this.loadTasks();
    },

    async loadTasks() {
        const list = document.getElementById('tasksList');
        if (!list) return;

        try {
            const tasks = await this.api('/planner');
            if (tasks.length === 0) {
                list.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No tasks scheduled yet.</p>`;
                return;
            }

            list.innerHTML = tasks.map(t => `
                <div class="task-item ${t.status === 'completed' ? 'completed' : ''}">
                    <input type="checkbox" class="task-checkbox" ${t.status === 'completed' ? 'checked' : ''} 
                        onclick="StudyAI.toggleTaskStatus(${t.id}, this.checked)">
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <h4 style="margin: 0;">${t.title}</h4>
                            <span style="font-size: 0.8rem; color: var(--primary); font-weight: 600;">${t.subject || ''}</span>
                        </div>
                        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.3rem;">${t.description || ''}</p>
                        <div style="font-size: 0.75rem; color: var(--secondary); margin-top: 0.5rem; font-weight: 600;">
                            Due: ${new Date(t.deadline).toLocaleDateString()}
                        </div>
                    </div>
                    <button class="btn btn-glass btn-sm" style="color: #ef4444;" onclick="StudyAI.deleteTask(${t.id})">×</button>
                </div>
            `).join('');
        } catch (err) {}
    },

    async addTask() {
        const title = document.getElementById('taskTitle').value;
        const subject = document.getElementById('taskSubject').value;
        const deadline = document.getElementById('taskDeadline').value;
        const description = document.getElementById('taskDescription').value;

        try {
            await this.api('/planner', 'POST', { title, subject, deadline, description });
            document.getElementById('addTaskForm').reset();
            this.loadTasks();
        } catch (err) {
            alert('Failed to add task');
        }
    },

    async toggleTaskStatus(id, checked) {
        const status = checked ? 'completed' : 'pending';
        try {
            await this.api(`/planner/${id}`, 'PATCH', { status });
            this.loadTasks();
            // Update progress
            if (checked) {
                this.api('/progress', 'POST', { tasks_completed: 1, study_hours: 0, quizzes_taken: 0 });
            }
        } catch (err) {
            alert('Update failed');
        }
    },

    async deleteTask(id) {
        if (!confirm('Delete this task?')) return;
        try {
            await this.api(`/planner/${id}`, 'DELETE');
            this.loadTasks();
        } catch (err) {
            alert('Delete failed');
        }
    },

    // --- FLASHCARDS MODULE ---
    async loadFlashcardsPage() {
        const select = document.getElementById('flashNoteSelect');
        const genBtn = document.getElementById('genFlashBtn');
        if (!select || !genBtn) return;

        try {
            const notes = await this.api('/notes');
            select.innerHTML = '<option value="">Select a note...</option>' + 
                notes.map(n => `<option value="${n.id}">${n.title}</option>`).join('');
            
            genBtn.onclick = () => this.generateFlashcards();
            
            this.allFlashcards = await this.api('/ai/flashcards');
            this.currentFlashIndex = 0;
            this.renderCurrentFlashcard();
        } catch (err) {}
    },

    async generateFlashcards() {
        const noteId = document.getElementById('flashNoteSelect').value;
        if (!noteId) return alert('Select a note');
        
        const btn = document.getElementById('genFlashBtn');
        btn.textContent = 'Generating...';
        btn.disabled = true;

        try {
            await this.api('/ai/generate-flashcards', 'POST', { noteId });
            // Immediately reload and render
            this.allFlashcards = await this.api('/ai/flashcards');
            this.currentFlashIndex = 0;
            this.renderCurrentFlashcard();
        } catch (err) {
            alert('Failed to generate');
        } finally {
            btn.textContent = 'Generate';
            btn.disabled = false;
        }
    },

    renderCurrentFlashcard() {
        const section = document.getElementById('flashcardSection');
        const empty = document.getElementById('noFlashcards');
        const front = document.getElementById('cardFront');
        const back = document.getElementById('cardBack');
        const count = document.getElementById('cardCount');
        const card = document.getElementById('mainFlashcard');

        if (!this.allFlashcards || this.allFlashcards.length === 0 || this.currentFlashIndex >= this.allFlashcards.length) {
            section.style.display = 'none';
            empty.style.display = 'block';
            return;
        }

        section.style.display = 'flex';
        empty.style.display = 'none';
        card.classList.remove('flipped');

        const current = this.allFlashcards[this.currentFlashIndex];
        front.textContent = current.question;
        back.textContent = current.answer;
        count.textContent = `Card ${this.currentFlashIndex + 1} of ${this.allFlashcards.length}`;
    },

    async reviewFlashcard(known) {
        const current = this.allFlashcards[this.currentFlashIndex];
        try {
            await this.api(`/ai/flashcards/${current.id}`, 'PATCH', { known });
            this.currentFlashIndex++;
            this.renderCurrentFlashcard();
        } catch (err) {
            alert('Update failed');
        }
    },

    // --- AI CHAT MODULE ---
    async loadChatHistory() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        try {
            const history = await this.api('/ai/history');
            chatMessages.innerHTML = history.map(h => `
                <div class="message user">${h.message}</div>
                <div class="message ai">${h.response}</div>
            `).join('');
            chatMessages.scrollTop = chatMessages.scrollHeight;
        } catch (err) {
            console.error('Failed to load chat history');
        }
    },

    async sendChatMessage() {
        const userInput = document.getElementById('userInput');
        if (!userInput || !userInput.value.trim()) return;
        
        const message = userInput.value.trim();
        this.addChatMessage(message, 'user');
        userInput.value = '';
        
        // Simulated typing delay
        const typingId = this.addChatMessage('StudyAI is thinking...', 'ai');
        
        try {
            const data = await this.api('/ai/chat', 'POST', { message });
            // Add a slight delay to make it feel more "AI"
            setTimeout(() => {
                document.getElementById(typingId).textContent = data.reply;
                const chatMessages = document.getElementById('chatMessages');
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 800);
        } catch (err) {
            document.getElementById(typingId).textContent = 'Error: ' + err.message;
        }
    },

    // --- NOTES MODULE ---
    async loadNotes() {
        try {
            this.notes = await this.api('/notes');
            this.renderNotes(this.notes);
        } catch (err) {
            console.error('Failed to load notes');
        }
    },

    renderNotes(notesToRender) {
        const grid = document.getElementById('notesGrid');
        if (!grid) return;
        
        if (notesToRender.length === 0) {
            grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No notes found. Create your first one!</p>`;
            return;
        }

        grid.innerHTML = notesToRender.map(n => `
            <div class="card animate-fade">
                <h3>${n.title}</h3>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                    ${n.content || 'No content...'}
                </p>
                <div class="card-actions">
                    <button class="btn btn-glass btn-sm" onclick="StudyAI.openNoteModal(${n.id})">Edit</button>
                    <button class="btn btn-glass btn-sm" style="color: #ef4444;" onclick="StudyAI.deleteNote(${n.id})">Delete</button>
                </div>
            </div>
        `).join('');
    },

    filterNotes(query) {
        const filtered = this.notes.filter(n => 
            n.title.toLowerCase().includes(query.toLowerCase()) || 
            n.content.toLowerCase().includes(query.toLowerCase())
        );
        this.renderNotes(filtered);
    },

    openNoteModal(id = null) {
        this.currentNoteId = id;
        const modal = document.getElementById('noteModal');
        const titleInput = document.getElementById('modalNoteTitle');
        const contentInput = document.getElementById('modalNoteContent');
        const modalHeading = document.getElementById('modalTitle');

        if (id) {
            const note = this.notes.find(n => n.id == id);
            if (note) {
                titleInput.value = note.title || '';
                contentInput.value = note.content || '';
                modalHeading.textContent = 'Edit Note';
                this.currentNoteFolder = note.folder; // Preserve folder
            }
        } else {
            titleInput.value = '';
            contentInput.value = '';
            modalHeading.textContent = 'New Note';
            this.currentNoteFolder = 'General';
        }
        modal.style.display = 'flex';
    },

    closeNoteModal() {
        document.getElementById('noteModal').style.display = 'none';
    },

    async saveNoteFromModal() {
        const title = document.getElementById('modalNoteTitle').value;
        const content = document.getElementById('modalNoteContent').value;
        const folder = this.currentNoteFolder || 'General';
        
        try {
            if (this.currentNoteId) {
                await this.api(`/notes/${this.currentNoteId}`, 'PUT', { title, content, folder });
            } else {
                await this.api('/notes', 'POST', { title, content, folder });
            }
            this.closeNoteModal();
            this.loadNotes();
        } catch (err) {
            alert('Failed to save note');
        }
    },

    async deleteNote(id) {
        if (!confirm('Are you sure you want to delete this note?')) return;
        try {
            await this.api(`/notes/${id}`, 'DELETE');
            this.loadNotes();
        } catch (err) {
            alert('Failed to delete note');
        }
    },

    // --- OTHER MODULES ---
    async loadDashboard() {
        try {
            const data = await this.api('/dashboard/summary');
            
            // Update Welcome
            document.getElementById('welcomeText').textContent = `Welcome back, ${this.user.username}! 👋`;
            
            // Update Stats
            document.getElementById('totalNotes').textContent = data.totalNotes;
            document.getElementById('completedTasks').textContent = data.completedTasks;
            document.getElementById('avgScore').textContent = `${data.avgQuizScore}%`;
            document.getElementById('scoreBar').style.width = `${data.avgQuizScore}%`;
            
            // Update Activity Feed
            const list = document.getElementById('recentActivityList');
            if (data.recentActivity.length === 0) {
                list.innerHTML = `<p style="color: var(--text-muted);">No recent activity yet.</p>`;
            } else {
                list.innerHTML = data.recentActivity.map(a => `
                    <div style="display: flex; gap: 1rem; align-items: center; padding-bottom: 0.8rem; border-bottom: 1px solid var(--glass-border);">
                        <span style="font-size: 1.2rem;">${a.type === 'note' ? '📝' : '🤖'}</span>
                        <div style="flex: 1;">
                            <p style="font-size: 0.9rem; font-weight: 600;">${a.activity.substring(0, 40)}${a.activity.length > 40 ? '...' : ''}</p>
                            <p style="font-size: 0.75rem; color: var(--text-muted);">${new Date(a.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                `).join('');
            }
        } catch (err) {
            console.error('Failed to load dashboard summary');
        }
    },

    // --- QUIZ GENERATION MODULE ---
    async loadQuizPage() {
        const select = document.getElementById('noteSelect');
        const generateBtn = document.getElementById('generateQuizBtn');
        if (!select || !generateBtn) return;

        try {
            const notes = await this.api('/notes');
            if (notes.length === 0) {
                select.innerHTML = '<option value="">No notes found. Create some first!</option>';
                generateBtn.disabled = true;
            } else {
                select.innerHTML = notes.map(n => `<option value="${n.id}">${n.title}</option>`).join('');
                generateBtn.onclick = () => this.generateNewQuiz();
            }
        } catch (err) {
            console.error('Failed to load notes for quiz');
        }
    },

    async generateNewQuiz() {
        const noteId = document.getElementById('noteSelect').value;
        const numQuestions = document.getElementById('numQuestions').value;
        const btn = document.getElementById('generateQuizBtn');
        const container = document.getElementById('quizContainer');
        const list = document.getElementById('questionsList');

        if (!noteId) return alert('Please select a note');

        btn.textContent = 'Generating...';
        btn.disabled = true;

        try {
            const data = await this.api('/ai/generate-quiz', 'POST', { noteId, numQuestions });
            container.style.display = 'block';
            list.innerHTML = '';
            this.quizScore = 0;
            this.totalQuestions = data.questions.length;
            
            data.questions.forEach((q, index) => {
                const qDiv = document.createElement('div');
                qDiv.className = 'quiz-question';
                qDiv.innerHTML = `
                    <p style="font-weight: 600; font-size: 1.1rem; margin-bottom: 1rem;">${index + 1}. ${q.question}</p>
                    <div class="options-grid" style="display: flex; flex-direction: column; gap: 0.8rem;">
                        ${q.options.map(opt => `
                            <div class="quiz-option" onclick="StudyAI.handleQuizAnswer(this, '${opt}', '${q.answer}')">
                                ${opt}
                            </div>
                        `).join('')}
                    </div>
                `;
                list.appendChild(qDiv);
            });

            window.scrollTo({ top: container.offsetTop - 50, behavior: 'smooth' });
        } catch (err) {
            alert('Generation failed: ' + err.message);
        } finally {
            btn.textContent = 'Generate Quiz';
            btn.disabled = false;
        }
    },

    handleQuizAnswer(element, selected, correct) {
        const parent = element.parentElement;
        const options = parent.querySelectorAll('.quiz-option');
        
        options.forEach(opt => opt.classList.add('disabled'));

        if (selected === correct) {
            element.classList.add('correct');
            this.quizScore++;
        } else {
            element.classList.add('incorrect');
            // Show correct answer
            options.forEach(opt => {
                if (opt.textContent.trim() === correct) opt.classList.add('correct');
            });
        }

        // Check if all answered
        const answered = document.querySelectorAll('.quiz-option.disabled').length / 4;
        if (answered === this.totalQuestions) {
            this.showQuizResult();
        }
    },

    showQuizResult() {
        const resDiv = document.getElementById('quizResult');
        const scoreText = document.getElementById('scoreText');
        resDiv.style.display = 'block';
        scoreText.textContent = `Final Score: ${this.quizScore} / ${this.totalQuestions}`;
        
        // Update progress in background
        this.api('/progress', 'POST', { quizzes_taken: 1, tasks_completed: 0 });
    },

    addChatMessage(text, sender) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        const div = document.createElement('div');
        const id = 'msg-' + Date.now();
        div.id = id;
        div.className = `message ${sender}`;
        div.textContent = text;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return id;
    }
};

StudyAI.init();

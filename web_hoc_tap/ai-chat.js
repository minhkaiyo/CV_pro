
/* ============================================
   AI CHAT - Logic & API Integration
   Provider: DeepSeek (Exclusive)
   ============================================ */

const AIChat = {
    // State
    isOpen: false,
    isThinking: false,
    currentModel: 'deepseek-chat',
    chatHistory: [],

    // DOM Elements
    el: {},

    // ===== INIT =====
    init() {
        this.cacheElements();
        this.loadSavedData();
        this.setupEvents();
    },

    cacheElements() {
        this.el = {
            fab: document.getElementById('ai-fab'),
            panel: document.getElementById('ai-panel'),
            messages: document.getElementById('ai-messages'),
            input: document.getElementById('ai-input'),
            sendBtn: document.getElementById('ai-send-btn'),
            status: document.getElementById('ai-status'),
            settingsBtn: document.getElementById('ai-settings-btn'),
            settings: document.getElementById('ai-settings'),
            clearBtn: document.getElementById('ai-clear-btn'),
            apiKeyInput: document.getElementById('ai-api-key'),
            apiKeySave: document.getElementById('ai-key-save'),
            contextBar: document.getElementById('ai-context-bar'),
            contextText: document.getElementById('ai-context-text'),
            contextClear: document.getElementById('ai-context-clear'),
        };
    },

    loadSavedData() {
        // API key is now stored server-side (Vercel env)
        // No client-side key needed
    },

    // ===== EVENTS =====
    setupEvents() {
        this.el.fab.addEventListener('click', () => this.toggle());
        
        this.el.sendBtn.addEventListener('click', () => this.sendMessage());
        this.el.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.el.input.addEventListener('input', () => {
            this.el.input.style.height = 'auto';
            this.el.input.style.height = Math.min(this.el.input.scrollHeight, 100) + 'px';
        });

        this.el.settingsBtn.addEventListener('click', () => {
            this.el.settings.classList.toggle('open');
        });

        this.el.clearBtn.addEventListener('click', () => this.clearChat());

        this.el.apiKeySave.addEventListener('click', () => this.saveApiKey());

        document.querySelectorAll('.ai-suggest-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.el.input.value = btn.dataset.prompt;
                this.sendMessage();
            });
        });

        this.el.contextClear.addEventListener('click', () => {
            this.el.contextBar.style.display = 'none';
        });
    },

    toggle() {
        this.isOpen = !this.isOpen;
        this.el.fab.classList.toggle('active', this.isOpen);
        this.el.panel.classList.toggle('open', this.isOpen);
        if (this.isOpen) {
            setTimeout(() => this.el.input.focus(), 350);
        }
    },

    saveApiKey() {
        // API key is managed server-side via Vercel env vars
        this.showSystemMsg('✅ API key được quản lý tự động trên server. Không cần nhập!');
    },

    // ===== API CALL (via Vercel Proxy) =====
    async sendMessage() {
        const text = this.el.input.value.trim();
        if (!text || this.isThinking) return;

        this.addMessage('user', text);
        this.el.input.value = '';
        this.el.input.style.height = 'auto';

        this.setThinking(true);
        this.chatHistory.push({ role: 'user', content: text });

        // Bot message container for streaming
        const botMsgDiv = document.createElement('div');
        botMsgDiv.className = 'ai-msg ai-msg-bot';
        botMsgDiv.innerHTML = `
            <div class="ai-msg-avatar"><i class="fas fa-robot"></i></div>
            <div class="ai-msg-bubble"><div class="ai-stream-content">...</div></div>
        `;
        const typingEl = this.el.messages.querySelector('.ai-typing-msg');
        if (typingEl) typingEl.remove();
        this.el.messages.appendChild(botMsgDiv);
        const contentDiv = botMsgDiv.querySelector('.ai-stream-content');

        try {
            const response = await fetch('/api/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: this.chatHistory,
                    stream: true
                })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Server error: ${response.status}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullResponse = "";
            contentDiv.innerText = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.trim() === 'data: [DONE]') continue;
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.substring(6));
                            const content = data.choices[0].delta.content || "";
                            fullResponse += content;
                            
                            if (typeof marked !== 'undefined') {
                                contentDiv.innerHTML = marked.parse(fullResponse);
                            } else {
                                contentDiv.innerText = fullResponse;
                            }
                            this.scrollToBottom();
                        } catch (e) {}
                    }
                }
            }
            this.chatHistory.push({ role: 'assistant', content: fullResponse });

        } catch (err) {
            console.error(err);
            contentDiv.innerHTML = `<span style="color:red">❌ Lỗi kết nối AI: ${err.message}</span>`;
        }

        this.setThinking(false);
    },

    // ===== UI HELPERS =====
    addMessage(type, content) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-msg ai-msg-${type === 'user' ? 'user' : 'bot'}`;

        if (type === 'user') {
            msgDiv.innerHTML = `<div class="ai-msg-bubble">${this.escapeHTML(content)}</div>`;
        } else {
            let htmlContent = typeof marked !== 'undefined' ? marked.parse(content) : content.replace(/\n/g, '<br>');
            msgDiv.innerHTML = `
                <div class="ai-msg-avatar"><i class="fas fa-robot"></i></div>
                <div class="ai-msg-bubble">${htmlContent}</div>
            `;
        }

        const typingEl = this.el.messages.querySelector('.ai-typing-msg');
        if (typingEl) typingEl.remove();
        this.el.messages.appendChild(msgDiv);
        this.scrollToBottom();
    },

    showSystemMsg(text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'ai-msg ai-msg-bot';
        msgDiv.innerHTML = `
            <div class="ai-msg-avatar"><i class="fas fa-robot"></i></div>
            <div class="ai-msg-bubble"><p>${text}</p></div>
        `;
        this.el.messages.appendChild(msgDiv);
        this.scrollToBottom();
    },

    setThinking(thinking) {
        this.isThinking = thinking;
        this.el.sendBtn.disabled = thinking;
        if (thinking) {
            this.el.status.textContent = 'DeepSeek is thinking...';
            this.el.status.classList.add('thinking');
            const typingDiv = document.createElement('div');
            typingDiv.className = 'ai-msg ai-msg-bot ai-typing-msg';
            typingDiv.innerHTML = `
                <div class="ai-msg-avatar"><i class="fas fa-robot"></i></div>
                <div class="ai-msg-bubble"><div class="ai-typing"><span></span><span></span><span></span></div></div>
            `;
            this.el.messages.appendChild(typingDiv);
            this.scrollToBottom();
        } else {
            this.el.status.textContent = 'Ready';
            this.el.status.classList.remove('thinking');
        }
    },

    clearChat() {
        this.chatHistory = [];
        this.el.messages.innerHTML = `
            <div class="ai-msg ai-msg-bot">
                <div class="ai-msg-avatar"><i class="fas fa-robot"></i></div>
                <div class="ai-msg-bubble">
                    <p>Chat history cleared! Start a brand new conversation with DeepSeek.</p>
                </div>
            </div>
        `;
    },

    scrollToBottom() {
        requestAnimationFrame(() => {
            this.el.messages.scrollTop = this.el.messages.scrollHeight;
        });
    },

    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

document.addEventListener('DOMContentLoaded', () => AIChat.init());

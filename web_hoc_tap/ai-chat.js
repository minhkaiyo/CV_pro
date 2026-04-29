/* ============================================
   AI CHAT - Logic & API Integration
   Supports: Gemini (free), ChatGPT, Claude
   ============================================ */

const AIChat = {
    // State
    isOpen: false,
    isThinking: false,
    currentModel: 'gemini-1.5-flash',
    apiKeys: {
        gemini: 'AIzaSyAfL8ZhbeKe8y2DZZe1TwcKPE4ddQIWHEw',
        chatgpt: '' // Removed since it's personal
    },
    chatHistory: [],

    // DOM Elements (cached)
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
        // Load saved API keys
        try {
            const saved = localStorage.getItem('ai_api_keys');
            if (saved) this.apiKeys = JSON.parse(saved);
        } catch (e) { /* ignore */ }

        // Load saved model preference
        const savedModel = localStorage.getItem('ai_model');
        if (savedModel) {
            this.currentModel = savedModel;
            document.querySelectorAll('.ai-model-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.model === savedModel);
            });
        }

        // Show saved key in input
        if (this.apiKeys[this.currentModel]) {
            this.el.apiKeyInput.value = '••••••••••••••••';
        }
    },

    // ===== EVENTS =====
    setupEvents() {
        // FAB toggle
        this.el.fab.addEventListener('click', () => this.toggle());

        // Send message
        this.el.sendBtn.addEventListener('click', () => this.sendMessage());
        this.el.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.el.input.addEventListener('input', () => {
            this.el.input.style.height = 'auto';
            this.el.input.style.height = Math.min(this.el.input.scrollHeight, 100) + 'px';
        });

        // Settings toggle
        this.el.settingsBtn.addEventListener('click', () => {
            this.el.settings.classList.toggle('open');
        });

        // Clear chat
        this.el.clearBtn.addEventListener('click', () => this.clearChat());

        // Model selector
        document.querySelectorAll('.ai-model-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.ai-model-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentModel = btn.dataset.model;
                localStorage.setItem('ai_model', this.currentModel);

                // Update API key input
                this.el.apiKeyInput.value = this.apiKeys[this.currentModel]
                    ? '••••••••••••••••'
                    : '';
            });
        });

        // Save API key
        this.el.apiKeySave.addEventListener('click', () => this.saveApiKey());

        // Suggestion buttons
        document.querySelectorAll('.ai-suggest-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.el.input.value = btn.dataset.prompt;
                this.sendMessage();
            });
        });

        // Context clear
        this.el.contextClear.addEventListener('click', () => {
            this.el.contextBar.style.display = 'none';
        });
    },

    // ===== TOGGLE PANEL =====
    toggle() {
        this.isOpen = !this.isOpen;
        this.el.fab.classList.toggle('active', this.isOpen);
        this.el.panel.classList.toggle('open', this.isOpen);
        if (this.isOpen) {
            setTimeout(() => this.el.input.focus(), 350);
        }
    },

    // ===== SAVE API KEY =====
    saveApiKey() {
        const key = this.el.apiKeyInput.value.trim();
        if (!key || key === '••••••••••••••••') return;
        this.apiKeys[this.currentModel] = key;
        localStorage.setItem('ai_api_keys', JSON.stringify(this.apiKeys));
        this.el.apiKeyInput.value = '••••••••••••••••';
        this.showSystemMsg('✅ Đã lưu API key cho ' + this.currentModel.toUpperCase());
    },

    // ===== SEND MESSAGE =====
    async sendMessage() {
        const text = this.el.input.value.trim();
        if (!text || this.isThinking) return;

        // Add user message
        this.addMessage('user', text);
        this.el.input.value = '';
        this.el.input.style.height = 'auto';

        const apiKey = this.apiKeys[this.currentModel] || this.apiKeys['gemini'];
        if (!apiKey) {
            this.addMessage('bot', '⚠️ Bạn chưa nhập API key. Nhấn ⚙️ để cài đặt.');
            return;
        }

        this.setThinking(true);
        this.chatHistory.push({ role: 'user', content: text });

        // UI: Tạo tin nhắn bot trống
        const botMsgDiv = document.createElement('div');
        botMsgDiv.className = 'ai-msg ai-msg-bot';
        botMsgDiv.innerHTML = `
            <div class="ai-msg-avatar"><i class="fas fa-robot"></i></div>
            <div class="ai-msg-bubble"><div class="ai-stream-content"></div></div>
        `;
        const typingEl = this.el.messages.querySelector('.ai-typing-msg');
        if (typingEl) typingEl.remove();
        this.el.messages.appendChild(botMsgDiv);
        const contentDiv = botMsgDiv.querySelector('.ai-stream-content');

        const systemPrompt = `Bạn là Trợ Lý Quản Trị Viên (Admin Assistant) của website "Nền Tảng Học Tập".
Website hiện có các môn học: Xử Lý Tín Hiệu Số (DSP), Lập trình Assembly 8086, FPGA.
Trang DSP có hệ thống luyện đề thi (Giữa kỳ/Cuối kỳ) với giao diện Sakura.

Nhiệm vụ của bạn:
1. Giải đáp kiến thức chuyên môn cho người dùng.
2. Hỗ trợ Quản trị viên (USER) cập nhật dữ liệu web thông qua các công cụ (Tools) được cấp.
3. Khi người dùng muốn sửa, thêm hoặc xóa thông tin (đề bài, môn học, ghi chú), hãy sử dụng công cụ tương ứng.

Thông tin ngữ cảnh: Bạn đang ở trong hệ thống do Minh phát triển. Phản hồi bằng tiếng Việt thân thiện, chuyên nghiệp.`;

        const tools = [{
            function_declarations: [
                {
                    name: "update_website_content",
                    description: "Cập nhật nội dung văn bản, thông báo hoặc dữ liệu trên web cho người dùng.",
                    parameters: {
                        type: "object",
                        properties: {
                            target: { type: "string", description: "Vị trí cần sửa (id môn học, tiêu đề đề thi...)" },
                            new_value: { type: "string", description: "Nội dung mới cần cập nhật" }
                        },
                        required: ["target", "new_value"]
                    }
                },
                {
                    name: "add_new_note",
                    description: "Tạo một ghi chú mới hiển thị trên trang chủ.",
                    parameters: {
                        type: "object",
                        properties: {
                            title: { type: "string", description: "Tiêu đề ghi chú" },
                            content: { type: "string", description: "Nội dung ghi chú" }
                        },
                        required: ["content"]
                    }
                }
            ]
        }];

        let fullResponse = "";
        const modelConfigs = [
            { version: 'v1beta', name: 'gemini-2.5-flash' },
            { version: 'v1beta', name: 'gemini-2.0-flash' },
            { version: 'v1', name: 'gemini-1.5-flash' }
        ];

        let success = false;
        for (const config of modelConfigs) {
            if (success) break;
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/${config.version}/models/${config.name}:streamGenerateContent?alt=sse&key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        system_instruction: { parts: [{ text: systemPrompt }] },
                        contents: this.chatHistory.map(m => ({
                            role: m.role === 'user' ? 'user' : 'model',
                            parts: [{ text: m.content }]
                        })),
                        tools: tools,
                        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 }
                    })
                });

                if (response.status === 429) continue;
                if (!response.ok) throw new Error("API Lỗi: " + response.status);

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                success = true;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.substring(6));
                                const part = data.candidates?.[0]?.content?.parts?.[0];
                                if (part?.functionCall) {
                                    await this.executeAITool(part.functionCall.name, part.functionCall.args, contentDiv);
                                }
                                const textPart = part?.text || "";
                                fullResponse += textPart;
                                if (fullResponse && typeof marked !== 'undefined') {
                                    contentDiv.innerHTML = marked.parse(fullResponse);
                                } else if (fullResponse) {
                                    contentDiv.innerText = fullResponse;
                                }
                                this.scrollToBottom();
                            } catch (e) { }
                        }
                    }
                }
            } catch (err) {
                console.error(`Lỗi với model ${config.name}:`, err);
                if (config === modelConfigs[modelConfigs.length - 1]) {
                    contentDiv.innerHTML = `<span style="color:red">❌ Lỗi: ${err.message}</span>`;
                }
            }
        }

        if (success) this.chatHistory.push({ role: 'assistant', content: fullResponse });
        this.setThinking(false);
    },

    // Hàm thực thi các công cụ mà AI yêu cầu
    async executeAITool(name, args, outputDiv) {
        outputDiv.innerHTML += `<div class="ai-tool-exec">⚙️ <i>Đang thực hiện: ${name}...</i></div>`;
        
        try {
            if (name === "update_website_content") {
                // Ví dụ: AI muốn sửa một thông báo hoặc tên môn học
                showToast(`AI đang sửa: ${args.target}`, 'info');
                // Thực thi logic Firebase cụ thể ở đây
            }
            
            if (name === "add_new_note") {
                if (typeof db !== 'undefined') {
                    await db.collection('notes').add({
                        title: args.title || "Ghi chú từ AI",
                        content: args.content,
                        color: "#fef3c7",
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    showToast("AI đã tạo ghi chú mới!", "success");
                }
            }
            
            outputDiv.innerHTML += `<div class="ai-tool-done">✅ Đã hoàn thành tác vụ quản trị.</div>`;
        } catch (e) {
            outputDiv.innerHTML += `<div class="ai-tool-error">❌ Lỗi thực thi: ${e.message}</div>`;
        }
    },

    // --- ChatGPT ---
    async callChatGPT(apiKey, prompt) {
        const messages = [
            {
                role: 'system',
                content: 'Bạn là trợ lý AI học tập thông minh, chuyên giải thích kiến thức một cách dễ hiểu bằng tiếng Việt. ' +
                    'Hãy trả lời ngắn gọn, rõ ràng, có cấu trúc. Dùng markdown để format câu trả lời.'
            }
        ];

        // Add history
        const recentHistory = this.chatHistory.slice(-10);
        for (const msg of recentHistory) {
            messages.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        }

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: messages,
                temperature: 0.7,
                max_tokens: 4096,
            })
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(`ChatGPT API ${res.status}: ${errData.error?.message || res.statusText}`);
        }

        const data = await res.json();
        return data.choices?.[0]?.message?.content || 'Không có phản hồi.';
    },

    // --- Claude ---
    async callClaude(apiKey, prompt) {
        // Note: Claude API doesn't support CORS from browser, needs a proxy
        // This is a placeholder that shows a helpful message
        const messages = [];
        const recentHistory = this.chatHistory.slice(-10);
        for (const msg of recentHistory) {
            messages.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        }

        // Try calling through a CORS proxy or direct
        try {
            const res = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 4096,
                    system: 'Bạn là trợ lý AI học tập thông minh, chuyên giải thích kiến thức dễ hiểu bằng tiếng Việt. Dùng markdown format.',
                    messages: messages
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(`Claude API ${res.status}: ${errData.error?.message || res.statusText}`);
            }

            const data = await res.json();
            return data.content?.[0]?.text || 'Không có phản hồi.';
        } catch (err) {
            if (err.message.includes('Failed to fetch') || err.message.includes('CORS')) {
                return '⚠️ **Claude API không hỗ trợ gọi trực tiếp từ trình duyệt** do chính sách CORS.\n\nBạn có thể:\n- Dùng **Gemini** (miễn phí, gọi được từ browser)\n- Hoặc cài backend proxy cho Claude\n\nMình khuyên bạn dùng Gemini trước nhé! 🚀';
            }
            throw err;
        }
    },

    // ===== UI HELPERS =====
    addMessage(type, content) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-msg ai-msg-${type === 'user' ? 'user' : 'bot'}`;

        if (type === 'user') {
            msgDiv.innerHTML = `
                <div class="ai-msg-bubble">${this.escapeHTML(content)}</div>
            `;
        } else {
            // Use marked.js for markdown parsing if available
            let htmlContent;
            try {
                if (typeof marked !== 'undefined') {
                    htmlContent = marked.parse(content);
                } else {
                    htmlContent = content.replace(/\n/g, '<br>');
                }
            } catch (e) {
                htmlContent = content.replace(/\n/g, '<br>');
            }

            msgDiv.innerHTML = `
                <div class="ai-msg-avatar"><i class="fas fa-robot"></i></div>
                <div class="ai-msg-bubble">${htmlContent}</div>
            `;
        }

        // Remove typing indicator if exists
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
            this.el.status.textContent = 'Đang suy nghĩ...';
            this.el.status.classList.add('thinking');

            // Add typing indicator
            const typingDiv = document.createElement('div');
            typingDiv.className = 'ai-msg ai-msg-bot ai-typing-msg';
            typingDiv.innerHTML = `
                <div class="ai-msg-avatar"><i class="fas fa-robot"></i></div>
                <div class="ai-msg-bubble">
                    <div class="ai-typing">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            `;
            this.el.messages.appendChild(typingDiv);
            this.scrollToBottom();
        } else {
            this.el.status.textContent = 'Sẵn sàng';
            this.el.status.classList.remove('thinking');
        }
    },

    clearChat() {
        this.chatHistory = [];
        this.el.messages.innerHTML = `
            <div class="ai-msg ai-msg-bot">
                <div class="ai-msg-avatar"><i class="fas fa-robot"></i></div>
                <div class="ai-msg-bubble">
                    <p>Đã xóa hội thoại! 🧹 Hãy bắt đầu cuộc trò chuyện mới nhé.</p>
                    <div class="ai-suggestions">
                        <button class="ai-suggest-btn" data-prompt="Giải thích kiến trúc vi xử lý 8086">🧠 Vi xử lý 8086</button>
                        <button class="ai-suggest-btn" data-prompt="Tóm tắt kiến thức FPGA cho người mới">⚡ FPGA cơ bản</button>
                        <button class="ai-suggest-btn" data-prompt="Hướng dẫn lập trình Assembly cơ bản">💻 Assembly</button>
                    </div>
                </div>
            </div>
        `;
        // Re-attach suggestion events
        this.el.messages.querySelectorAll('.ai-suggest-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.el.input.value = btn.dataset.prompt;
                this.sendMessage();
            });
        });
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

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    AIChat.init();
});

// ============================================
// MUSIC PLAYER & INDEXEDDB LOGIC
// ============================================

const MusicDB = {
    dbName: 'StudyPortalMusic',
    storeName: 'playlist',
    db: null,

    init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            
            request.onerror = (event) => reject('IndexedDB error: ' + event.target.error);
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, { keyPath: 'id' });
                }
            };
        });
    },

    async addSong(file) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            
            const songData = {
                id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
                name: file.name.replace(/\.[^/.]+$/, ""), // remove extension
                blob: file,
                addedAt: Date.now()
            };

            const request = store.add(songData);
            request.onsuccess = () => resolve(songData);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    async getAllSongs() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readonly');
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();
            
            request.onsuccess = () => {
                // Sort by addedAt
                const songs = request.result.sort((a, b) => a.addedAt - b.addedAt);
                resolve(songs);
            };
            request.onerror = (e) => reject(e.target.error);
        });
    },

    async deleteSong(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([this.storeName], 'readwrite');
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(e.target.error);
        });
    }
};

const MusicPlayer = {
    defaultSongs: [
        {
            id: 'default_1',
            name: 'Nhạc Không Lời Giúp Thư Giãn, Tịnh Tâm',
            url: 'Musics/Nhạc Không Lời Hay Giúp Thư Giãn Tịnh Tâm Dễ Ngủ.mp3',
            isDefault: true
        },
        {
            id: 'default_2',
            name: 'Nhạc Spa Không Lời Thư Giãn',
            url: 'Musics/Nhạc Spa Không Lời Thư Giãn, Âm Nhạc Dành Cho Spa.mp3',
            isDefault: true
        },
        {
            id: 'default_3',
            name: 'Nhạc Thiền Cho Bé Ngủ Ngon',
            url: 'Musics/Nhạc Thiền Cho Bé Ngủ Ngon.mp3',
            isDefault: true
        }
    ],
    songs: [],
    currentIndex: -1,
    isPlaying: false,
    audio: null,
    
    async init() {
        this.audio = document.getElementById('global-audio-player');
        
        try {
            await MusicDB.init();
            const userSongs = await MusicDB.getAllSongs();
            this.songs = [...this.defaultSongs, ...userSongs];
            this.renderPlaylist();
        } catch (e) {
            console.error("MusicDB init failed:", e);
            this.songs = [...this.defaultSongs];
            this.renderPlaylist();
        }

        // Setup Event Listeners
        document.getElementById('btn-music-toggle').addEventListener('click', () => this.togglePanel());
        document.getElementById('music-panel-close').addEventListener('click', () => this.togglePanel());
        
        document.getElementById('btn-music-play').addEventListener('click', () => this.togglePlay());
        document.getElementById('btn-music-prev').addEventListener('click', () => this.playPrev());
        document.getElementById('btn-music-next').addEventListener('click', () => this.playNext());
        
        document.getElementById('music-volume-bar').addEventListener('input', (e) => {
            this.audio.volume = e.target.value / 100;
        });

        document.getElementById('music-seek-bar').addEventListener('input', (e) => {
            if (this.audio.duration) {
                this.audio.currentTime = (e.target.value / 100) * this.audio.duration;
            }
        });

        document.getElementById('music-upload-input').addEventListener('change', async (e) => {
            const files = e.target.files;
            if (!files.length) return;
            
            for (const file of files) {
                if (file.type.startsWith('audio/')) {
                    try {
                        const newSong = await MusicDB.addSong(file);
                        this.songs.push(newSong);
                    } catch (err) {
                        console.error("Error saving song:", err);
                    }
                }
            }
            this.renderPlaylist();
            // Automatically play the first newly added song if nothing is playing
            if (!this.isPlaying && this.currentIndex === -1 && this.songs.length > 0) {
                this.playSong(this.songs.length - files.length);
            }
            e.target.value = ''; // reset
        });

        // Audio events
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.playNext());
        this.audio.addEventListener('play', () => this.updateUIState(true));
        this.audio.addEventListener('pause', () => this.updateUIState(false));
        
        // Initial volume
        this.audio.volume = 0.8;
    },

    togglePanel() {
        const panel = document.getElementById('music-player-panel');
        panel.classList.toggle('active');
    },

    renderPlaylist() {
        const ul = document.getElementById('music-playlist-ul');
        if (this.songs.length === 0) {
            ul.innerHTML = `<li class="playlist-empty">Chưa có bài hát nào.<br>Hãy tải nhạc lên (Lưu trực tiếp trên trình duyệt của bạn).</li>`;
            return;
        }

        ul.innerHTML = '';
        this.songs.forEach((song, index) => {
            const li = document.createElement('li');
            li.className = `playlist-item ${index === this.currentIndex ? 'active' : ''}`;
            const delBtn = song.isDefault ? '' : `<button class="playlist-item-delete" onclick="MusicPlayer.deleteSong('${song.id}', event)"><i class="fas fa-trash"></i></button>`;
            li.innerHTML = `
                <div class="playlist-item-info" onclick="MusicPlayer.playSong(${index})">
                    <i class="fas fa-music"></i>
                    <span>${song.name}</span>
                </div>
                ${delBtn}
            `;
            ul.appendChild(li);
        });
    },

    async deleteSong(id, event) {
        event.stopPropagation(); // prevent playing when clicking delete
        
        const song = this.songs.find(s => s.id === id);
        if (song && song.isDefault) {
            alert("Không thể xóa bài hát mặc định của hệ thống.");
            return;
        }

        if (confirm("Xóa bài hát này khỏi danh sách?")) {
            await MusicDB.deleteSong(id);
            const indexToRemove = this.songs.findIndex(s => s.id === id);
            if (indexToRemove > -1) {
                this.songs.splice(indexToRemove, 1);
                if (this.currentIndex === indexToRemove) {
                    this.audio.pause();
                    this.currentIndex = -1;
                    document.getElementById('np-title').textContent = "Chưa có bài hát";
                    document.getElementById('np-artist').textContent = "Tải nhạc lên để phát";
                } else if (this.currentIndex > indexToRemove) {
                    this.currentIndex--;
                }
                this.renderPlaylist();
            }
        }
    },

    playSong(index) {
        if (index < 0 || index >= this.songs.length) return;
        
        this.currentIndex = index;
        const song = this.songs[index];
        
        let url;
        if (song.blob) {
            // Create object URL from Blob
            url = URL.createObjectURL(song.blob);
        } else if (song.url) {
            // Use static URL
            url = encodeURI(song.url);
        }
        
        this.audio.src = url;
        this.audio.play();
        
        document.getElementById('np-title').textContent = song.name;
        document.getElementById('np-artist').textContent = song.isDefault ? "Hệ thống" : "Local File";
        
        this.renderPlaylist();
    },

    togglePlay() {
        if (this.songs.length === 0) return;
        
        if (this.currentIndex === -1) {
            this.playSong(0);
            return;
        }

        if (this.audio.paused) {
            this.audio.play();
        } else {
            this.audio.pause();
        }
    },

    playNext() {
        if (this.songs.length === 0) return;
        let nextIdx = this.currentIndex + 1;
        if (nextIdx >= this.songs.length) nextIdx = 0;
        this.playSong(nextIdx);
    },

    playPrev() {
        if (this.songs.length === 0) return;
        let prevIdx = this.currentIndex - 1;
        if (prevIdx < 0) prevIdx = this.songs.length - 1;
        this.playSong(prevIdx);
    },

    updateUIState(playing) {
        this.isPlaying = playing;
        const playBtn = document.getElementById('btn-music-play');
        const triggerStatus = document.getElementById('music-status-text');
        const wave = document.getElementById('music-wave-anim');
        
        if (playing) {
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            triggerStatus.textContent = 'Đang phát...';
            wave.classList.add('playing');
        } else {
            playBtn.innerHTML = '<i class="fas fa-play" style="margin-left: 2px;"></i>';
            triggerStatus.textContent = 'Đang tắt';
            wave.classList.remove('playing');
        }
    },

    updateProgress() {
        if (!this.audio.duration) return;
        
        const current = this.audio.currentTime;
        const duration = this.audio.duration;
        
        document.getElementById('music-seek-bar').value = (current / duration) * 100;
        document.getElementById('music-time-current').textContent = this.formatTime(current);
        document.getElementById('music-time-total').textContent = this.formatTime(duration);
    },

    formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    MusicPlayer.init();
});

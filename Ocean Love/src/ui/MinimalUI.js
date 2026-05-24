/* src/ui/MinimalUI.js
   Manages the HTML HUD interface, button clicks, transitions, and loading states
   Date: 2026-05-24
*/

export class MinimalUI {
  constructor(dayNightCycle, audioSystem, cameraManager) {
    this.dayNightCycle = dayNightCycle;
    this.audioSystem = audioSystem;
    this.cameraManager = cameraManager;

    this.loadingScreen = document.getElementById('loading-screen');
    this.loaderBar = document.getElementById('loader-bar');
    this.loaderStatus = document.getElementById('loader-status');
    this.enterBtn = document.getElementById('enter-btn');
    this.audioBtn = document.getElementById('audio-toggle-btn');
    this.audioIcon = document.getElementById('audio-icon');
    this.audioStatusText = document.getElementById('audio-status-text');
    this.interactHint = document.getElementById('interact-hint');
    this.envButtons = document.querySelectorAll('.right-controls button');

    this.initEvents();
  }

  updateProgress(percent, text = 'Đang tải...') {
    this.loaderBar.style.width = `${percent}%`;
    this.loaderStatus.textContent = `${text} (${Math.floor(percent)}%)`;

    if (percent >= 100) {
      this.loaderStatus.textContent = 'Đại dương đã sẵn sàng.';
      this.enterBtn.classList.add('visible');
    }
  }

  initEvents() {
    this.enterBtn.addEventListener('click', () => {
      this.loadingScreen.style.opacity = '0';
      this.loadingScreen.style.pointerEvents = 'none';

      const isPlaying = this.audioSystem.startAfterInteraction();
      this.updateAudioButtonState(isPlaying);

      this.interactHint.classList.add('visible');
      setTimeout(() => {
        this.interactHint.classList.remove('visible');
      }, 7000);
    });

    this.audioBtn.addEventListener('click', () => {
      const isPlaying = this.audioSystem.toggle();
      this.updateAudioButtonState(isPlaying);
    });

    this.envButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.envButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const envType = btn.getAttribute('data-env');
        this.dayNightCycle.transitionTo(envType);
      });
    });
  }

  updateAudioButtonState(isPlaying) {
    if (isPlaying) {
      this.audioIcon.textContent = '🔊';
      this.audioStatusText.textContent = 'Nhạc tắt';
      this.audioBtn.classList.add('active');
    } else {
      this.audioIcon.textContent = '🔇';
      this.audioStatusText.textContent = 'Nhạc bật';
      this.audioBtn.classList.remove('active');
    }
  }
}

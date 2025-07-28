document.addEventListener('DOMContentLoaded', () => {
  // Set current year in footer
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // --- Reusable Modal Logic ---
  const setupModal = (modalId, openBtnId, closeBtnId) => {
    const modal = document.getElementById(modalId);
    const openBtn = document.getElementById(openBtnId);
    const closeBtn = document.getElementById(closeBtnId);

    if (!modal || !openBtn || !closeBtn) {
      return null;
    }

    const openModal = () => modal.classList.add('active');
    const closeModal = () => modal.classList.remove('active');

    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);

    // Close modal if click outside modal content
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    return { modal, openModal, closeModal };
  };

  // Setup About Me Modal
  const aboutModal = setupModal('about-modal', 'open-about-btn', 'about-close-btn');

  // Setup Password Modal
  const passwordModal = setupModal('password-modal', 'open-forms-btn', 'pw-close-btn');

  if (passwordModal) {
    const pwForm = document.getElementById('pw-modal-form');
    const pwInput = document.getElementById('pw-modal-input');
    const pwError = document.getElementById('pw-modal-error');
    const correctPassword = "13"; // Change to your actual password!

    if (pwForm && pwInput && pwError) {
      const openBtn = document.getElementById('open-forms-btn');
      openBtn.addEventListener('click', () => {
        passwordModal.openModal();
        pwInput.value = '';
        pwError.style.display = 'none';
        pwInput.focus();
      });

      pwForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (pwInput.value === correctPassword) {
          passwordModal.closeModal();
          window.location.href = "forms.html";
        } else {
          pwError.style.display = 'block';
          pwInput.value = '';
          pwInput.focus();
          setTimeout(() => {
            pwError.style.display = 'none';
          }, 1600);
        }
      });
    }
  }

  // Close all modals with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
      if (aboutModal) aboutModal.closeModal();
      if (passwordModal) passwordModal.closeModal();
    }
  });

  // Subtle animation to main content on load
  const main = document.querySelector('.homepage-main');
  if (main) {
    setTimeout(() => {
      main.style.opacity = '1';
      main.style.transform = 'translateY(0)';
    }, 100);
  }

  // --- GIF & Sound Animation ---

  const logo = document.querySelector('.logo');

  // Cat data
  const catGifDisplay = document.getElementById('cat-gif-display');
  const catGifImage = document.getElementById('cat-random-gif');
  const catSounds = [
    document.getElementById('meow1-sound'),
    document.getElementById('meow2-sound'),
    document.getElementById('meow3-sound'),
  ];
  const catGifs = ['cat1.gif', 'cat2.gif', 'cat3.gif'];

  // Dog data
  const dogGifDisplay = document.getElementById('dog-gif-display');
  const dogGifImage = document.getElementById('dog-random-gif');
  const dogSounds = [
    document.getElementById('dog1-sound'),
    document.getElementById('dog2-sound'),
    document.getElementById('dog3-sound'),
  ];
  const dogGifs = ['dog1.gif', 'dog2.gif', 'dog3.gif'];

  let isGifShowing = false;

  if (logo && catGifDisplay && dogGifDisplay) {
    logo.addEventListener('click', () => {
      if (isGifShowing) return;

      isGifShowing = true;

      const isCat = Math.random() < 0.5; // 50% chance cat or dog

      if (isCat) {
        const idx = Math.floor(Math.random() * catGifs.length);
        catGifImage.src = `images/${catGifs[idx]}`;
        catGifDisplay.classList.add('active');
        dogGifDisplay.classList.remove('active');

        const sound = catSounds[idx];
        if (sound) {
          sound.currentTime = 0;
          sound.play().catch((e) => console.warn('Cat sound play error:', e));
        }

        setTimeout(() => {
          catGifDisplay.classList.remove('active');
          isGifShowing = false;
        }, 3000);
      } else {
        const idx = Math.floor(Math.random() * dogGifs.length);
        dogGifImage.src = `images/${dogGifs[idx]}`;
        dogGifDisplay.classList.add('active');
        catGifDisplay.classList.remove('active');

        const sound = dogSounds[idx];
        if (sound) {
          sound.currentTime = 0;
          sound.play().catch((e) => console.warn('Dog sound play error:', e));
        }

        setTimeout(() => {
          dogGifDisplay.classList.remove('active');
          isGifShowing = false;
        }, 3000);
      }
    });
  }
});

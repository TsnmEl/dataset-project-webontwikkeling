document.addEventListener('DOMContentLoaded', function () {
  const editPanel = document.getElementById('edit-panel');
  if (editPanel) {
    const toggleEditPanel = () => {
      const hidden = editPanel.classList.toggle('edit-panel--hidden');
      if (!hidden) editPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    document.getElementById('edit-toggle-btn').addEventListener('click', toggleEditPanel);
    document.getElementById('edit-panel-close').addEventListener('click', toggleEditPanel);
    document.getElementById('edit-cancel-btn').addEventListener('click', toggleEditPanel);
  }

  const videoPopup = document.getElementById('video-popup');
  const popupVideo = document.getElementById('popup-video');
  const videoTitle = document.getElementById('video-title');

  const openVideo = (url, name) => { videoTitle.textContent = name; popupVideo.src = url; videoPopup.classList.add('open'); };
  const closeVideo = () => { videoPopup.classList.remove('open'); popupVideo.src = ''; };

  document.querySelectorAll('.ability-clickable').forEach(tag => {
    tag.addEventListener('click', () => openVideo(tag.dataset.videoUrl, tag.dataset.videoName));
  });

  videoPopup.querySelector('.video-popup-close').addEventListener('click', closeVideo);
  videoPopup.addEventListener('click', e => { if (e.target === videoPopup) closeVideo(); });

});
export default function prepareVideoWithText(videoId) {
  let player;
  function onPlayerReady() {
    const videoIframeWrapper = document.querySelector('.video-iframe-wrapper');
    const videoPlayButton = document.querySelector(
      '.video-iframe-wrapper .video-play-btn'
    );
    if (videoPlayButton && videoIframeWrapper) {
      videoPlayButton.addEventListener('click', () => {
        videoIframeWrapper.classList.add('video-is-playing');
        player.playVideo();
      });
    }
  }

  function onPlayerStateChange(event) {
    const playerStatus = event.data;
    if (playerStatus === 0 || playerStatus === 2) {
      const videoIframeWrapper = document.querySelector(
        '.video-iframe-wrapper'
      );
      const videoPlayButton = document.querySelector(
        '.video-iframe-wrapper .video-play-btn'
      );
      if (videoPlayButton && videoIframeWrapper) {
        videoIframeWrapper.classList.remove('video-is-playing');
      }
    }
  }
  if (document.querySelector('.video-iframe-wrapper')) {
    const tag = document.createElement('script');
    tag.id = 'iframe-demo';
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    window.onYouTubeIframeAPIReady = () => {
      player = new window.YT.Player('video-iframe', {
        class: 'embed-responsive-item',
        videoId,
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    };
  }
}

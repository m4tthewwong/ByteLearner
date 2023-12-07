

function onYouTubeIframeAPIReady() {
    // Create a new YouTube player in the 'player' div
    var player = new YT.Player('player', {
      height: '360',
      width: '640',
      videoId: 'rGJieJ2xyTU', // Replace with the YouTube video ID
      playerVars: {
        'autoplay': 1, // Autoplay the video
        'controls': 1, // Show video controls
        'showinfo': 0, // Hide video information
        'rel': 0, // Disable related videos
        'modestbranding': 1 // Remove YouTube logo from the control bar
      },
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange
      }
    });
  }
  onYouTubeIframeAPIReady();

  function onPlayerReady(event) {
    
  }

  function onPlayerStateChange(event) {

  }
function onPlayerReady() {
    console.log('Player is ready');
}

onPlayerReady();

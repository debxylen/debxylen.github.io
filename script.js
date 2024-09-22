function handleHashChange() {
    const hash = window.location.hash;

    if (hash) {
        // Remove the hash after a delay
        setTimeout(() => {
            location.hash = ''; // Remove the hash
        }, 1000); // Adjust the duration as needed
    }
}

// Listen for the hash change event
window.addEventListener('hashchange', handleHashChange);

// Call it initially in case there's a hash on page load
handleHashChange();


const apiKey = 'AIzaSyBUANd3XnO1nlQzVnpuJ3x-BpF-lW443xU';
const channelId = 'UCdcZck-VWD2DQ6fC2DVJNog';
const maxResults = 200; // Adjust as needed

fetch(`https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=${maxResults}`)
    .then(response => response.json())
    .then(data => {
        const videos = data.items;
        const randomVideo = videos[Math.floor(Math.random() * videos.length)];
        const videoId = randomVideo.id.videoId;

        // Embed video
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        document.getElementById('random-video').innerHTML = `<iframe width="560" height="315" src="${embedUrl}" frameborder="0" allowfullscreen></iframe>`;
    })
    .catch(error => console.error('Error fetching videos:', error));

function _(element){
   return document.querySelector(element);
}


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



document.getElementById('about-me-button').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent default anchor click behavior

    const aboutSection = document.getElementById('about-section');
    const asideSection1 = document.querySelector('.sidebar-right');
    const asideSection2 = document.querySelector('.sidebar-left');
    const updatesSection = document.querySelector('.updates');
    const postsSection = document.querySelector('#posts');
    const ph = postsSection.offsetHeight;
    if (!aboutSection || !updatesSection || !postsSection) {
        console.error("One or more sections not found!");
        return;
    }

    // Find the posts link
    const postsLink = document.querySelector('.posts-link');


    // Add the "falldown" class to main and aside sections
    updatesSection.classList.add('falldown');
    asideSection1.classList.add('falldown');
    asideSection2.classList.add('falldown');

    // Listen for the animation end to hide the posts section
    updatesSection.addEventListener('animationend', function() {

        postsSection.style.height = `${ph}px`; //freeze height
        updatesSection.style.display = 'none';
        aboutSection.classList.remove('hidden');
        aboutSection.classList.add('fade-in');

        const aboutHeight = aboutSection.offsetHeight; // Get the height of the about section
        postsSection.style.transition = 'height 0.5s ease'; // Add transition for height
        postsSection.style.height = `${aboutHeight}px`; // Set the new height

    }, { once: true });
});







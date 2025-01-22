function playGif(element, gifSrc) {
    element.src = gifSrc;
}

function stopGif(element, staticSrc) {
    element.src = staticSrc;
}
window.onscroll = function() {
const button = document.querySelector('.back-to-top');
if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
button.classList.add('visible');
} else {
button.classList.remove('visible');
}
}

function scrollToTop() {
window.scrollTo({
top: 0,
behavior: 'smooth'
});
}
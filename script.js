// Hiệu ứng navbar khi cuộn

window.addEventListener("scroll", () => {

    const header = document.querySelector("header");

    if(window.scrollY > 50){

        header.style.background = "#000";

        header.style.boxShadow =
        "0 4px 20px rgba(255,208,0,0.08)";

    }else{

        header.style.background =
        "rgba(0,0,0,0.92)";

        header.style.boxShadow = "none";
    }

});

// Animation xuất hiện khi cuộn

const sections =
document.querySelectorAll(
'.programs,.features,.why-us,.testimonial'
);

const observer =
new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if(entry.isIntersecting){

            entry.target.style.opacity = "1";

            entry.target.style.transform =
            "translateY(0)";
        }

    });

});

sections.forEach(section => {

    section.style.opacity = "0";

    section.style.transform =
    "translateY(50px)";

    section.style.transition =
    "all 0.8s ease";

    observer.observe(section);

});



const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");
const nextBtn = document.getElementById("next");
const prevBtn = document.getElementById("prev");

let current = 0;

function showSlide(index){
    if (!slides.length || !dots.length) return;

    slides.forEach(slide =>
        slide.classList.remove("active")
    );

    dots.forEach(dot =>
        dot.classList.remove("active")
    );

    slides[index].classList.add("active");
    dots[index].classList.add("active");
}

if (nextBtn && prevBtn && slides.length && dots.length) {
    nextBtn.onclick = () => {
        current++;

        if(current >= slides.length){
            current = 0;
        }

        showSlide(current);
    };

    prevBtn.onclick = () => {
        current--;

        if(current < 0){
            current = slides.length - 1;
        }

        showSlide(current);
    };

    setInterval(() => {
        current++;

        if(current >= slides.length){
            current = 0;
        }

        showSlide(current);
    }, 4000);
}

const contactButtons = document.querySelectorAll('.card-content button');
const contactSection = document.getElementById('contact');
const meetTeamBtn = document.getElementById('meetTeamBtn');
const bookPersonalBtn = document.getElementById('bookPersonalBtn');
const viewHistoryBtn = document.getElementById('viewHistoryBtn');

contactButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

if (meetTeamBtn && contactSection) {
    meetTeamBtn.addEventListener('click', () => {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
}

function navigateWithTransition(href) {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) {
        window.location.assign(url.href);
        return;
    }
    if (url.pathname === window.location.pathname) return;
    transitionOverlay.classList.add('active');
    document.body.classList.add('fade-out');
    requestAnimationFrame(() => {
        window.location.assign(url.href);
    });
}

if (bookPersonalBtn) {
    bookPersonalBtn.addEventListener('click', () => {
        navigateWithTransition('admin.html');
    });
}

if (viewHistoryBtn) {
    viewHistoryBtn.addEventListener('click', () => {
        navigateWithTransition('history.html');
    });
}


const currentPage =
window.location.pathname.split("/").pop();

document.querySelectorAll("nav a")
.forEach(link => {

    link.classList.remove("active");

    const href =
    link.getAttribute("href");

    if(href === currentPage){
        link.classList.add("active");
    }

});

const transitionOverlay = document.createElement('div');
transitionOverlay.className = 'page-transition active';
document.body.appendChild(transitionOverlay);

function finishPageLoad() {
    document.body.classList.add('loaded');
    requestAnimationFrame(() => {
        transitionOverlay.classList.remove('active');
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', finishPageLoad);
} else {
    finishPageLoad();
}

document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || link.target) return;
    event.preventDefault();
    navigateWithTransition(href);
});


















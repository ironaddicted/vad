/*!
* Start Bootstrap - Agency v7.0.12 (https://startbootstrap.com/theme/agency)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-agency/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Navbar shrink function
    var navbarShrink = function () {
        const navbarCollapsible = document.body.querySelector('#mainNav');
        if (!navbarCollapsible) {
            return;
        }
        if (window.scrollY === 0) {
            navbarCollapsible.classList.remove('navbar-shrink')
        } else {
            navbarCollapsible.classList.add('navbar-shrink')
        }

    };

    // Shrink the navbar 
    navbarShrink();

    // Shrink the navbar when page is scrolled
    document.addEventListener('scroll', navbarShrink);

    //  Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});

/* Project filters and an accessible, progressively enhanced review carousel. */
window.addEventListener('DOMContentLoaded', () => {
    const filters = document.querySelector('.gallery-filters');
    const projects = [...document.querySelectorAll('.project-column')];
    const galleryStatus = document.querySelector('#gallery-status');
    if (filters) {
        filters.hidden = false;
        filters.addEventListener('click', event => {
            const button = event.target.closest('[data-filter]');
            if (!button) return;
            filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
            let count = 0;
            projects.forEach(project => {
                const matches = button.dataset.filter === 'all' || project.dataset.category.split(' ').includes(button.dataset.filter);
                project.hidden = !matches;
                if (matches) count++;
            });
            galleryStatus.textContent = `${count} projects shown: ${button.textContent}.`;
        });
    }

    document.querySelectorAll('[data-project-inquiry]').forEach(link => {
        link.addEventListener('click', event => {
            const modal = link.closest('.modal');
            if (!window.bootstrap || !modal) return;
            event.preventDefault();
            modal.addEventListener('hidden.bs.modal', () => {
                document.querySelector('#contact').scrollIntoView({ behavior: 'auto' });
                document.querySelector('#name').focus({ preventScroll: true });
            }, { once: true });
            bootstrap.Modal.getInstance(modal)?.hide();
        });
    });

    const section = document.querySelector('#reviews');
    const track = document.querySelector('#review-track');
    if (!section || !track) return;
    const controls = section.querySelector('.review-controls');
    const toggle = document.querySelector('#reviews-toggle');
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let paused = motion.matches;
    let hovering = false;
    let focused = false;
    let visible = false;
    let timer;
    controls.hidden = false;

    function updateRotation() {
        clearInterval(timer);
        toggle.textContent = paused ? 'Start rotation' : 'Pause rotation';
        if (!paused && !hovering && !focused && visible && !document.hidden) {
            timer = setInterval(() => move(1), 6000);
        }
    }
    function move(direction) {
        const step = track.querySelector('.review-card').getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap);
        const end = track.scrollWidth - track.clientWidth;
        const target = direction > 0
            ? (track.scrollLeft >= end - 3 ? 0 : Math.min(end, track.scrollLeft + step))
            : (track.scrollLeft <= 3 ? end : Math.max(0, track.scrollLeft - step));
        track.scrollTo({ left: target, behavior: motion.matches ? 'auto' : 'smooth' });
    }
    function stopForInteraction() { paused = true; updateRotation(); }
    document.querySelector('#reviews-prev').addEventListener('click', () => { stopForInteraction(); move(-1); });
    document.querySelector('#reviews-next').addEventListener('click', () => { stopForInteraction(); move(1); });
    toggle.addEventListener('click', () => { paused = !paused; updateRotation(); });
    section.addEventListener('mouseenter', () => { hovering = true; updateRotation(); });
    section.addEventListener('mouseleave', () => { hovering = false; updateRotation(); });
    section.addEventListener('focusin', () => { focused = true; updateRotation(); });
    section.addEventListener('focusout', event => { focused = section.contains(event.relatedTarget); updateRotation(); });
    track.addEventListener('pointerdown', stopForInteraction);
    track.addEventListener('keydown', event => {
        if (event.target !== track || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        stopForInteraction();
        move(event.key === 'ArrowRight' ? 1 : -1);
    });
    document.addEventListener('visibilitychange', updateRotation);
    motion.addEventListener('change', () => { if (motion.matches) paused = true; updateRotation(); });
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => { visible = entries[0].isIntersecting; updateRotation(); }, { threshold: 0.15 }).observe(section);
    } else { visible = true; }
    updateRotation();
});

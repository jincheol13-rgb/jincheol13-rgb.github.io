document.addEventListener('DOMContentLoaded', () => {
    // Bottom navigation highlight logic
    const tabs = document.querySelectorAll('.tab-item');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Modal Logic
    const modal = document.getElementById('dest-modal');
    const closeBtn = document.querySelector('.close-btn');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const readMoreBtns = document.querySelectorAll('.read-more');

    readMoreBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const title = btn.getAttribute('data-title');
            const desc = btn.getAttribute('data-desc');
            const img = btn.getAttribute('data-img');

            if (title && desc && img) {
                e.preventDefault();
                modalTitle.textContent = title;
                modalDesc.textContent = desc;
                modalImg.src = img;
                modalImg.alt = title;
                
                modal.classList.add('show-modal');
                document.body.style.overflow = 'hidden'; 
            }
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show-modal');
        document.body.style.overflow = '';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show-modal');
            document.body.style.overflow = '';
        }
    });

    // Favorites Logic with LocalStorage
    let favorites = JSON.parse(localStorage.getItem('yangguFavorites')) || [];
    const likeBtns = document.querySelectorAll('.like-btn');
    const tabFavorites = document.getElementById('tab-favorites');
    const favPanel = document.getElementById('favorites-panel');
    const closeFavBtn = document.querySelector('.close-fav-btn');
    const favList = document.getElementById('favorites-list');

    // Mock Coordinates for Map
    const POICoords = {
        "박수근미술관": [38.0965, 127.8942],
        "국토정중앙천문대": [38.0865, 127.9142],
        "두타연": [38.2065, 127.9042],
        "한반도섬": [38.1165, 127.8842],
        "양구재래식손두부 본점": [38.1070, 127.9050],
        "도촌막국수": [38.0980, 127.9120],
        "청수골쉼터": [38.0990, 127.9100],
        "전주식당": [38.1055, 127.9030],
        "감람원": [38.1060, 127.9060],
        "광치막국수": [38.1260, 127.9260],
        "꽃보다 소 양구점": [38.1040, 127.9020],
        "도촌삼계탕": [38.1020, 127.9080],
        "도촌막국수식당": [38.0980, 127.9120],
        "돈 갈비": [38.1075, 127.9015],
        "모범떡볶이": [38.1062, 127.9045],
        "비비큐·우쿠야": [38.1058, 127.9035],
        "샤브향": [38.1068, 127.9025],
        "소나무함흥냉면막국수": [38.1030, 127.9070],
        "시래정": [38.1050, 127.9055],
        "양구수산횟집": [38.1080, 127.9040],
        "오래드림고원": [38.1085, 127.9045],
        "이가돈가": [38.1072, 127.9065],
        "장수오골계": [38.1088, 127.9038],
        "청참치": [38.1082, 127.9042],
        "최가네": [38.1090, 127.9050],
        "회마을": [38.1065, 127.9042]
    };

    let favMap = null;
    let mapMarkers = [];

    function initOrUpdateMap() {
        if (typeof google === 'undefined' || !google.maps) {
            console.warn("Google Maps API not loaded");
            return;
        }

        if (!favMap) {
            favMap = new google.maps.Map(document.getElementById('fav-map'), {
                zoom: 12,
                center: { lat: 38.1065, lng: 127.9042 },
                disableDefaultUI: false
            });
        }

        mapMarkers.forEach(m => m.setMap(null));
        mapMarkers = [];

        if (favorites.length === 0) {
            favMap.setCenter({ lat: 38.1065, lng: 127.9042 });
            favMap.setZoom(12);
            return;
        }

        const bounds = new google.maps.LatLngBounds();
        const infoWindow = new google.maps.InfoWindow();

        favorites.forEach(fav => {
            const coords = POICoords[fav.title];
            if (coords) {
                const pos = { lat: coords[0], lng: coords[1] };
                const marker = new google.maps.Marker({
                    position: pos,
                    map: favMap,
                    title: fav.title
                });

                marker.addListener("click", () => {
                    infoWindow.setContent(`<div style="padding:4px;font-family:Pretendard,sans-serif;"><b>${fav.title}</b></div>`);
                    infoWindow.open(favMap, marker);
                });

                mapMarkers.push(marker);
                bounds.extend(pos);
            }
        });

        if (mapMarkers.length > 0) {
            favMap.fitBounds(bounds);
        }
    }

    // Initialize UI and Toggle Like
    likeBtns.forEach(btn => {
        const title = btn.getAttribute('data-title');
        const img = btn.getAttribute('data-img');
        const icon = btn.querySelector('i');

        if (!title) return;

        // Init based on saved favorites
        if (favorites.some(f => f.title === title)) {
            btn.classList.add('liked');
            icon.classList.replace('fa-regular', 'fa-solid');
        }

        btn.addEventListener('click', () => {
            btn.classList.toggle('liked');
            if (btn.classList.contains('liked')) {
                icon.classList.replace('fa-regular', 'fa-solid');
                if (!favorites.some(f => f.title === title)) {
                    favorites.push({ title, img });
                }
            } else {
                icon.classList.replace('fa-solid', 'fa-regular');
                favorites = favorites.filter(f => f.title !== title);
            }
            // Save to localStorage
            localStorage.setItem('yangguFavorites', JSON.stringify(favorites));
            renderFavorites();
        });
    });

    // Render Favorites
    function renderFavorites() {
        if (favorites.length === 0) {
            favList.innerHTML = '<div class="empty-msg">아직 찜한 장소가 없습니다.<br>마음에 드는 핫플에 하트를 눌러보세요!</div>';
            return;
        }

        favList.innerHTML = '';
        favorites.forEach(fav => {
            const favEl = document.createElement('div');
            favEl.className = 'fav-item';
            
            let mediaHtml = `<img src="${fav.img}" alt="${fav.title}">`;
            
            if (fav.img && fav.img.includes('placehold.co') && fav.img.includes('?text=')) {
                const emoji = fav.img.split('?text=')[1];
                mediaHtml = `<div class="fav-icon">${decodeURIComponent(emoji)}</div>`;
            } else if (fav.img && !fav.img.includes('/') && !fav.img.includes('.')) {
                mediaHtml = `<div class="fav-icon">${fav.img}</div>`;
            }

            favEl.innerHTML = `
                ${mediaHtml}
                <div class="fav-info">
                    <h4>${fav.title}</h4>
                </div>
                <button class="remove-fav-btn" style="margin-left: auto; background: none; border: none; color: #ff4757; font-size: 1.1rem; cursor: pointer; padding: 8px;"><i class="fa-solid fa-trash-can"></i></button>
            `;
            
            const removeBtn = favEl.querySelector('.remove-fav-btn');
            removeBtn.addEventListener('click', () => {
                favorites = favorites.filter(item => item.title !== fav.title);
                localStorage.setItem('yangguFavorites', JSON.stringify(favorites));
                
                // Sync main view like buttons
                likeBtns.forEach(btn => {
                    if (btn.getAttribute('data-title') === fav.title) {
                        btn.classList.remove('liked');
                        btn.querySelector('i').classList.replace('fa-solid', 'fa-regular');
                    }
                });
                
                renderFavorites();
            });

            favList.appendChild(favEl);
        });

        if (favPanel.classList.contains('show-panel')) {
            initOrUpdateMap();
        }
    }

    // Open/Close Favorites Panel
    function openFavoritesPanel(e) {
        if (e) e.preventDefault();
        favPanel.classList.add('show-panel');
        renderFavorites();
        setTimeout(initOrUpdateMap, 100);
    }

    tabFavorites.addEventListener('click', openFavoritesPanel);
    
    const desktopTabFavorites = document.getElementById('desktop-tab-favorites');
    if (desktopTabFavorites) {
        desktopTabFavorites.addEventListener('click', openFavoritesPanel);
    }

    closeFavBtn.addEventListener('click', () => {
        favPanel.classList.remove('show-panel');
    });

    // Auto-scroll Carousel
    const carouselTrack = document.getElementById('auto-carousel');
    if (carouselTrack) {
        setInterval(() => {
            const slideWidth = carouselTrack.querySelector('.carousel-slide').offsetWidth + 12; // width + gap
            const maxScroll = carouselTrack.scrollWidth - carouselTrack.clientWidth;
            
            if (carouselTrack.scrollLeft >= maxScroll - 10) {
                // Reset to start
                carouselTrack.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                // Scroll to next slide
                carouselTrack.scrollBy({ left: slideWidth, behavior: 'smooth' });
            }
        }, 3000); // 3 seconds interval
    }

    // Back to Top Button Logic
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // EmailJS Contact Form Logic
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('contact-submit-btn');

    if (contactForm && submitBtn) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Prevent double submissions
            submitBtn.classList.add('loading');
            const originalBtnContent = submitBtn.innerHTML;
            submitBtn.innerHTML = `<span>전송 중...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;
            submitBtn.disabled = true;

            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const title = document.getElementById('contact-title').value.trim();
            const message = document.getElementById('contact-message').value.trim();
            const time = new Date().toLocaleString('ko-KR');

            const templateParams = {
                name: name,
                email: email,
                title: title,
                message: message,
                time: time
            };

            emailjs.send('jincheol13', 'template_ew1g0co', templateParams)
                .then(function(response) {
                    alert('문의가 성공적으로 접수되었습니다. 곧 답변해 드리겠습니다! 😊');
                    contactForm.reset();
                }, function(error) {
                    console.error('EmailJS 전송 오류:', error);
                    alert('메일 전송에 실패했습니다. 잠시 후 다시 시도해 주세요. 😢');
                })
                .finally(function() {
                    submitBtn.classList.remove('loading');
                    submitBtn.innerHTML = originalBtnContent;
                    submitBtn.disabled = false;
                });
        });
    }

    // Notice Modal on Page Load
    const noticeModal = document.getElementById('notice-modal');
    const closeNoticeBtn = document.getElementById('close-notice-btn');

    if (noticeModal && closeNoticeBtn) {
        // Show modal on load
        noticeModal.classList.add('show-modal');
        document.body.style.overflow = 'hidden';

        closeNoticeBtn.addEventListener('click', () => {
            noticeModal.classList.remove('show-modal');
            document.body.style.overflow = '';
        });
    }
});

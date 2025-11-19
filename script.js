// Archivo script.js para Wolf Music

document.addEventListener('DOMContentLoaded', () => {

    // ====================================================================
    // 1. CONFIGURACIÓN DE GITHUB PAGES Y LISTA DE CANCIONES
    // ====================================================================

    // URL corregida: A la raíz del repositorio Musica/.
    const GITHUB_BASE_URL = "https://juandav04.github.io/Musica/"; 
    
    // URL para las portadas (asumiendo que tienes una carpeta 'covers')
    const COVERS_BASE_URL = GITHUB_BASE_URL + "covers/";
    
    let playlist = []; 
    let currentSongIndex = 0;
    let isPlaying = false;
    let likedSongs = []; 
    let isShuffling = false; 
    let repeatMode = 0; 
    
    // Lista de canciones con los nombres de archivo y portadas.
    const audioFiles = [
        { id: 0, title: "BZRP Music Sessions #54", artist: "ARCANGEL & BZRP", filename: "ARCANGEL_BZRP_MusicSessions_54_66_Bizarrap.mp3", cover: "ArcangelBZRP.jpg" },
        { id: 1, title: "Perfect (Sub Español)", artist: "Ed Sheeran", filename: "Ed_Sheeran_Perfect__subespañol_jisoelland.mp3", cover: "EdSheeranPerfect.jpg" },
        { id: 2, title: "Godzilla ft. Juice WRLD", artist: "Eminem", filename: "Eminem_GodzillafteJuiceWRLD(OfficialMusicVideo)_LyricalLemonade.mp3", cover: "Eminem_Godzilla.jpg" },
        { id: 3, title: "Believer", artist: "Imagine Dragons", filename: "ImagineDragons_Believer(OfficialMusicVideo)_ImagineDragonsVEVO.mp3", cover: "ImagineDragonsBeliever.jpg" },
        { id: 4, title: "Tusa", artist: "KAROL G & Nicki Minaj", filename: "KAROLG_NickiMinaj_Tusa(Official Video)KarolGVEVO.mp3", cover: "Tusa.jpg" },
        { id: 5, title: "Borró Cassette", artist: "Maluma", filename: "Maluma_BorroCassette(OfficialVideo)_MalumaVEVO.mp3", cover: "BorroCasette.jpg" },
        { id: 6, title: "Cuatro Babys", artist: "Maluma ft. Trap Capos", filename: "Maluma_CuatroBabys(OfficialVideo)ft.TrapCapos,Noriel,BryantMyers,Juhn_MalumaVEVO.mp3", cover: "MalumaCuatroBabys.jpg" },
        { id: 7, title: "BZRP Music Sessions #52", artist: "QUEVEDO & BZRP", filename: "QUEVEDO_BZRP_MusicSessions_52_66_Bizarrap.mp3", cover: "QuevedoBZRP.jpg" },
        { id: 8, title: "Blinding Lights", artist: "The Weeknd", filename: "TheWeeknd_BlindingLights(OfficialVideo)_TheWeekndVEVO.mp3", cover: "BlindingLights.jpg" },
        { id: 9, title: "Vete", artist: "Bad Bunny", filename: "Vete_BadBunny.mp3", cover: "VeteBadBunny.jpg" }
    ];

    // ====================================================================
    // 2. REFERENCIAS DEL DOM
    // ====================================================================

    const audioSource = document.getElementById('audio-source');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const shuffleBtn = document.getElementById('shuffle-btn'); 
    const repeatBtn = document.getElementById('repeat-btn'); 
    const progressBar = document.getElementById('progress-bar');
    const timeCurrent = document.getElementById('time-current-display'); 
    const timeDuration = document.getElementById('time-duration-display'); 
    const songTitleDisplay = document.getElementById('song-title');
    const songArtistDisplay = document.getElementById('song-artist');
    const playlistContainer = document.getElementById('playlist-container');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeIcon = document.getElementById('volume-icon'); 
    const likeBtn = document.getElementById('like-btn'); 
    const libraryListContainer = document.getElementById('library-list-container');
    const linkInicio = document.getElementById('link-inicio');
    const linkLibreria = document.getElementById('link-libreria');
    const viewInicio = document.getElementById('view-inicio');
    const viewLibreria = document.getElementById('view-libreria');
    
    // Referencia para la IMAGEN DE PORTADA PEQUEÑA ABAJO
    const currentCoverSmall = document.getElementById('current-cover-small'); 

    // Referencias para las tarjetas grandes (Éxitos de Hoy)
    const homeCards = [
        document.getElementById('card-index-0'),
        document.getElementById('card-index-4'),
        document.getElementById('card-index-9')
    ];


    // ====================================================================
    // 3. FUNCIONES DE NAVEGACIÓN Y LIBRERÍA
    // ====================================================================

    function formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    }

    function changeView(targetViewId, targetLinkId) {
        document.querySelectorAll('.main-view').forEach(view => {
            view.classList.add('hidden');
        });
        document.querySelectorAll('.main-nav .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const targetView = document.getElementById(targetViewId);
        if (targetView) targetView.classList.remove('hidden');
        const targetLink = document.getElementById(targetLinkId);
        if (targetLink) targetLink.classList.add('active');
        if (targetViewId === 'view-libreria') {
            renderLibrary();
        }
    }
    
    function toggleLike() {
        if (playlist.length === 0) return;
        const currentSong = playlist[currentSongIndex];
        const indexInLiked = likedSongs.findIndex(song => song.id === currentSong.id);
        if (indexInLiked === -1) {
            likedSongs.push(currentSong);
            likeBtn.classList.add('liked');
        } else {
            likedSongs.splice(indexInLiked, 1);
            likeBtn.classList.remove('liked');
        }
        if (!viewLibreria.classList.contains('hidden')) {
             renderLibrary();
        }
    }
    
    function updateLikeButtonState() {
        if (playlist.length === 0 || !likeBtn) return;
        const currentSong = playlist[currentSongIndex];
        const isLiked = likedSongs.some(song => song.id === currentSong.id);
        if (isLiked) {
            likeBtn.classList.add('liked');
        } else {
            likeBtn.classList.remove('liked');
        }
    }
    
    function renderLibrary() {
        if (!libraryListContainer) return;
        if (likedSongs.length === 0) {
            libraryListContainer.innerHTML = `
                <div style="padding: 30px; text-align: center; background-color: var(--color-accent-dark); border-radius: 8px; margin-top: 20px;">
                    <i class="fas fa-heart-broken" style="font-size: 3em; color: #555;"></i>
                    <p style="color: var(--color-text-light); margin-top: 10px;">Aún no tienes canciones guardadas.</p>
                    <p style="color: #777; font-size: 0.9em;">¡Reproduce una canción y haz clic en el corazón para añadirla a tu librería!</p>
                </div>
            `;
            return;
        }

        const listHtml = `
            <table class="library-table" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                <thead>
                    <tr style="border-bottom: 1px solid #333; color: var(--color-text-light); text-align: left; font-size: 0.9em;">
                        <th style="padding: 10px 0;">#</th>
                        <th style="padding: 10px 0;">Título</th>
                        <th style="padding: 10px 0;">Artista</th>
                        <th style="padding: 10px 0;"><i class="fas fa-clock"></i></th>
                    </tr>
                </thead>
                <tbody>
                    ${likedSongs.map((song, index) => `
                        <tr class="library-song-row" 
                            style="cursor: pointer; transition: background-color 0.1s;"
                            onmouseover="this.style.backgroundColor='#333'" 
                            onmouseout="this.style.backgroundColor='transparent'">
                            <td style="padding: 10px 0; color: #777;">${index + 1}</td>
                            <td style="padding: 10px 0; color: var(--color-text-active); font-weight: bold;">${song.title}</td>
                            <td style="padding: 10px 0;">${song.artist}</td>
                            <td style="padding: 10px 0; color: #777;">${formatTime(song.duration)}</td> 
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        libraryListContainer.innerHTML = listHtml;
    }

    // ====================================================================
    // 4. FUNCIONES DE REPRODUCCIÓN (Lógica de Covers)
    // ====================================================================

    function loadSong(index) {
        if (playlist.length === 0 || !audioSource) return;
        
        currentSongIndex = index;
        const song = playlist[currentSongIndex];
        
        // Carga la portada pequeña
        if (currentCoverSmall) {
             currentCoverSmall.src = COVERS_BASE_URL + song.cover;
        }

        audioSource.src = song.url; 
        
        if (songTitleDisplay) songTitleDisplay.textContent = song.title;
        if (songArtistDisplay) songArtistDisplay.textContent = song.artist;
        
        updateLikeButtonState(); 

        document.querySelectorAll('.playlist-link').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`.playlist-link[data-index="${currentSongIndex}"]`);
        if(activeLink) activeLink.classList.add('active');

        audioSource.load();
        if (progressBar) progressBar.style.width = '0%';
        if (timeCurrent) timeCurrent.textContent = '0:00'; 
        if (timeDuration) timeDuration.textContent = '0:00';
    }

    function renderPlaylist() {
        if (!playlistContainer) return;
        
        playlistContainer.innerHTML = '';
        
        const songsListHtml = playlist.map((song, index) => `
            <a href="#" 
                class="nav-link playlist-item playlist-link" 
                data-index="${index}" 
                data-title="${song.title}">
                <i class="fas fa-music"></i> 
                ${song.title}
            </a>
        `).join('');

        playlistContainer.innerHTML += songsListHtml;
        
        document.querySelectorAll('.playlist-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const index = parseInt(link.getAttribute('data-index'));
                loadSong(index);
                audioSource.play(); 
                isPlaying = true;
                playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
            });
        });
    }

    function togglePlayPause() {
        if (playlist.length === 0 || !audioSource || !playPauseBtn) return;
        if (isPlaying) {
            audioSource.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            audioSource.play().catch(error => {
                console.warn("La reproducción fue bloqueada. Haz clic en play una vez más.");
            });
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        }
        isPlaying = !isPlaying;
    }
    
    function toggleShuffle() {
        isShuffling = !isShuffling;
        shuffleBtn.classList.toggle('active', isShuffling);
    }

    function toggleRepeat() {
        repeatMode = (repeatMode + 1) % 3; 
        repeatBtn.classList.remove('active');
        repeatBtn.querySelector('i').className = 'fas fa-redo-alt'; 

        switch (repeatMode) {
            case 1: 
                repeatBtn.classList.add('active');
                audioSource.loop = false;
                break;
            case 2: 
                repeatBtn.classList.add('active');
                repeatBtn.querySelector('i').className = 'fas fa-redo-alt fa-rotate-180'; 
                audioSource.loop = true; 
                break;
            default: 
                audioSource.loop = false;
                break;
        }
    }

    function getNextIndex() {
        if (playlist.length === 0) return 0;
        if (isShuffling) {
            let randomIndex;
            do {
                randomIndex = Math.floor(Math.random() * playlist.length);
            } while (randomIndex === currentSongIndex); 
            return randomIndex;
        } else {
            return (currentSongIndex + 1) % playlist.length;
        }
    }

    function prevSong() {
        if (playlist.length === 0) return;
        currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
        loadSong(currentSongIndex);
        if (isPlaying) audioSource.play(); 
    }

    function nextSong() {
        if (playlist.length === 0) return;
        currentSongIndex = getNextIndex();
        loadSong(currentSongIndex);
        if (isPlaying) audioSource.play(); 
    }
    
    async function setupPlaylist() {
        playlist = audioFiles.map(song => ({
            ...song,
            url: GITHUB_BASE_URL + song.filename
        }));
        
        if (playlist.length > 0) {
            loadSong(currentSongIndex);
            renderPlaylist(); 
        }
    }

    // ====================================================================
    // 5. ESCUCHADORES DE EVENTOS (Incluye enlace de tarjetas)
    // ====================================================================

    setupPlaylist();

    // 1. ESCUCHADOR PARA LAS TARJETAS GRANDES ("Éxitos de Hoy")
    homeCards.forEach(card => {
        if (card) {
            card.addEventListener('click', () => {
                // Extrae el índice de la canción del ID del elemento (ej: 'card-index-0' -> 0)
                const indexStr = card.id.split('-').pop();
                const index = parseInt(indexStr);
                
                if (!isNaN(index)) {
                    loadSong(index);
                    
                    // Si ya está sonando algo, solo lo cambia. Si no, lo pone en play.
                    if (!isPlaying) {
                        togglePlayPause();
                    } else {
                        // Forzar el play si el usuario hizo clic en una tarjeta diferente
                        audioSource.play().catch(error => console.warn("Error al iniciar reproducción:", error));
                    }
                }
            });
        }
    });

    // 2. Escuchadores de la barra de reproducción
    if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlayPause);
    if (prevBtn) prevBtn.addEventListener('click', prevSong);
    if (nextBtn) nextBtn.addEventListener('click', nextSong);
    if (shuffleBtn) shuffleBtn.addEventListener('click', toggleShuffle); 
    if (repeatBtn) repeatBtn.addEventListener('click', toggleRepeat); 
    if (likeBtn) likeBtn.addEventListener('click', toggleLike);

    // 3. Escuchadores de navegación
    if (linkInicio) {
        linkInicio.addEventListener('click', (e) => {
            e.preventDefault();
            changeView('view-inicio', 'link-inicio');
        });
    }
    
    if (linkLibreria) {
        linkLibreria.addEventListener('click', (e) => {
            e.preventDefault();
            changeView('view-libreria', 'link-libreria');
        });
    }

    // 4. Escuchadores de Audio y Progreso
    if (audioSource) {
        audioSource.addEventListener('timeupdate', () => {
            const { currentTime, duration } = audioSource;
            if (duration) {
                const progressPercent = (currentTime / duration) * 100;
                if (progressBar) progressBar.style.width = `${progressPercent}%`;
                if (timeCurrent) timeCurrent.textContent = formatTime(currentTime);
            }
        });
        
        audioSource.addEventListener('ended', () => {
            if (repeatMode !== 2) {
                const nextIndex = getNextIndex();
                if (repeatMode === 0 && nextIndex === 0) {
                    loadSong(0); 
                    isPlaying = false;
                    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                    return;
                }
                loadSong(nextIndex);
                audioSource.play(); 
            }
        });
        
        audioSource.addEventListener('loadedmetadata', () => {
            if (timeDuration) timeDuration.textContent = formatTime(audioSource.duration);
            playlist[currentSongIndex].duration = audioSource.duration;
        });
    }

    // 5. Escuchador de Volumen
    if (volumeSlider && audioSource && volumeIcon) {
        audioSource.volume = volumeSlider.value / 100;

        volumeSlider.addEventListener('input', () => {
            const newVolume = volumeSlider.value / 100;
            audioSource.volume = newVolume;
            
            if (newVolume === 0) {
                volumeIcon.className = 'fas fa-volume-off';
            } else if (newVolume < 0.5) {
                volumeIcon.className = 'fas fa-volume-down';
            } else {
                volumeIcon.className = 'fas fa-volume-up';
            }
        });
    }
});
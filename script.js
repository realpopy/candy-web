// Script para mostrar solo el servicio seleccionado y efectos visuales
function mostrarServicio(servicioId) {
    const secciones = document.querySelectorAll('.servicio, .loteria');
    secciones.forEach(sec => {
        if (sec.id === servicioId) {
            sec.style.display = 'flex';
            sec.style.opacity = '0';
            sec.style.transform = 'translateY(20px)';
            requestAnimationFrame(() => {
                sec.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                sec.style.opacity = '1';
                sec.style.transform = 'translateY(0)';
            });
            const video = sec.querySelector('video');
            if (video) {
                video.currentTime = 0;
                video.muted = false;
                video.play().catch(e => {
                    console.warn('Error reproduciendo video en', servicioId + ':', e);
                    video.pause();
                });
            }
            // Lógica para #anuncios: cargar anuncios existentes
            if (servicioId === 'anuncios') {
                cargarAnuncios();
            }
        } else {
            sec.style.display = 'none';
            const video = sec.querySelector('video');
            if (video) {
                video.pause();
                video.currentTime = 0;
                video.muted = true;
            }
        }
    });
    const element = document.querySelector(`#${servicioId}`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function mostrarTodos() {
    const secciones = document.querySelectorAll('.servicio, .loteria');
    secciones.forEach(sec => {
        if (sec.id !== 'inicio') {
            sec.style.display = 'flex';
            sec.style.opacity = '1';
            sec.style.transform = 'translateY(0)';
            sec.style.transition = 'all 0.3s ease';
            const videos = sec.querySelectorAll('video');
            videos.forEach(video => {
                video.controls = true;
                video.muted = false;
                video.pause();
            });
            // Cargar anuncios si se muestra todos
            if (sec.id === 'anuncios') {
                cargarAnuncios();
            }
        } else {
            sec.style.display = 'none';
        }
    });
    document.querySelector('main').scrollIntoView({ behavior: 'smooth' });
}

// Funciones para anuncios
function cargarAnuncios() {
    const anuncios = JSON.parse(localStorage.getItem('anuncios') || '[]');
    const lista = document.getElementById('lista-anuncios');
    const sinAnuncios = document.querySelector('.mensaje-sin-anuncios');
    lista.innerHTML = '';
    if (anuncios.length === 0) {
        if (sinAnuncios) sinAnuncios.style.display = 'block';
    } else {
        if (sinAnuncios) sinAnuncios.style.display = 'none';
        anuncios.forEach((anuncio, index) => {
            const div = document.createElement('div');
            div.className = 'anuncio';
            div.innerHTML = `
                <h3>${anuncio.titulo}</h3>
                <p>${anuncio.descripcion}</p>
                ${anuncio.imagen ? `<img src="${anuncio.imagen}" alt="Imagen del anuncio" style="max-width: 100%;">` : ''}
                <button class="btn-delete" style="background-color: #ff4444; color: white; border: none; padding: 5px 10px; margin-top: 10px; cursor: pointer; border-radius: 4px;" onclick="deleteAnuncio(${index})">Eliminar Anuncio</button>
            `;
            lista.appendChild(div);
        });
    }
}

function deleteAnuncio(index) {
    const pass = prompt('Ingresa la contraseña de personal del hotel para eliminar:');
    if (pass === 'CANDY1234') {
        const anuncios = JSON.parse(localStorage.getItem('anuncios') || '[]');
        anuncios.splice(index, 1);
        localStorage.setItem('anuncios', JSON.stringify(anuncios));
        cargarAnuncios();
        alert('Anuncio eliminado exitosamente.');
    } else {
        alert('Contraseña incorrecta. Solo personal autorizado puede eliminar anuncios.');
    }
}

function enviarNotificacion(mensaje) {
    if ('Notification' in window && navigator.onLine) {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('CANDY VISTA PUERTO', {
                    body: mensaje,
                    icon: 'assets/favicon.ico',
                    badge: 'assets/favicon.ico'
                });
            }
        });
    }
}

function agregarAnuncio(titulo, descripcion, archivo) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const anuncios = JSON.parse(localStorage.getItem('anuncios') || '[]');
        anuncios.unshift({
            titulo,
            descripcion,
            imagen: e.target.result, // Base64 para persistencia local
            fecha: new Date().toISOString()
        });
        localStorage.setItem('anuncios', JSON.stringify(anuncios));
        cargarAnuncios(); // Recargar lista
        enviarNotificacion('¡CANDY acaba de realizar un nuevo anuncio! Revisa la sección de Anuncios.'); // Notificación si online
        document.getElementById('modal-upload').style.display = 'none';
        alert('Anuncio agregado exitosamente y notificado a usuarios online.');
    };
    if (archivo && archivo[0]) {
        reader.readAsDataURL(archivo[0]);
    } else {
        // Sin archivo, agregar directamente
        const anuncios = JSON.parse(localStorage.getItem('anuncios') || '[]');
        anuncios.unshift({ titulo, descripcion, fecha: new Date().toISOString() });
        localStorage.setItem('anuncios', JSON.stringify(anuncios));
        cargarAnuncios();
        enviarNotificacion('¡CANDY acaba de realizar un nuevo anuncio! Revisa la sección de Anuncios.');
        document.getElementById('modal-upload').style.display = 'none';
        alert('Anuncio agregado exitosamente y notificado a usuarios online.');
    }
}

// Efecto confetti mejorado para lotería (canvas con más partículas y física)
function lanzarConfetti() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const confetti = [];
    const numParticles = 150;
    for (let i = 0; i < numParticles; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            r: Math.random() * 6 + 2,
            d: Math.random() * 8 + 3,
            color: `hsl(${Math.random() * 360}, 100%, ${Math.random() * 30 + 50}%)`,
            tilt: Math.random() * 10 - 5,
            tiltSpeed: Math.random() > 0.5 ? 0.5 : -0.5,
            rotation: 0,
            rotationSpeed: Math.random() * 0.2 - 0.1
        });
    }
    let animationId;
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let active = false;
        confetti.forEach((c, i) => {
            c.tilt += c.tiltSpeed;
            c.y += c.d;
            c.rotation += c.rotationSpeed;
            ctx.save();
            ctx.translate(c.x + Math.cos(c.rotation) * 10, c.y + Math.sin(c.rotation) * 10);
            ctx.rotate(c.rotation);
            ctx.beginPath();
            ctx.lineWidth = c.r;
            ctx.strokeStyle = c.color;
            ctx.moveTo(c.tilt + c.r / 4, 0);
            ctx.lineTo(c.tilt, c.tilt + c.r / 4);
            ctx.stroke();
            ctx.restore();
            if (c.y > canvas.height) {
                confetti.splice(i, 1);
            } else {
                active = true;
            }
        });
        if (active) {
            animationId = requestAnimationFrame(draw);
        } else {
            cancelAnimationFrame(animationId);
            document.body.removeChild(canvas);
        }
    }
    draw();
    const resizeHandler = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeHandler);
    setTimeout(() => window.removeEventListener('resize', resizeHandler), 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar: ocultar todas las secciones excepto inicio
    const secciones = document.querySelectorAll('.servicio:not(#inicio), .loteria');
    secciones.forEach(sec => {
        sec.style.display = 'none';
    });
    window.location.hash = '#inicio';
    mostrarServicio('inicio');

    // Efecto dinámico para header: ocultar al scroll down, mostrar al scroll up
    const header = document.querySelector('header');
    let lastScrollY = window.scrollY;
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        if (currentScrollY > 100) {
            header.classList.add('scrolled');
            if (currentScrollY > lastScrollY && !header.classList.contains('hidden')) {
                header.classList.add('hidden');
            } else if (currentScrollY < lastScrollY && header.classList.contains('hidden')) {
                header.classList.remove('hidden');
            }
        } else {
            header.classList.remove('scrolled', 'hidden');
        }
        lastScrollY = currentScrollY;
    });

    // Event listeners para enlaces
    const enlaces = document.querySelectorAll('nav ul li a');
    enlaces.forEach(enlace => {
        enlace.addEventListener('click', (e) => {
            e.preventDefault();
            const id = enlace.getAttribute('href').replace('#', '');
            if (id !== window.location.hash.replace('#', '')) {
                window.location.hash = `#${id}`;
                mostrarServicio(id);
                enlaces.forEach(el => el.classList.remove('active'));
                enlace.classList.add('active');
            }
        });
    });

    // Botón mostrar todos
    const btnTodos = document.getElementById('mostrar-todos');
    if (btnTodos) {
        btnTodos.addEventListener('click', (e) => {
            e.preventDefault();
            mostrarTodos();
            window.location.hash = '';
        });
    }

    // Botón participar en lotería
    const btnParticipar = document.querySelector('.btn-participar');
    if (btnParticipar) {
        btnParticipar.addEventListener('click', (e) => {
            e.preventDefault();
            btnParticipar.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btnParticipar.style.transform = 'scale(1)';
                lanzarConfetti();
                if (confirm('¡Felicidades! Has activado tu entrada a la lotería. Visítanos para registrar tu tarjeta. 🎉 ¿Quieres más info?')) {
                    window.location.href = '#loteria';
                }
            }, 150);
        });
    }

    // Lógica para botón Agregar Anuncio
    const btnAgregar = document.getElementById('agregar-anuncio');
    if (btnAgregar) {
        btnAgregar.addEventListener('click', () => {
            const pass = prompt('Ingresa la contraseña de personal del hotel:');
            if (pass === 'CANDY1234') { // Contraseña actualizada
                document.getElementById('modal-upload').style.display = 'block';
            } else {
                alert('Contraseña incorrecta. Solo personal autorizado puede agregar anuncios.');
            }
        });
    }

    // Confirmar upload en modal
    const btnConfirmar = document.getElementById('confirmar-upload');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', () => {
            const titulo = document.getElementById('titulo-anuncio').value;
            const descripcion = document.getElementById('descripcion-anuncio').value;
            const archivo = document.getElementById('archivo-anuncio').files;
            if (titulo && descripcion) {
                agregarAnuncio(titulo, descripcion, archivo);
            } else {
                alert('Completa título y descripción.');
            }
        });
    }

    // Cerrar modal
    const modal = document.getElementById('modal-upload');
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Intersección Observer para videos
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    video.play().catch(e => console.warn('Lazy play error:', e));
                    observer.unobserve(video);
                }
            });
        }, { threshold: 0.5 });
        document.querySelectorAll('video').forEach(video => observer.observe(video));
    }
});
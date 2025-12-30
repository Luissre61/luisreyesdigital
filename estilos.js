
    function toggleCardColor(clickedCard) {
        // Esta parte es importante para asegurar que solo una tarjeta esté "activa" a la vez
        const allCards = document.querySelectorAll('.card-item'); 
        
        allCards.forEach(card => {
            if (card === clickedCard) {
                // Alterna la clase 'active-state' en la tarjeta clicada
                card.classList.toggle('active-state'); 

                // Aplica o remueve los estilos de fondo y texto basados en 'active-state'
                if (card.classList.contains('active-state')) {
                    // Si la tarjeta está activa
                    card.classList.add('bg-blue-900', 'text-white');
                    card.classList.remove('bg-white'); 
                    card.querySelectorAll('h2, p').forEach(el => {
                        el.classList.add('text-white');
                        if (el.tagName === 'H2') el.classList.remove('text-gray-800');
                        if (el.tagName === 'P') el.classList.remove('text-gray-600');
                    });
                } else {
                    // Si la tarjeta se desactiva
                    card.classList.remove('bg-blue-900', 'text-white');
                    card.classList.add('bg-white');
                    card.querySelectorAll('h2, p').forEach(el => {
                        el.classList.remove('text-white');
                        if (el.tagName === 'H2') el.classList.add('text-gray-800');
                        if (el.tagName === 'P') el.classList.add('text-gray-600');
                    });
                }
            } else {
                // Si es otra tarjeta (no la clicada) y está activa, desactívala
                if (card.classList.contains('active-state')) {
                    card.classList.remove('active-state');
                    card.classList.remove('bg-blue-900', 'text-white');
                    card.classList.add('bg-white');
                    card.querySelectorAll('h2, p').forEach(el => {
                        el.classList.remove('text-white');
                        if (el.tagName === 'H2') el.classList.add('text-gray-800');
                        if (el.tagName === 'P') el.classList.add('text-gray-600');
                    });
                }
            }
        });
    }


<style is:global>
    /* Este estilo es crucial para que el estado de clicado sobreescriba el hover */
    .card-item.active-state {
        background-color: #1a202c !important; /* bg-blue-900 */
        transform: translateY(-8px) !important; /* Mantiene el efecto de elevación del hover */
    }

    .card-item.active-state h2,
    .card-item.active-state p {
        color: #fff !important; /* text-white */
    }
</style>

// ============================================
// ANIMACIONES Y EFECTOS PARA TODO EL SITIO
// ============================================

// Función para inicializar todas las animaciones
export function inicializarAnimaciones() {
  
  // ============================================
  // 1. MANEJO DE IMÁGENES CON EFECTO FADE
  // ============================================
  function manejarImagenesFade() {
    const lazyImages = document.querySelectorAll('.img-load-fade');
    
    lazyImages.forEach(img => {
      // Si la imagen ya está cargada
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        // Esperar a que cargue
        img.addEventListener('load', function() {
          this.classList.add('loaded');
        });
        
        // Fallback por si hay error
        img.addEventListener('error', function() {
          console.warn('No se pudo cargar la imagen:', this.src);
          this.classList.add('loaded'); // Mostrar de todos modos
        });
      }
    });
  }
  
  // ============================================
  // 2. MEJORAR EXPERIENCIA TÁCTIL EN MÓVIL
  // ============================================
  function mejorarExperienciaTactil() {
    if ('ontouchstart' in window) {
      const touchElements = document.querySelectorAll('.touch-feedback, .mobile-active, .wave-effect');
      
      touchElements.forEach(el => {
        el.addEventListener('touchstart', function() {
          this.classList.add('active-touch');
        });
        
        el.addEventListener('touchend', function() {
          setTimeout(() => {
            this.classList.remove('active-touch');
          }, 150);
        });
        
        // Prevenir scroll accidental en elementos táctiles
        el.addEventListener('touchmove', function(e) {
          if (this.classList.contains('active-touch')) {
            e.preventDefault();
          }
        });
      });
    }
  }
  
  // ============================================
  // 3. ANIMACIONES AL HACER SCROLL
  // ============================================
  function inicializarAnimacionesScroll() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Agregar clase de animación cuando el elemento es visible
          if (!entry.target.classList.contains('animated')) {
            entry.target.classList.add('animated');
            
            // Si tiene animación escalonada para hijos
            if (entry.target.classList.contains('stagger-animation')) {
              const children = entry.target.children;
              Array.from(children).forEach((child, index) => {
                child.style.animationDelay = `${index * 150}ms`;
              });
            }
          }
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    // Observar elementos que deben animarse al aparecer
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observer.observe(el);
    });
  }
  
  // ============================================
  // 4. MANEJAR PREFERENCIAS DE REDUCIR MOVIMIENTO
  // ============================================
  function manejarPreferenciasMovimiento() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.documentElement.classList.add('reduce-motion');
    }
    
    // Escuchar cambios en las preferencias
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      if (e.matches) {
        document.documentElement.classList.add('reduce-motion');
      } else {
        document.documentElement.classList.remove('reduce-motion');
      }
    });
  }
  
  // ============================================
  // 5. MEJORAR CARGA DE ELEMENTOS CRÍTICOS
  // ============================================
  function manejarCargaCompleta() {
    // Marcar todas las imágenes como cargadas (fallback)
    document.querySelectorAll('.img-load-fade:not(.loaded)').forEach(img => {
      img.classList.add('loaded');
    });
    
    // Iniciar animaciones después de carga completa
    setTimeout(() => {
      document.body.classList.add('page-loaded');
    }, 100);
  }
  
  // ============================================
  // 6. MANEJAR ESTADO ACTIVO PARA BOTONES
  // ============================================
  function manejarEstadoBotones() {
    document.addEventListener('mousedown', function(e) {
      if (e.target.closest('.touch-feedback, .wave-effect')) {
        e.target.closest('.touch-feedback, .wave-effect').classList.add('active-mouse');
      }
    });
    
    document.addEventListener('mouseup', function() {
      document.querySelectorAll('.active-mouse').forEach(el => {
        el.classList.remove('active-mouse');
      });
    });
  }
  
  // ============================================
  // 7. DETECTAR TIPO DE DISPOSITIVO
  // ============================================
  function detectarDispositivo() {
    function isMobileDevice() {
      return 'ontouchstart' in window || 
             navigator.maxTouchPoints > 0 || 
             navigator.msMaxTouchPoints > 0;
    }
    
    // Agregar clase al body para saber si es móvil
    if (isMobileDevice()) {
      document.body.classList.add('is-mobile');
      document.body.classList.remove('is-desktop');
    } else {
      document.body.classList.add('is-desktop');
      document.body.classList.remove('is-mobile');
    }
  }
  
  // ============================================
  // EJECUTAR TODAS LAS FUNCIONES
  // ============================================
  
  // Ejecutar inmediatamente
  detectarDispositivo();
  manejarImagenesFade();
  mejorarExperienciaTactil();
  manejarPreferenciasMovimiento();
  manejarEstadoBotones();
  inicializarAnimacionesScroll();
  
  // Ejecutar cuando la página esté completamente cargada
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', manejarCargaCompleta);
  } else {
    manejarCargaCompleta();
  }
  
  // También ejecutar en load para imágenes que carguen después
  window.addEventListener('load', manejarCargaCompleta);
}

// ============================================
// FUNCIONES ÚTILES EXPORTABLES
// ============================================

// Función para agregar animación a un elemento específico
export function animarElemento(elemento, animacionClase) {
  if (!elemento.classList.contains(animacionClase)) {
    elemento.classList.add(animacionClase);
  }
}

// Función para remover animación
export function removerAnimacion(elemento, animacionClase) {
  elemento.classList.remove(animacionClase);
}

// Función para detectar si un elemento es visible en viewport
export function esElementoVisible(elemento) {
  const rect = elemento.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Función para animar elementos cuando se hacen visibles
export function observarElementosParaAnimacion(selector, claseAnimacion) {
  const elementos = document.querySelectorAll(selector);
  
  if (!elementos.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add(claseAnimacion);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  elementos.forEach(el => observer.observe(el));
}

// ============================================
// INICIALIZACIÓN AUTOMÁTICA (si se desea)
// ============================================

// Si quieres que se inicialice automáticamente cuando se importa el módulo
// (comenta/descomenta según necesites)

// inicializarAnimaciones();
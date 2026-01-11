// ============================================
// INICIO - UTILIDADES COMPARTIDAS
// ============================================

const Utils = {
  // Detectar si es dispositivo móvil/táctil
  isMobileDevice: () => 
    'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 || 
    navigator.msMaxTouchPoints > 0,

  // Detectar si se prefiere movimiento reducido
  prefersReducedMotion: () => 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,

  // Verificar si elemento está en viewport
  isElementVisible: (element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }
};

// ============================================
// INICIO - MANEJADOR DE IMÁGENES
// ============================================

const ImageHandler = {
  init: () => {
    const lazyImages = document.querySelectorAll('.img-load-fade');
    
    lazyImages.forEach(img => {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        const loadHandler = ImageHandler.onImageLoad.bind(img);
        const errorHandler = ImageHandler.onImageError.bind(img);
        
        img._loadHandler = loadHandler;
        img._errorHandler = errorHandler;
        
        img.addEventListener('load', loadHandler);
        img.addEventListener('error', errorHandler);
      }
    });
  },

  onImageLoad: function() {
    this.classList.add('loaded');
    this.removeEventListener('load', this._loadHandler);
    this.removeEventListener('error', this._errorHandler);
  },

  onImageError: function() {
    console.warn('No se pudo cargar la imagen:', this.src);
    this.classList.add('loaded');
    this.removeEventListener('load', this._loadHandler);
    this.removeEventListener('error', this._errorHandler);
  },

  markAllAsLoaded: () => {
    document.querySelectorAll('.img-load-fade:not(.loaded)').forEach(img => {
      img.classList.add('loaded');
    });
  }
};

// ============================================
// INICIO - MANEJADOR DE FEATURECARDS EN MÓVIL
// ============================================

const FeatureCardHandler = {
  initialized: false,
  activeCard: null,
  clickListeners: new WeakMap(),
  touchListeners: new WeakMap(),
  
  init: () => {
    if (!Utils.isMobileDevice()) return;
    
    FeatureCardHandler.initialized = true;
    
    const featureCards = document.querySelectorAll('.mobile-active:not(.tech-card):not(.carousel-slide):not(.carousel-btn-prev):not(.carousel-btn-next):not(.carousel-dot)');
    
    featureCards.forEach(card => {
      const clickHandler = (e) => FeatureCardHandler.onCardClick.call(card, e);
      const touchStartHandler = (e) => FeatureCardHandler.onTouchStart.call(card, e);
      const touchEndHandler = (e) => FeatureCardHandler.onTouchEnd.call(card, e);
      
      FeatureCardHandler.clickListeners.set(card, clickHandler);
      FeatureCardHandler.touchListeners.set(card, { start: touchStartHandler, end: touchEndHandler });
      
      card.removeEventListener('click', clickHandler);
      card.removeEventListener('touchstart', touchStartHandler);
      card.removeEventListener('touchend', touchEndHandler);
      
      card.addEventListener('click', clickHandler);
      card.addEventListener('touchstart', touchStartHandler);
      card.addEventListener('touchend', touchEndHandler);
    });
    
    FeatureCardHandler.initTechCards();
    
    document.addEventListener('click', FeatureCardHandler.onDocumentClick);
    document.addEventListener('touchstart', FeatureCardHandler.onDocumentTouch);
  },
  
  initTechCards: () => {
    const techCards = document.querySelectorAll('.mobile-active.tech-card');
    
    techCards.forEach(card => {
      const clickHandler = (e) => FeatureCardHandler.onTechCardClick.call(card, e);
      FeatureCardHandler.clickListeners.set(card, clickHandler);
      card.removeEventListener('click', clickHandler);
      card.addEventListener('click', clickHandler);
    });
  },
  
  onTouchStart: function(e) {
    if (this.closest('#carouselTrack') || 
        this.classList.contains('carousel-btn-prev') || 
        this.classList.contains('carousel-btn-next') ||
        this.classList.contains('carousel-dot')) {
      return;
    }
    
    e.stopPropagation();
    this.setAttribute('data-touching', 'true');
  },
  
  onTouchEnd: function(e) {
    if (this.closest('#carouselTrack') || 
        this.classList.contains('carousel-btn-prev') || 
        this.classList.contains('carousel-btn-next') ||
        this.classList.contains('carousel-dot')) {
      return;
    }
    
    this.removeAttribute('data-touching');
    e.stopPropagation();
  },
  
  onCardClick: function(e) {
    if (this.closest('#carouselTrack') || 
        this.classList.contains('carousel-btn-prev') || 
        this.classList.contains('carousel-btn-next') ||
        this.classList.contains('carousel-dot')) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    if (this.classList.contains('active-touch')) {
      this.classList.remove('active-touch');
      FeatureCardHandler.activeCard = null;
    } else {
      this.classList.add('active-touch');
      FeatureCardHandler.activeCard = this;
    }
    
    void this.offsetWidth;
  },
  
  onTechCardClick: function(e) {
    if (this.closest('#carouselTrack')) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const techCards = document.querySelectorAll('.mobile-active.tech-card');
    
    if (this.classList.contains('active-touch')) {
      this.classList.remove('active-touch');
    } else {
      techCards.forEach(card => card.classList.remove('active-touch'));
      this.classList.add('active-touch');
    }
  },
  
  onDocumentClick: (e) => {
    if (!e.target.closest('.mobile-active:not(.tech-card):not(.carousel-slide):not(.carousel-btn-prev):not(.carousel-btn-next):not(.carousel-dot)')) {
      const featureCards = document.querySelectorAll('.mobile-active:not(.tech-card):not(.carousel-slide):not(.carousel-btn-prev):not(.carousel-btn-next):not(.carousel-dot)');
      featureCards.forEach(card => {
        card.classList.remove('active-touch');
      });
      FeatureCardHandler.activeCard = null;
    }
  },
  
  onDocumentTouch: (e) => {
    if (!e.target.closest('.mobile-active:not(.tech-card):not(.carousel-slide):not(.carousel-btn-prev):not(.carousel-btn-next):not(.carousel-dot)')) {
      const featureCards = document.querySelectorAll('.mobile-active:not(.tech-card):not(.carousel-slide):not(.carousel-btn-prev):not(.carousel-btn-next):not(.carousel-dot)');
      featureCards.forEach(card => {
        card.classList.remove('active-touch');
      });
      FeatureCardHandler.activeCard = null;
    }
  },
  
  cleanup: () => {
    if (!FeatureCardHandler.initialized) return;
    
    const allCards = document.querySelectorAll('.mobile-active');
    
    allCards.forEach(card => {
      const clickHandler = FeatureCardHandler.clickListeners.get(card);
      const touchHandlers = FeatureCardHandler.touchListeners.get(card);
      
      if (clickHandler) {
        card.removeEventListener('click', clickHandler);
        FeatureCardHandler.clickListeners.delete(card);
      }
      
      if (touchHandlers) {
        card.removeEventListener('touchstart', touchHandlers.start);
        card.removeEventListener('touchend', touchHandlers.end);
        FeatureCardHandler.touchListeners.delete(card);
      }
      
      card.removeAttribute('data-touching');
    });
    
    document.removeEventListener('click', FeatureCardHandler.onDocumentClick);
    document.removeEventListener('touchstart', FeatureCardHandler.onDocumentTouch);
    
    FeatureCardHandler.initialized = false;
    FeatureCardHandler.activeCard = null;
  }
};

// ============================================
// INICIO - TOUCH HANDLER GENERAL
// ============================================

const TouchHandler = {
  init: () => {
    if (!Utils.isMobileDevice()) return;
    
    const touchElements = document.querySelectorAll('.touch-feedback:not(.mobile-active):not(.carousel-slide):not(.carousel-btn-prev):not(.carousel-btn-next):not(.carousel-dot), .wave-effect:not(.mobile-active):not(.carousel-slide):not(.carousel-btn-prev):not(.carousel-btn-next):not(.carousel-dot)');
    
    touchElements.forEach(el => {
      const startHandler = () => TouchHandler.onTouchStart.call(el);
      const endHandler = () => TouchHandler.onTouchEnd.call(el);
      
      el._touchStartHandler = startHandler;
      el._touchEndHandler = endHandler;
      
      el.removeEventListener('touchstart', startHandler);
      el.removeEventListener('touchend', endHandler);
      
      el.addEventListener('touchstart', startHandler);
      el.addEventListener('touchend', endHandler);
    });
  },

  onTouchStart: function() {
    if (!this.classList.contains('mobile-active') && 
        !this.closest('#carouselTrack') &&
        !this.classList.contains('carousel-btn-prev') &&
        !this.classList.contains('carousel-btn-next') &&
        !this.classList.contains('carousel-dot')) {
      this.classList.add('active-touch');
    }
  },

  onTouchEnd: function() {
    if (!this.classList.contains('mobile-active') && 
        !this.closest('#carouselTrack') &&
        !this.classList.contains('carousel-btn-prev') &&
        !this.classList.contains('carousel-btn-next') &&
        !this.classList.contains('carousel-dot')) {
      setTimeout(() => {
        this.classList.remove('active-touch');
      }, 150);
    }
  }
};

// ============================================
// INICIO - OBSERVADOR DE SCROLL
// ============================================

const ScrollObserver = {
  observer: null,

  init: () => {
    if (ScrollObserver.observer) {
      ScrollObserver.observer.disconnect();
    }

    ScrollObserver.observer = new IntersectionObserver(ScrollObserver.onIntersection, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      ScrollObserver.observer.observe(el);
    });
  },

  onIntersection: (entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || entry.target.classList.contains('animated')) return;
      
      entry.target.classList.add('animated');
      
      if (entry.target.classList.contains('stagger-animation')) {
        const children = entry.target.children;
        Array.from(children).forEach((child, index) => {
          child.style.animationDelay = `${index * 150}ms`;
        });
      }
      
      ScrollObserver.observer.unobserve(entry.target);
    });
  },

  observeElements: (selector, onVisible) => {
    const elements = document.querySelectorAll(selector);
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          onVisible(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    elements.forEach(el => observer.observe(el));
  }
};

// ============================================
// INICIO - MANEJADOR DE PREFERENCIAS DE MOVIMIENTO
// ============================================

const MotionPreferenceHandler = {
  mediaQuery: null,

  init: () => {
    if (MotionPreferenceHandler.mediaQuery) {
      MotionPreferenceHandler.mediaQuery.removeEventListener('change', MotionPreferenceHandler.updateClass);
    }

    MotionPreferenceHandler.mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    MotionPreferenceHandler.updateClass();
    MotionPreferenceHandler.mediaQuery.addEventListener('change', MotionPreferenceHandler.updateClass);
  },

  updateClass: () => {
    if (MotionPreferenceHandler.mediaQuery.matches) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }
};

// ============================================
// INICIO - MANEJADOR DE ESTADO DE BOTONES (DESKTOP)
// ============================================

const ButtonStateHandler = {
  init: () => {
    if (Utils.isMobileDevice()) return;
    
    document.removeEventListener('mousedown', ButtonStateHandler.onMouseDown);
    document.removeEventListener('mouseup', ButtonStateHandler.onMouseUp);
    
    document.addEventListener('mousedown', ButtonStateHandler.onMouseDown);
    document.addEventListener('mouseup', ButtonStateHandler.onMouseUp);
  },

  onMouseDown: (e) => {
    const target = e.target.closest('.touch-feedback, .wave-effect');
    if (target && 
        !target.closest('#carouselTrack') &&
        !target.classList.contains('carousel-btn-prev') &&
        !target.classList.contains('carousel-btn-next') &&
        !target.classList.contains('carousel-dot')) {
      target.classList.add('active-mouse');
    }
  },

  onMouseUp: () => {
    document.querySelectorAll('.active-mouse').forEach(el => {
      el.classList.remove('active-mouse');
    });
  }
};

// ============================================
// INICIO - CARRUSEL INFINITO MEJORADO
// ============================================

const InfiniteCarousel = {
  isPaused: false,
  animationFrameId: null,
  lastTimestamp: null,
  speed: 0.05, // píxeles por frame (ajustable)
  currentPosition: 0,
  groupWidth: 0,
  isInitialized: false,
  
  // INICIO - INICIALIZACIÓN DEL CARRUSEL
  init: () => {
    const carouselTrack = document.getElementById('carouselTrack');
    if (!carouselTrack) {
      console.warn('No se encontró el carrusel');
      return;
    }
    
    // Evitar múltiples inicializaciones
    if (InfiniteCarousel.isInitialized) {
      InfiniteCarousel.cleanup();
    }
    
    // Calcular dimensiones iniciales
    InfiniteCarousel.calculateDimensions();
    
    // Configurar velocidad según tamaño de pantalla
    InfiniteCarousel.adjustSpeed();
    
    // Iniciar animación
    InfiniteCarousel.startAnimation();
    
    // Inicializar controles interactivos
    InfiniteCarousel.initControls();
    
    // Manejar redimensionamiento
    window.addEventListener('resize', InfiniteCarousel.handleResize);
    
    // Marcar como inicializado
    InfiniteCarousel.isInitialized = true;
    
    console.log('Carrusel infinito inicializado');
  },
  
  // INICIO - CALCULAR DIMENSIONES
  calculateDimensions: () => {
    const carouselTrack = document.getElementById('carouselTrack');
    if (!carouselTrack) return;
    
    // Obtener el primer grupo de imágenes
    const firstGroup = carouselTrack.querySelector('.carousel-group');
    if (!firstGroup) {
      console.warn('No se encontraron grupos en el carrusel');
      return;
    }
    
    // Calcular ancho de un grupo completo
    InfiniteCarousel.groupWidth = firstGroup.offsetWidth;
    
    console.log(`Ancho del grupo: ${InfiniteCarousel.groupWidth}px`);
    
    // Asegurar que el track tenga suficiente ancho
    carouselTrack.style.minWidth = `${InfiniteCarousel.groupWidth * 2}px`;
  },
  
  // INICIO - MANEJAR REDIMENSIONAMIENTO
  handleResize: () => {
    InfiniteCarousel.calculateDimensions();
    InfiniteCarousel.adjustSpeed();
  },
  
  // INICIO - AJUSTAR VELOCIDAD
  adjustSpeed: () => {
    const width = window.innerWidth;
    
    // Velocidades diferentes según tamaño de pantalla
    if (width < 640) {
      InfiniteCarousel.speed = 0.04; // Más lento en móvil
    } else if (width < 1024) {
      InfiniteCarousel.speed = 0.045; // Tablet
    } else {
      InfiniteCarousel.speed = 0.05; // Desktop
    }
    
    console.log(`Velocidad ajustada a: ${InfiniteCarousel.speed}px/frame`);
  },
  
  // INICIO - INICIAR ANIMACIÓN
  startAnimation: () => {
    if (InfiniteCarousel.animationFrameId) {
      cancelAnimationFrame(InfiniteCarousel.animationFrameId);
    }
    
    // Reiniciar posición si es necesario
    if (InfiniteCarousel.currentPosition <= -InfiniteCarousel.groupWidth) {
      InfiniteCarousel.currentPosition = 0;
    }
    
    InfiniteCarousel.lastTimestamp = null;
    InfiniteCarousel.animate();
  },
  
  // INICIO - BUCLE DE ANIMACIÓN PRINCIPAL
  animate: (timestamp) => {
    if (!InfiniteCarousel.lastTimestamp) InfiniteCarousel.lastTimestamp = timestamp;
    
    if (!InfiniteCarousel.isPaused) {
      // Calcular tiempo transcurrido
      const elapsed = timestamp - InfiniteCarousel.lastTimestamp;
      
      // Mover el carrusel (independiente del framerate)
      InfiniteCarousel.currentPosition -= InfiniteCarousel.speed * (elapsed / 16.67); // Normalizado a 60fps
      
      // LÓGICA DE REINICIO SUAVE: Cuando un grupo completo ha salido
      if (Math.abs(InfiniteCarousel.currentPosition) >= InfiniteCarousel.groupWidth) {
        InfiniteCarousel.currentPosition += InfiniteCarousel.groupWidth;
      }
      
      // Aplicar transformación
      const carouselTrack = document.getElementById('carouselTrack');
      if (carouselTrack) {
        carouselTrack.style.transform = `translateX(${InfiniteCarousel.currentPosition}px)`;
      }
    }
    
    InfiniteCarousel.lastTimestamp = timestamp;
    
    // Continuar animación
    InfiniteCarousel.animationFrameId = requestAnimationFrame(InfiniteCarousel.animate);
  },
  
  // INICIO - CONTROLES INTERACTIVOS
  initControls: () => {
    const carouselTrack = document.getElementById('carouselTrack');
    if (!carouselTrack) return;
    
    // Remover listeners previos
    carouselTrack.removeEventListener('mouseenter', InfiniteCarousel.pause);
    carouselTrack.removeEventListener('mouseleave', InfiniteCarousel.resume);
    carouselTrack.removeEventListener('touchstart', InfiniteCarousel.pause);
    carouselTrack.removeEventListener('touchend', InfiniteCarousel.delayedResume);
    
    // Pausar al hacer hover (desktop)
    carouselTrack.addEventListener('mouseenter', InfiniteCarousel.pause);
    carouselTrack.addEventListener('mouseleave', InfiniteCarousel.resume);
    
    // Pausar al tocar (móvil)
    carouselTrack.addEventListener('touchstart', InfiniteCarousel.pause);
    carouselTrack.addEventListener('touchend', InfiniteCarousel.delayedResume);
  },
  
  // INICIO - PAUSAR CARRUSEL
  pause: () => {
    InfiniteCarousel.isPaused = true;
  },
  
  // INICIO - REANUDAR CARRUSEL
  resume: () => {
    if (Utils.prefersReducedMotion()) return;
    
    InfiniteCarousel.isPaused = false;
    InfiniteCarousel.lastTimestamp = null; // Resetear para animación suave
  },
  
  // INICIO - REANUDACIÓN RETRASADA (para móvil)
  delayedResume: () => {
    if (Utils.prefersReducedMotion()) return;
    
    // Esperar 1 segundo antes de reanudar
    setTimeout(() => {
      InfiniteCarousel.resume();
    }, 1000);
  },
  
  // INICIO - LIMPIEZA
  cleanup: () => {
    if (InfiniteCarousel.animationFrameId) {
      cancelAnimationFrame(InfiniteCarousel.animationFrameId);
      InfiniteCarousel.animationFrameId = null;
    }
    
    window.removeEventListener('resize', InfiniteCarousel.handleResize);
    
    const carouselTrack = document.getElementById('carouselTrack');
    if (carouselTrack) {
      carouselTrack.removeEventListener('mouseenter', InfiniteCarousel.pause);
      carouselTrack.removeEventListener('mouseleave', InfiniteCarousel.resume);
      carouselTrack.removeEventListener('touchstart', InfiniteCarousel.pause);
      carouselTrack.removeEventListener('touchend', InfiniteCarousel.delayedResume);
    }
    
    InfiniteCarousel.isInitialized = false;
    console.log('Carrusel limpiado');
  }
};

// ============================================
// INICIO - INICIALIZADOR PRINCIPAL
// ============================================

export function inicializarAnimaciones() {
  // Detectar dispositivo
  const deviceClass = Utils.isMobileDevice() ? 'is-mobile' : 'is-desktop';
  document.body.classList.add(deviceClass);
  document.body.classList.remove(deviceClass === 'is-mobile' ? 'is-desktop' : 'is-mobile');

  // Limpiar inicializaciones previas
  FeatureCardHandler.cleanup();
  InfiniteCarousel.cleanup();

  // INICIALIZAR TODOS LOS MANEJADORES
  ImageHandler.init();
  TouchHandler.init();
  MotionPreferenceHandler.init();
  ButtonStateHandler.init();
  ScrollObserver.init();
  
  // INICIALIZAR MANEJADORES ESPECÍFICOS
  FeatureCardHandler.init();
  InfiniteCarousel.init();

  // Manejar carga completa
  const handleCompleteLoad = () => {
    ImageHandler.markAllAsLoaded();
    setTimeout(() => {
      document.body.classList.add('page-loaded');
      // Recalcular carrusel después de que todo esté cargado
      setTimeout(() => InfiniteCarousel.calculateDimensions(), 500);
    }, 100);
  };

  // Configurar listeners de carga
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleCompleteLoad);
  } else {
    handleCompleteLoad();
  }

  window.addEventListener('load', handleCompleteLoad);
}

// ============================================
// INICIO - API PÚBLICA
// ============================================

export const Animaciones = {
  // Manejo de clases de animación
  agregar: (elemento, clase) => {
    if (!elemento.classList.contains(clase)) {
      elemento.classList.add(clase);
    }
  },

  remover: (elemento, clase) => {
    elemento.classList.remove(clase);
  },

  // Observadores
  observar: (selector, claseAnimacion) => {
    ScrollObserver.observeElements(selector, (element) => {
      element.classList.add(claseAnimacion);
    });
  },

  // Utilidades
  esVisible: Utils.isElementVisible,
  
  // Función para limpiar todos los listeners
  limpiarTodo: () => {
    FeatureCardHandler.cleanup();
    InfiniteCarousel.cleanup();
  },

  // Función para actualizar si se agregan elementos dinámicamente
  actualizar: () => {
    ImageHandler.init();
    ScrollObserver.init();
    
    if (Utils.isMobileDevice()) {
      FeatureCardHandler.init();
    }
    
    InfiniteCarousel.init();
  },

  // Control del carrusel
  pausarCarrusel: InfiniteCarousel.pause,
  reanudarCarrusel: InfiniteCarousel.resume,
  ajustarVelocidadCarrusel: InfiniteCarousel.adjustSpeed,
  recalcularCarrusel: InfiniteCarousel.calculateDimensions,

  // Inicialización
  inicializar: inicializarAnimaciones
};

// Inicialización automática opcional
 Animaciones.inicializar();
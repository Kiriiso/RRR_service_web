const swiper = new Swiper('.swiper', {
    slidesPerView: 1,
    spaceBetween: 24,
    loop: true,

    breakpoints: {
        700: {
            slidesPerView: 2
        },
        1024: {
            slidesPerView: 3
        }
    },

    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },

    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
});

const formatearPrecioCLP = (precio) => {
    // Si ya viene formateado como texto (ej: "$15.990"), lo retorna directo
    if (typeof precio === 'string') return precio;

    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    }).format(precio);
};

const productos = {
    mouse1: {
        nombre: "Mouse Prueba 1",
        imagen: "img/mouseprueba.jpg",
        descripcion: "...",
        precio: "...",
        caracteristicas: ["...", "..."]
    },
    // mouse2, audifonos3, ...
};
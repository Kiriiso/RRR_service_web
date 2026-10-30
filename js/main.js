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
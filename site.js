/* Almennt JavaScript fyrir vefsíðuna. */

function startServiceSliders() {
  const sliders = document.querySelectorAll("[data-slider]");

  sliders.forEach((slider) => {
    const images = slider.querySelectorAll("img");

    if (images.length <= 1) {
      return;
    }

    let current = 0;

    setInterval(() => {
      images[current].classList.remove("active");
      current = (current + 1) % images.length;
      images[current].classList.add("active");
    }, 4000);
  });
}

document.addEventListener("DOMContentLoaded", startServiceSliders);

(function () {
    const heroBackground = document.querySelector(".hero-bg-motion");

    if (!heroBackground) return;

    const bands = [
        "band-blue",
        "band-mint",
        "band-orange"
    ];

    if (heroBackground.querySelector(".hero-band")) return;

    bands.forEach(function (bandClass) {
        const band = document.createElement("span");

        band.className = `hero-band ${bandClass}`;
        heroBackground.appendChild(band);
    });
})();

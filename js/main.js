(function () {
    const form = document.querySelector("#bookingForm");
    const mailStatusModal = document.querySelector("#mailStatusModal");
    const modalTitle = document.querySelector("#mailStatusTitle");
    const modalMessage = document.querySelector("#mailStatusMessage");
    const statusFooter = document.querySelector('[data-modal-footer="status"]');
    const confirmFooter = document.querySelector('[data-modal-footer="confirm"]');
    const modalOkButton = document.querySelector("[data-modal-ok]");
    const mailSentButton = document.querySelector('[data-mail-sent="true"]');
    const mailPendingButton = document.querySelector('[data-mail-sent="false"]');
    const modalCloseButtons = document.querySelectorAll("[data-modal-close]");

    const setModalContent = function (title, text, mode) {
        if (modalTitle) {
            modalTitle.textContent = title;
        }

        if (modalMessage) {
            modalMessage.textContent = text;
        }

        if (statusFooter) {
            statusFooter.hidden = mode !== "status";
        }

        if (confirmFooter) {
            confirmFooter.hidden = mode !== "confirm";
        }
    };

    const showModal = function () {
        if (!mailStatusModal) return;

        mailStatusModal.classList.add("show");
        mailStatusModal.removeAttribute("aria-hidden");
        document.body.classList.add("modal-open");
    };

    const hideMailModal = function () {
        if (!mailStatusModal) return;

        mailStatusModal.classList.remove("show");
        mailStatusModal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
    };

    const showStatusModal = function (title, text) {
        setModalContent(title, text, "status");
        showModal();
    };

    const showMailConfirmModal = function () {
        setModalContent("確認預約信件", "請確認是否已在郵件軟體中成功寄出預約信件。", "confirm");
        showModal();
    };

    const markMailAsPending = function () {
        hideMailModal();
        showStatusModal("尚未寄出", "若尚未寄出，請回到郵件軟體確認內容並按下寄出。");
    };

    const dismissCurrentModal = function () {
        if (confirmFooter && !confirmFooter.hidden) {
            markMailAsPending();
            return;
        }

        hideMailModal();
    };

    if (modalOkButton) {
        modalOkButton.addEventListener("click", hideMailModal);
    }

    if (mailSentButton) {
        mailSentButton.addEventListener("click", function () {
            if (form) {
                form.reset();
            }

            hideMailModal();
            showStatusModal("寄出成功", "感謝您，預約信件已確認寄出。");
        });
    }

    if (mailPendingButton) {
        mailPendingButton.addEventListener("click", markMailAsPending);
    }

    modalCloseButtons.forEach(function (button) {
        button.addEventListener("click", dismissCurrentModal);
    });

    if (mailStatusModal) {
        mailStatusModal.addEventListener("click", function (event) {
            if (event.target === mailStatusModal) {
                dismissCurrentModal();
            }
        });
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && mailStatusModal && mailStatusModal.classList.contains("show")) {
            dismissCurrentModal();
        }
    });

    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = form.name.value.trim();
            const phone = form.phone.value.trim();
            const city = form.city.value;
            const time = form.time.value;
            const service = form.service.value;
            const detail = form.message.value.trim();

            if (!name || !phone || !city) {
                showStatusModal("資料未完整", "請先填寫姓名、電話與所在縣市。");
                return;
            }

            const sentAt = new Date().toLocaleString("zh-TW", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            });
            const subject = `線上預約評估 ${sentAt}`;
            const body = [
                "線上預約評估",
                "",
                `傳送時間：${sentAt}`,
                `姓名：${name}`,
                `電話：${phone}`,
                `所在縣市：${city}`,
                `方便通話時間：${time}`,
                `諮詢項目：${service}`,
                "",
                "牙齒情況：",
                detail || "未填寫"
            ].join("\n");
            const mailto = [
                "mailto:etk.taiwan.iris@gmail.com",
                `?subject=${encodeURIComponent(subject)}`,
                `&body=${encodeURIComponent(body)}`
            ].join("");

            showStatusModal("正在開啟郵件軟體", "請在郵件軟體中確認內容後寄出。");
            window.location.href = mailto;

            window.setTimeout(function () {
                showMailConfirmModal();
            }, 900);
        });
    }

    const easeOutCubic = function (value) {
        return 1 - Math.pow(1 - value, 3);
    };

    const animateCounter = function (counter) {
        if (counter.dataset.counted === "true") return;

        counter.dataset.counted = "true";

        const target = Number(counter.dataset.target || 0);
        const suffix = counter.dataset.suffix || "";
        const duration = 1500;
        const startTime = performance.now();

        const update = function (now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            const current = Math.round(target * eased);

            counter.textContent = current.toLocaleString("zh-TW") + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                counter.textContent = target.toLocaleString("zh-TW") + suffix;
            }
        };

        requestAnimationFrame(update);
    };

    const revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            const counters = entry.target.querySelectorAll(".counter");

            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");

                counters.forEach(animateCounter);

                if (entry.target.classList.contains("counter")) {
                    animateCounter(entry.target);
                }
            } else {
                entry.target.classList.remove("is-visible");
            }
        });
    }, {
        threshold: 0.18,
        rootMargin: "0px 0px -60px 0px"
    });

    document.querySelectorAll(".reveal, .counter").forEach(function (element) {
        revealObserver.observe(element);
    });

    const floatCta = document.querySelector("#floatCta");

    if (floatCta) {
        const updateFloatCta = function () {
            if (window.scrollY > 160) {
                floatCta.classList.add("is-compact");
            } else {
                floatCta.classList.remove("is-compact");
            }
        };

        updateFloatCta();
        window.addEventListener("scroll", updateFloatCta, { passive: true });
    }

    const backToTop = document.querySelector("#backToTop");

    if (backToTop) {
        const updateBackToTop = function () {
            const distanceToBottom = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;

            if (distanceToBottom < 420 && window.scrollY > 240) {
                backToTop.classList.add("is-visible");
            } else {
                backToTop.classList.remove("is-visible");
            }
        };

        backToTop.addEventListener("click", function () {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });

        updateBackToTop();
        window.addEventListener("scroll", updateBackToTop, { passive: true });
        window.addEventListener("resize", updateBackToTop);
    }

    const menuToggle = document.querySelector(".menu-toggle");
    const siteMenu = document.querySelector("#siteMenu");

    if (menuToggle && siteMenu) {
        const closeMenu = function () {
            siteMenu.classList.remove("is-open");
            menuToggle.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
            document.body.classList.remove("menu-open");
        };

        menuToggle.addEventListener("click", function () {
            const isOpen = !siteMenu.classList.contains("is-open");

            siteMenu.classList.toggle("is-open", isOpen);
            menuToggle.classList.toggle("is-open", isOpen);
            menuToggle.setAttribute("aria-expanded", String(isOpen));
            document.body.classList.toggle("menu-open", isOpen);
        });

        siteMenu.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", closeMenu);
        });
    }

    const syncLocationArrowPosition = function () {
        const stage = document.querySelector(".location-stage");
        const activeSlide = document.querySelector(".location-swiper .swiper-slide-active");

        if (!stage || !activeSlide) return;

        stage.style.setProperty("--slider-arrow-top", `${activeSlide.offsetHeight / 2}px`);
    };

    const locationSwiper = new Swiper(".location-swiper", {
        slidesPerView: 1,
        spaceBetween: 18,
        loop: true,
        speed: 650,
        autoplay: {
            delay: 3200,
            disableOnInteraction: false
        },
        pagination: {
            el: ".location-pagination",
            clickable: true
        },
        navigation: {
            nextEl: ".location-next",
            prevEl: ".location-prev"
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
                spaceBetween: 22
            },
            980: {
                slidesPerView: 3,
                spaceBetween: 22
            },
            1180: {
                slidesPerView: 4,
                spaceBetween: 22
            }
        },
        on: {
            init: syncLocationArrowPosition,
            resize: syncLocationArrowPosition,
            slideChangeTransitionEnd: syncLocationArrowPosition
        }
    });

    const syncDoctorArrowPosition = function () {
        const stage = document.querySelector(".doctor-stage");
        const activeSlide = document.querySelector(".doctor-swiper .swiper-slide-active");

        if (!stage || !activeSlide) return;

        stage.style.setProperty("--slider-arrow-top", `${activeSlide.offsetHeight / 2}px`);
    };

    const doctorSwiper = new Swiper(".doctor-swiper", {
        slidesPerView: 1,
        spaceBetween: 18,
        loop: true,
        speed: 650,
        autoplay: {
            delay: 3600,
            disableOnInteraction: false
        },
        pagination: {
            el: ".doctor-pagination",
            clickable: true
        },
        navigation: {
            nextEl: ".doctor-next",
            prevEl: ".doctor-prev"
        },
        breakpoints: {
            640: {
                slidesPerView: 2,
                spaceBetween: 22
            },
            980: {
                slidesPerView: 3,
                spaceBetween: 22
            },
            1180: {
                slidesPerView: 4,
                spaceBetween: 22
            }
        },
        on: {
            init: syncDoctorArrowPosition,
            resize: syncDoctorArrowPosition,
            slideChangeTransitionEnd: syncDoctorArrowPosition
        }
    });

    window.addEventListener("load", syncLocationArrowPosition);
    window.addEventListener("load", syncDoctorArrowPosition);
})();

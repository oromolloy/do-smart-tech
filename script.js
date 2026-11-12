/* Do Smart Tech — interações (Vanilla JS) */
(function () {
    "use strict";

    // Número do WhatsApp no formato internacional (país + DDD + número), só dígitos.
    var WHATSAPP_NUMBER = "5521981391680";
    var WHATSAPP_MESSAGE = "Olá! Acessei o site e gostaria de obter mais informações sobre os serviços da empresa.";

    var root = document.documentElement;
    var body = document.body;
    var header = document.querySelector("[data-header]");
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");
    var menuLabel = document.querySelector("[data-menu-label]");
    var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav-link]"));
    var desktop = window.matchMedia("(min-width: 64rem)");

    root.classList.add("js");

    /* Links do WhatsApp ---------------------------------------------------- */
    var whatsappUrl = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(WHATSAPP_MESSAGE);
    document.querySelectorAll("[data-whatsapp-link]").forEach(function (link) {
        link.setAttribute("href", whatsappUrl);
    });

    /* Ano do copyright ----------------------------------------------------- */
    var year = document.querySelector("[data-year]");
    if (year) {
        year.textContent = String(new Date().getFullYear());
    }

    /* Header com sombra ao rolar ------------------------------------------- */
    var ticking = false;
    function updateHeader() {
        header.classList.toggle("header--scrolled", window.scrollY > 8);
        ticking = false;
    }
    window.addEventListener("scroll", function () {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }, { passive: true });
    updateHeader();

    /* Menu mobile ---------------------------------------------------------- */
    function setMenu(open) {
        toggle.setAttribute("aria-expanded", String(open));
        menu.classList.toggle("header__navigation--open", open);
        body.classList.toggle("page--menu-open", open);
        menuLabel.textContent = open ? "Fechar menu" : "Abrir menu";
        if (desktop.matches) {
            menu.removeAttribute("inert");
        } else if (open) {
            menu.removeAttribute("inert");
        } else {
            menu.setAttribute("inert", "");
        }
    }

    toggle.addEventListener("click", function () {
        setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    menu.addEventListener("click", function (event) {
        if (event.target.closest("a") && !desktop.matches) {
            setMenu(false);
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
            setMenu(false);
            toggle.focus();
        }
    });

    desktop.addEventListener("change", function () {
        setMenu(false);
    });
    setMenu(false);

    /* Seção atual no menu -------------------------------------------------- */
    if ("IntersectionObserver" in window) {
        var linkById = {};
        navLinks.forEach(function (link) {
            linkById[link.getAttribute("href").slice(1)] = link;
        });

        var sectionObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }
                navLinks.forEach(function (link) {
                    link.classList.remove("header__link--active");
                    link.removeAttribute("aria-current");
                });
                var active = linkById[entry.target.id];
                if (active) {
                    active.classList.add("header__link--active");
                    active.setAttribute("aria-current", "true");
                }
            });
        }, { rootMargin: "-45% 0px -50% 0px" });

        document.querySelectorAll("main section[id]").forEach(function (section) {
            sectionObserver.observe(section);
        });

        /* Revelação suave ao rolar ----------------------------------------- */
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

        document.querySelectorAll("[data-reveal]").forEach(function (element, index) {
            element.style.transitionDelay = (index % 4) * 60 + "ms";
            revealObserver.observe(element);
        });
    } else {
        document.querySelectorAll("[data-reveal]").forEach(function (element) {
            element.classList.add("is-visible");
        });
    }
})();

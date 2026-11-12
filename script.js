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

    /* Movimento (ms) ------------------------------------------------------- */
    // Padrão do Fred (Suno Vantagens). Só opacity e transform. Não consulta prefers-reduced-motion
    // (decisão do usuário, ver decisoes.md). Único fallback: navegador sem WAAPI mostra e rola na hora.
    var EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
    var RISE_FRAMES = [
        { opacity: 0, transform: "translateY(20px)" },
        { opacity: 1, transform: "none" }
    ];
    var MOTION = { enter: 450, stagger: 70, frames: RISE_FRAMES };
    var CASCADE_MS = 1000;
    var SCROLL_MIN_MS = 700;
    var SCROLL_MAX_MS = 1200;
    var SCROLL_MS_FACTOR = 20;
    var SCROLL_STOP_EVENTS = ["wheel", "touchstart", "keydown", "mousedown"];

    function motion() {
        return typeof window.Element.prototype.animate === "function" ? MOTION : null;
    }

    function easeInOut(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function cascade(nodes, delay) {
        var profile = motion();
        if (!profile) {
            return;
        }
        var maxStagger = CASCADE_MS - profile.enter;
        nodes.forEach(function (node, index) {
            node.animate(profile.frames, {
                duration: profile.enter,
                delay: (delay || 0) + Math.min(index * profile.stagger, maxStagger),
                easing: EASE_OUT,
                fill: "backwards"
            });
        });
    }

    var stopScroll = null;

    // Devolve a duração (0 se instantânea). `done` roda só se a rolagem chegar ao fim.
    function scrollToY(y, done) {
        if (stopScroll) {
            stopScroll();
        }
        var start = window.pageYOffset;
        var max = document.documentElement.scrollHeight - window.innerHeight;
        var target = Math.max(0, Math.min(max, y));
        var distance = target - start;

        if (!motion() || Math.abs(distance) < 2) {
            window.scrollTo(0, target);
            if (done) {
                done();
            }
            return 0;
        }

        var duration = Math.round(Math.min(
            SCROLL_MAX_MS,
            Math.max(SCROLL_MIN_MS, Math.sqrt(Math.abs(distance)) * SCROLL_MS_FACTOR)
        ));
        var frame = 0;
        var began = null;

        function cleanup() {
            window.cancelAnimationFrame(frame);
            SCROLL_STOP_EVENTS.forEach(function (type) {
                window.removeEventListener(type, cleanup);
            });
            stopScroll = null;
        }

        function step(now) {
            if (began === null) {
                began = now;
            }
            var progress = Math.min(1, (now - began) / duration);
            window.scrollTo(0, start + distance * easeInOut(progress));
            if (progress < 1) {
                frame = window.requestAnimationFrame(step);
            } else {
                cleanup();
                if (done) {
                    done();
                }
            }
        }

        SCROLL_STOP_EVENTS.forEach(function (type) {
            window.addEventListener(type, cleanup, { passive: true });
        });
        stopScroll = cleanup;
        frame = window.requestAnimationFrame(step);
        return duration;
    }

    // Desconta o scroll-padding-top do html (header fixo) e o scroll-margin-top do alvo.
    function scrollToElement(element, done) {
        var padding = parseFloat(window.getComputedStyle(root).scrollPaddingTop) || 0;
        var margin = parseFloat(window.getComputedStyle(element).scrollMarginTop) || 0;
        return scrollToY(element.getBoundingClientRect().top + window.pageYOffset - padding - margin, done);
    }

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

        /* Revelação ao rolar ----------------------------------------------- */
        // O que entra junto na tela sobe em cascata (WAAPI, ver MOTION). O data-reveal sai na mesma
        // tarefa em que a animação nasce invisível (fill: backwards), então não há quadro piscando.
        var revealObserver = new IntersectionObserver(function (entries) {
            var batch = [];
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    batch.push(entry.target);
                    revealObserver.unobserve(entry.target);
                }
            });
            cascade(batch);
            batch.forEach(function (element) {
                element.removeAttribute("data-reveal");
            });
        }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });

        document.querySelectorAll("[data-reveal]").forEach(function (element) {
            revealObserver.observe(element);
        });
    } else {
        document.querySelectorAll("[data-reveal]").forEach(function (element) {
            element.removeAttribute("data-reveal");
        });
    }

    /* Rolagem das âncoras -------------------------------------------------- */
    // rAF + easeInOutCubic, duração pela distância, interrompível por gesto. Nunca scroll-behavior
    // smooth: o navegador o desliga pela preferência de movimento do sistema.
    document.addEventListener("click", function (event) {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
        }
        var link = event.target.closest('a[href^="#"]');
        if (!link || link.classList.contains("skip-link")) {
            return;
        }
        var id = link.getAttribute("href").slice(1);
        var target = id ? document.getElementById(id) : null;
        if (!target) {
            return;
        }
        event.preventDefault();
        if (window.location.hash !== "#" + id) {
            window.history.pushState(null, "", "#" + id);
        }
        scrollToElement(target, function () {
            if (!target.hasAttribute("tabindex")) {
                target.setAttribute("tabindex", "-1");
            }
            target.focus({ preventScroll: true });
        });
    });
})();

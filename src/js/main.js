/* ============================================================
   Ismaile Pereira · Estúdio Digital — interações da página
   ============================================================ */
(function () {
  "use strict";

  /* Marca que o JS está ativo — habilita o estado escondido do reveal.
     Feito já no início para evitar qualquer flash de conteúdo. */
  document.documentElement.classList.add("js");

  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");

  /* ---- Ano no rodapé ---- */
  const ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---- Sombra no header ao rolar ---- */
  const onScroll = () => {
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Menu mobile ---- */
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });
  }

  /* ---- Fecha o menu mobile ao clicar num link ---- */
  document.querySelectorAll(".nav__links a").forEach((a) => {
    a.addEventListener("click", () => {
      if (nav) nav.classList.remove("is-open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  });

  /* ---- Rolagem suave com compensação do header fixo ---- */
  const headerH = 72;
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id === "#" || id.length < 2) return;
      const alvo = document.querySelector(id);
      if (!alvo) return;
      e.preventDefault();
      const y = alvo.getBoundingClientRect().top + window.scrollY - headerH + 1;
      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  /* ---- Animação de entrada (scroll reveal) ---- */
  const reveals = document.querySelectorAll(".reveal");
  const revelarTudo = () => reveals.forEach((el) => el.classList.add("is-visible"));

  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("is-visible"), (i % 3) * 70);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));

    /* Rede de segurança: se por qualquer motivo o observer não disparar,
       garante que todo o conteúdo apareça (nunca fica invisível). */
    window.setTimeout(revelarTudo, 2500);
  } else {
    revelarTudo();
  }
})();

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

  /* ---- Formulário de cadastro (salva no Google Sheets) ---- */
  const form = document.getElementById("cadastroForm");
  if (form) {
    const btn = document.getElementById("cadastroBtn");
    const status = document.getElementById("cadastroStatus");

    const setStatus = (msg, ok) => {
      status.textContent = msg;
      status.className = "form-status " + (ok ? "is-ok" : "is-err");
    };

    const fallbackWhatsApp = (d) => {
      const num = (window.CADASTRO_WHATSAPP || "").replace(/\D/g, "");
      const linhas = [
        "Olá Ismaile! Quero deixar meu cadastro:",
        "Nome: " + d.nome,
        "WhatsApp: " + d.whatsapp,
        d.email ? "E-mail: " + d.email : "",
        d.servico ? "Serviço: " + d.servico : "",
        d.mensagem ? "Mensagem: " + d.mensagem : "",
      ].filter(Boolean);
      const url = "https://wa.me/" + num + "?text=" + encodeURIComponent(linhas.join("\n"));
      window.open(url, "_blank", "noopener");
    };

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Honeypot anti-spam: se preenchido, ignora silenciosamente.
      if (form.elements["empresa"] && form.elements["empresa"].value) return;

      const dados = {
        nome: form.elements["nome"].value.trim(),
        whatsapp: form.elements["whatsapp"].value.trim(),
        email: form.elements["email"].value.trim(),
        servico: form.elements["servico"].value,
        mensagem: form.elements["mensagem"].value.trim(),
      };

      if (!dados.nome || !dados.whatsapp) {
        setStatus("Preencha pelo menos nome e WhatsApp.", false);
        return;
      }

      const endpoint = (window.CADASTRO_ENDPOINT || "").trim();

      // Sem endpoint configurado → cai pro WhatsApp (nunca fica sem ação).
      if (!endpoint) {
        fallbackWhatsApp(dados);
        setStatus("Abrindo o WhatsApp para você enviar o cadastro…", true);
        form.reset();
        return;
      }

      btn.classList.add("btn--loading");
      btn.textContent = "Enviando…";
      try {
        const body = new FormData();
        Object.keys(dados).forEach((k) => body.append(k, dados[k]));
        body.append("origem", location.href);
        await fetch(endpoint, { method: "POST", body, mode: "no-cors" });
        setStatus("Cadastro enviado! Em breve eu entro em contato. 🙌", true);
        form.reset();
      } catch (err) {
        // Se a rede falhar, oferece o WhatsApp como saída.
        setStatus("Não consegui enviar agora — vou abrir o WhatsApp para você.", false);
        fallbackWhatsApp(dados);
      } finally {
        btn.classList.remove("btn--loading");
        btn.textContent = "Enviar cadastro";
      }
    });
  }
})();

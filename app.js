/* =========================================================
   RIFA DIA DAS CRIANÇAS — Lógica do site
   ========================================================= */
(function () {
  "use strict";

  const CFG = window.CONFIG_RIFA || {};
  const TOTAL = CFG.totalNumeros || 100;
  const VALOR = CFG.valorNumero || 30;
  const STORAGE_KEY = "rifa_vendidos_v1";

  // ---- Estado ----
  // Vendidos = base do config.js  +  o que o responsável salvou neste navegador.
  let vendidos = carregarVendidos();
  let selecionados = new Set();

  // ---------------------------------------------------------
  // Persistência (localStorage sobrepõe o config.js)
  // ---------------------------------------------------------
  function carregarVendidos() {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) {
      try {
        return new Set(JSON.parse(salvo));
      } catch (e) {
        /* ignora */
      }
    }
    return new Set(CFG.numerosVendidos || []);
  }

  function salvarVendidos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...vendidos]));
  }

  // ---------------------------------------------------------
  // Utilidades
  // ---------------------------------------------------------
  function faixaCor(n) {
    // Cores por faixa, imitando o cartaz
    if (n <= 10) return "faixa-roxo";
    if (n <= 40) return "faixa-azul";
    if (n <= 60) return "faixa-verde";
    if (n <= 80) return "faixa-laranja";
    return "faixa-rosa";
  }

  function formatarReais(v) {
    return "R$ " + v.toFixed(2).replace(".", ",");
  }

  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.hidden = false;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => (el.hidden = true), 300);
    }, 2200);
  }

  // ---------------------------------------------------------
  // Grade pública (comprador)
  // ---------------------------------------------------------
  const grade = document.getElementById("grade");

  function montarGrade() {
    grade.innerHTML = "";
    for (let n = 1; n <= TOTAL; n++) {
      const btn = document.createElement("button");
      btn.className = "num " + faixaCor(n);
      btn.textContent = n;
      btn.dataset.num = n;
      btn.type = "button";
      atualizarBotao(btn, n);
      btn.addEventListener("click", () => toggleSelecao(n, btn));
      grade.appendChild(btn);
    }
    atualizarResumo();
  }

  function atualizarBotao(btn, n) {
    const vendido = vendidos.has(n);
    const sel = selecionados.has(n);
    btn.classList.toggle("vendido", vendido);
    btn.classList.toggle("selecionado", sel && !vendido);
    btn.disabled = vendido;
    if (vendido) {
      btn.setAttribute("aria-label", `Número ${n} já comprado`);
    } else {
      btn.setAttribute("aria-pressed", sel ? "true" : "false");
      btn.setAttribute("aria-label", `Número ${n} ${sel ? "selecionado" : "disponível"}`);
    }
  }

  function toggleSelecao(n, btn) {
    if (vendidos.has(n)) return;
    if (selecionados.has(n)) selecionados.delete(n);
    else selecionados.add(n);
    atualizarBotao(btn, n);
    atualizarResumo();
  }

  function atualizarResumo() {
    const totalVendido = [...vendidos].filter((n) => n >= 1 && n <= TOTAL).length;
    const totalSel = selecionados.size;
    const totalDisp = TOTAL - totalVendido;

    document.getElementById("qtd-disponivel").textContent = totalDisp;
    document.getElementById("qtd-vendido").textContent = totalVendido;
    document.getElementById("qtd-selecionado").textContent = totalSel;

    const ordenados = [...selecionados].sort((a, b) => a - b);
    document.getElementById("lista-selecionados").textContent =
      ordenados.length ? ordenados.join(", ") : "nenhum";
    document.getElementById("valor-total").textContent = formatarReais(totalSel * VALOR);

    const btn = document.getElementById("btn-comprar");
    btn.disabled = totalSel === 0;
  }

  // ---------------------------------------------------------
  // Comprar via WhatsApp
  // ---------------------------------------------------------
  function comprarWhatsApp() {
    const ordenados = [...selecionados].sort((a, b) => a - b);
    if (!ordenados.length) return;

    const total = formatarReais(ordenados.length * VALOR);
    const numeros = ordenados.join(", ");
    const texto =
      `Olá! Quero reservar os números da *Rifa Dia das Crianças* da nossa igreja.\n\n` +
      `🔢 Números: ${numeros}\n` +
      `🎟️ Quantidade: ${ordenados.length}\n` +
      `💰 Total: ${total}\n` +
      `💠 Pagamento via PIX: ${CFG.chavePix}\n\n` +
      `Vou realizar o pagamento e enviar o comprovante. 🙏`;

    const zap = (CFG.whatsapp || "").replace(/\D/g, "");
    if (!zap || zap === "5500000000000") {
      toast("⚠️ O responsável ainda não configurou o WhatsApp.");
      return;
    }
    const url = `https://wa.me/${zap}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  }

  // ---------------------------------------------------------
  // Copiar PIX
  // ---------------------------------------------------------
  function copiarPix() {
    const chave = CFG.chavePix || document.getElementById("pix-chave-txt").textContent;
    navigator.clipboard
      .writeText(chave)
      .then(() => toast("Chave PIX copiada! ✅"))
      .catch(() => toast("Copie manualmente: " + chave));
  }

  // ---------------------------------------------------------
  // Área do responsável (admin)
  // ---------------------------------------------------------
  const overlay = document.getElementById("admin-overlay");
  const login = document.getElementById("admin-login");
  const painel = document.getElementById("admin-painel");
  const gradeAdmin = document.getElementById("grade-admin");
  let vendidosAdmin = null; // cópia de trabalho

  function abrirAdmin() {
    overlay.hidden = false;
    login.hidden = false;
    painel.hidden = true;
    document.getElementById("admin-senha").value = "";
    document.getElementById("admin-erro").hidden = true;
  }

  function fecharAdmin() {
    overlay.hidden = true;
  }

  function entrarAdmin() {
    const senha = document.getElementById("admin-senha").value;
    if (senha === (CFG.senhaAdmin || "rifa2026")) {
      login.hidden = true;
      painel.hidden = false;
      vendidosAdmin = new Set(vendidos);
      montarGradeAdmin();
    } else {
      document.getElementById("admin-erro").hidden = false;
    }
  }

  function montarGradeAdmin() {
    gradeAdmin.innerHTML = "";
    for (let n = 1; n <= TOTAL; n++) {
      const btn = document.createElement("button");
      btn.className = "num " + faixaCor(n);
      btn.textContent = n;
      btn.type = "button";
      btn.classList.toggle("vendido", vendidosAdmin.has(n));
      btn.addEventListener("click", () => {
        if (vendidosAdmin.has(n)) vendidosAdmin.delete(n);
        else vendidosAdmin.add(n);
        btn.classList.toggle("vendido", vendidosAdmin.has(n));
      });
      gradeAdmin.appendChild(btn);
    }
  }

  function salvarAdmin() {
    vendidos = new Set(vendidosAdmin);
    salvarVendidos();
    selecionados.forEach((n) => {
      if (vendidos.has(n)) selecionados.delete(n);
    });
    montarGrade();
    toast("Alterações salvas! ✅");
    fecharAdmin();
  }

  function limparAdmin() {
    vendidosAdmin = new Set();
    montarGradeAdmin();
  }

  // ---------------------------------------------------------
  // Ligações de eventos
  // ---------------------------------------------------------
  document.getElementById("btn-comprar").addEventListener("click", comprarWhatsApp);
  document.getElementById("btn-copiar-pix").addEventListener("click", copiarPix);
  document.getElementById("link-admin").addEventListener("click", abrirAdmin);
  document.getElementById("fechar-admin").addEventListener("click", fecharAdmin);
  document.getElementById("btn-entrar-admin").addEventListener("click", entrarAdmin);
  document.getElementById("admin-senha").addEventListener("keydown", (e) => {
    if (e.key === "Enter") entrarAdmin();
  });
  document.getElementById("btn-salvar-admin").addEventListener("click", salvarAdmin);
  document.getElementById("btn-limpar-admin").addEventListener("click", limparAdmin);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) fecharAdmin();
  });

  // Preenche a chave PIX vinda do config
  document.getElementById("pix-chave-txt").textContent = CFG.chavePix || "rafapedrozo.s@gmail.com";

  // ---------------------------------------------------------
  // Início
  // ---------------------------------------------------------
  montarGrade();
})();

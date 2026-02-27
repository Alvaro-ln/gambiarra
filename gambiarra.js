(function () {
    const TARGET_ID = "interaction-header-participant-name";
    const BUTTON_ID = "btn-novorevan-cliente";

    function extrairIdCliente(texto) {
        // Procura padrão: -[qualquercoisa]-[1231231]
        const regex = /\-\[[^\]]+\]\-\[(\d+)\]/;
        const match = texto.match(regex);
        return match ? match[1] : null;
    }

    function criarBotao() {
        if (document.getElementById(BUTTON_ID)) return;

        const botao = document.createElement("button");
        botao.id = BUTTON_ID;
        botao.innerText = "Abrir Cliente";
        botao.style.marginLeft = "10px";
        botao.style.padding = "4px 8px";
        botao.style.cursor = "pointer";

        botao.disabled = true;

        const h2 = document.getElementById(TARGET_ID);
        if (h2) {
            h2.parentNode.insertBefore(botao, h2.nextSibling);
        }
    }

    function atualizarBotao() {
        const h2 = document.getElementById(TARGET_ID);
        const botao = document.getElementById(BUTTON_ID);

        if (!h2 || !botao) return;

        const texto = h2.innerText.trim();
        const idCliente = extrairIdCliente(texto);

        if (idCliente) {
            botao.disabled = false;
            botao.onclick = function () {
                const url = `https://novorevan.brisanet.net.br/#/venda/cliente/${idCliente}/sobre`;
                window.open(url, "_blank");
            };
            botao.style.opacity = "1";
        } else {
            botao.disabled = true;
            botao.onclick = null;
            botao.style.opacity = "0.5";
        }
    }

    function iniciarObservador() {
        const target = document.body;

        const observer = new MutationObserver(() => {
            criarBotao();
            atualizarBotao();
        });

        observer.observe(target, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    // Inicialização
    criarBotao();
    atualizarBotao();
    iniciarObservador();
})();
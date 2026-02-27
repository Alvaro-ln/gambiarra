(function () {
    const TARGET_ID = "interaction-header-participant-name";
    const BUTTON_ID = "btn-novorevan-cliente";

    function extrairIdCliente(texto) {
        // Procura qualquer coisa no formato -[123123]
        const regex = /\-\s*\[(\d+)\]/;
        const match = texto.match(regex);
        return match ? match[1] : null;
    }

    function criarBotao() {
        if (document.getElementById(BUTTON_ID)) return;

        const botao = document.createElement("button");
        botao.id = BUTTON_ID;
        botao.innerText = "Abrir Cliente";
        botao.style.marginLeft = "10px";
        botao.style.marginTop= "5px";
        botao.style.cursor = "pointer";
        botao.style.opacity = "0.5";
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
            botao.style.opacity = "1";
            botao.onclick = () => {
                const url = `https://novorevan.brisanet.net.br/#/venda/cliente/${idCliente}/sobre`;
                window.open(url, "_blank");
            };
        } else {
            botao.disabled = true;
            botao.style.opacity = "0.5";
            botao.onclick = null;
        }
    }

    const observer = new MutationObserver(() => {
        criarBotao();
        atualizarBotao();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    criarBotao();
    atualizarBotao();
})();
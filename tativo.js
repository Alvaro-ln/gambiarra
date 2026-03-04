(function () {
    const TARGET_ID = "interaction-header-participant-name";
    const BUTTON_ID = "btn-novorevan-cliente";
    // Substitua pela sua URL real após o deploy
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz-hcmhiErTNn3-R_CDi3HzJjCBBiCJ1nChmg-u1oiIPdesEbu0eykke-KtXaJDI1QC/exec"; 

    function extrairIdCliente(texto) {
        const regex = /\-\s*\[(\d+)\]/;
        const match = texto.match(regex);
        return match ? match[1] : null;
    }

    // Função robusta para pegar o nome do operador pela classe estável
    function getNomeOperador() {
        const elements = document.querySelectorAll(".entry-value");
        for (let el of elements) {
            const texto = el.innerText.trim();
            // Filtro para garantir que pegamos um nome (tamanho > 5 e sem ser apenas números)
            if (texto.length > 5 && !/^\d+$/.test(texto)) {
                return texto;
            }
        }
        return "Operador não detectado";
    }

    async function enviarParaPlanilha(nome, id, operador) {
        const formData = new FormData();
        formData.append('nomeCompleto', nome);
        formData.append('idCliente', id);
        formData.append('nomeOperador', operador);

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: formData
            });
            console.log("Dados enviados: ", { nome, id, operador });
        } catch (error) {
            console.error("Erro ao enviar para planilha:", error);
        }
    }

    function criarBotao() {
        if (document.getElementById(BUTTON_ID)) return;
        const botao = document.createElement("button");
        botao.id = BUTTON_ID;
        botao.innerText = "Abrir Cliente e Registrar";
        botao.style.marginLeft = "10px";
        botao.style.cursor = "pointer";
        const h2 = document.getElementById(TARGET_ID);
        if (h2) h2.parentNode.insertBefore(botao, h2.nextSibling);
    }

    function atualizarBotao() {
        const h2 = document.getElementById(TARGET_ID);
        const botao = document.getElementById(BUTTON_ID);
        if (!h2 || !botao) return;

        const texto = h2.innerText.trim().replace(/\s+/g, ' ');
        const idCliente = extrairIdCliente(texto);

        if (idCliente) {
            botao.disabled = false;
            botao.style.opacity = "1";
            botao.onclick = () => {
                const url = `https://novorevan.brisanet.net.br/#/venda/cliente/${idCliente}/sobre`;
                window.open(url, "_blank");
                
                // Captura o operador no momento do clique
                const operador = getNomeOperador();
                enviarParaPlanilha(texto, idCliente, operador);
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

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    criarBotao();
    atualizarBotao();
})();
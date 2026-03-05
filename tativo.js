(function () {
    const TARGET_ID = "interaction-header-participant-name";
    const BUTTON_ID = "btn-novorevan-cliente";
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxE9RfXgYUOD3WFDRYTkm9lgh7ygj8ut-s1AQkfEjrdc39u-4gViOg8qceIq0aUcRs/exec"; 

    if (window.meuScriptObserver) {
        window.meuScriptObserver.disconnect();
        const btnAntigo = document.getElementById(BUTTON_ID);
        if (btnAntigo) btnAntigo.remove();
        console.log("Script anterior removido, reiniciando...");
    }

    function extrairIdCliente(texto) {
        const regex = /\-\s*\[(\d+)\]/;
        const match = texto.match(regex);
        return match ? match[1] : null;
    }

    function isMobileNumberBrazil(texto) {
        return /mobile number,?\s*brazil/i.test(texto);
    }

    function getNomeOperador() {
        const elements = document.querySelectorAll(".entry-value");
        for (let el of elements) {
            const texto = el.innerText.trim();
            if (texto.length > 5 && !/^\d+$/.test(texto)) return texto;
        }
        return "Operador não detectado";
    }

    async function enviarParaPlanilha(nome, id, operador) {
        const formData = new FormData();
        formData.append('nomeCompleto', nome);
        formData.append('idCliente', id);
        formData.append('nomeOperador', operador);

        try {
            await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: formData });
            console.log("Dados enviados!");
        } catch (error) {
            console.error("Erro ao enviar:", error);
        }
    }

    function criarBotao() {
        if (document.getElementById(BUTTON_ID)) return;
        const botao = document.createElement("button");
        botao.id = BUTTON_ID;
        botao.innerText = "Abrir Cliente!";
        botao.style.marginLeft = "10px";
        botao.style.cursor = "pointer";
        const h2 = document.getElementById(TARGET_ID);
        if (h2) h2.parentNode.insertBefore(botao, h2.nextSibling);
    }

    async function atualizarBotao() {
        const h2 = document.getElementById(TARGET_ID);
        const botao = document.getElementById(BUTTON_ID);
        if (!h2 || !botao) return;

        const texto = h2.innerText.trim().replace(/\s+/g, ' ');
        const idCliente = extrairIdCliente(texto);

        // Caso normal: ID extraído do próprio texto
        if (idCliente) {
            botao.disabled = false;
            botao.style.opacity = "1";
            botao.title = "";
            botao.onclick = () => {
                const url = `https://novorevan.brisanet.net.br/#/venda/cliente/${idCliente}/sobre`;
                window.open(url, "_blank");
                enviarParaPlanilha(texto, idCliente, getNomeOperador());
            };
            return;
        }

        // Caso especial: "Mobile Number, Brazil" → usar área de transferência, sem registrar na planilha
        if (isMobileNumberBrazil(texto)) {
            botao.disabled = false;
            botao.style.opacity = "1";
            botao.title = "Clique para usar o ID da área de transferência";
            botao.onclick = async () => {
                let clipboardText = "";
                try {
                    clipboardText = await navigator.clipboard.readText();
                } catch (err) {
                    alert("Não foi possível acessar a área de transferência.\nCopie o ID do cliente e tente novamente.");
                    return;
                }

                const idDaClipboard = clipboardText.trim().replace(/\s+/g, '');

                if (!/^\d+$/.test(idDaClipboard)) {
                    alert(`Conteúdo da área de transferência inválido:\n"${clipboardText}"\n\nCopie apenas o ID numérico do cliente e tente novamente.`);
                    return;
                }

                const url = `https://novorevan.brisanet.net.br/#/venda/cliente/${idDaClipboard}/sobre`;
                window.open(url, "_blank");
            };
            return;
        }

        // Nenhum ID encontrado e não é Mobile Number
        botao.disabled = true;
        botao.style.opacity = "0.5";
        botao.title = "";
        botao.onclick = null;
    }

    const observer = new MutationObserver(() => {
        criarBotao();
        atualizarBotao();
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    
    window.meuScriptObserver = observer; 
    
    criarBotao();
    atualizarBotao();
})();
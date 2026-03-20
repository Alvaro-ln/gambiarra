(function () {
    const TARGET_ID = "interaction-header-participant-name";
    const BUTTON_ID = "btn-novorevan-cliente";
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxsezOsHZ-htfyu09E9tB6JTce2lrj1qxhvoa3NdtRypv13qhKuLntRXiiOtG2lyP3h/exec"; 

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

    function isCPF(texto) {
        const apenasNumeros = texto.replace(/[\.\-]/g, '').trim();
        return /^\d{11}$/.test(apenasNumeros);
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

        // Caso 1: ID extraído do próprio texto
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

        // Caso 2: "Mobile Number, Brazil" → verificar clipboard: CPF vai para pesquisa, ID vai para cliente
        if (isMobileNumberBrazil(texto)) {
            botao.disabled = false;
            botao.style.opacity = "1";
            botao.title = "Clique para usar o ID ou CPF da área de transferência";
            botao.onclick = async () => {
                let clipboardText = "";
                try {
                    clipboardText = await navigator.clipboard.readText();
                } catch (err) {
                    alert("Não foi possível acessar a área de transferência.\nCopie o ID ou CPF do cliente e tente novamente.");
                    return;
                }

                const clipboardLimpo = clipboardText.replace(/[\.\-]/g, '').trim();

                // Se for CPF (11 dígitos) → pesquisa por CPF
                if (isCPF(clipboardText)) {
                    const url = `https://novorevan.brisanet.net.br/#/pesquisa/Cliente/?q=${clipboardLimpo}`;
                    window.open(url, "_blank");
                    return;
                }

                // Se for ID numérico → abre diretamente o cliente
                if (/^\d+$/.test(clipboardLimpo)) {
                    const url = `https://novorevan.brisanet.net.br/#/venda/cliente/${clipboardLimpo}/sobre`;
                    window.open(url, "_blank");
                    return;
                }

                alert(`Conteúdo da área de transferência inválido:\n"${clipboardText}"\n\nCopie um ID numérico ou CPF válido e tente novamente.`);
            };
            return;
        }

        // Caso 3: Qualquer outro caso → verificar se há CPF na área de transferência
        botao.disabled = false;
        botao.style.opacity = "1";
        botao.title = "Clique para buscar pelo CPF da área de transferência";
        botao.onclick = async () => {
            let clipboardText = "";
            try {
                clipboardText = await navigator.clipboard.readText();
            } catch (err) {
                alert("Não foi possível acessar a área de transferência.\nCopie o CPF do cliente e tente novamente.");
                return;
            }

            const cpfLimpo = clipboardText.replace(/[\.\-]/g, '').trim();

            if (!isCPF(clipboardText)) {
                alert(`Conteúdo da área de transferência inválido:\n"${clipboardText}"\n\nCopie um CPF válido (11 dígitos) e tente novamente.`);
                botao.disabled = true;
                botao.style.opacity = "0.5";
                return;
            }

            const url = `https://novorevan.brisanet.net.br/#/pesquisa/Cliente/?q=${cpfLimpo}`;
            window.open(url, "_blank");
        };
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

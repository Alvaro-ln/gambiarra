(function () {
    const TARGET_ID = "interaction-header-participant-name";
    const BUTTON_ID = "btn-novorevan-cliente";
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxE9RfXgYUOD3WFDRYTkm9lgh7ygj8ut-s1AQkfEjrdc39u-4gViOg8qceIq0aUcRs/exec"; 

    // --- BLOCO DE SEGURANÇA PARA BOOKMARKLET ---
    // Se o script já estiver rodando, limpamos o observer e removemos o botão antigo
    if (window.meuScriptObserver) {
        window.meuScriptObserver.disconnect();
        const btnAntigo = document.getElementById(BUTTON_ID);
        if (btnAntigo) btnAntigo.remove();
        console.log("Script anterior removido, reiniciando...");
    }
    // -------------------------------------------

    function extrairIdCliente(texto) {
        const regex = /\-\s*\[(\d+)\]/;
        const match = texto.match(regex);
        return match ? match[1] : null;
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
                enviarParaPlanilha(texto, idCliente, getNomeOperador());
            };
        } else {
            botao.disabled = true;
            botao.style.opacity = "0.5";
            botao.onclick = null;
        }
    }

    // --- INICIALIZAÇÃO ---
    const observer = new MutationObserver(() => {
        criarBotao();
        atualizarBotao();
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    
    // Guardamos o observer na janela global para poder desconectar depois
    window.meuScriptObserver = observer; 
    
    criarBotao();
    atualizarBotao();
})();
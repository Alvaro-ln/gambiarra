(function () {
    const TARGET_ID = "interaction-header-participant-name";
    const BUTTON_ID = "btn-novorevan-cliente";
    // COLE AQUI A URL DO SEU WEB APP:
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz-hcmhiErTNn3-R_CDi3HzJjCBBiCJ1nChmg-u1oiIPdesEbu0eykke-KtXaJDI1QC/exec"; 

    function extrairIdCliente(texto) {
        const regex = /\-\s*\[(\d+)\]/;
        const match = texto.match(regex);
        return match ? match[1] : null;
    }

    async function enviarParaPlanilha(nome, id) {
        // Usamos FormData para simular um formulário clássico
        // Isso evita problemas de preflight (OPTIONS) e CORS do navegador
        const formData = new FormData();
        formData.append('nomeCompleto', nome);
        formData.append('idCliente', id);

        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: formData 
            });
            console.log("Dados enviados!");
        } catch (error) {
            console.error("Erro ao enviar:", error);
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

        const texto = h2.innerText.trim();
        const idCliente = extrairIdCliente(texto);

        if (idCliente) {
            botao.disabled = false;
            botao.style.opacity = "1";
            botao.onclick = () => {
                // 1. Abre a URL
                const url = `https://novorevan.brisanet.net.br/#/venda/cliente/${idCliente}/sobre`;
                window.open(url, "_blank");
                
                // 2. Envia para planilha
                enviarParaPlanilha(texto, idCliente);
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
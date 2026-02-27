(function() {
    const buttonClass = "btn-abrir-cliente-custom";

    function criarBotao(idCliente) {
        const btn = document.createElement("button");
        btn.innerText = "Abrir Cliente";
        btn.className = buttonClass;
        
        // Estilo para não quebrar o layout do H2
        btn.style.marginLeft = "10px";
        btn.style.padding = "2px 8px";
        btn.style.backgroundColor = "#28a745"; // Verde
        btn.style.color = "white";
        btn.style.border = "none";
        btn.style.borderRadius = "4px";
        btn.style.cursor = "pointer";
        btn.style.fontSize = "12px";
        btn.style.verticalAlign = "middle";

        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const url = `https://novorevan.brisanet.net.br/#/venda/cliente/${idCliente}/sobre`;
            window.open(url, '_blank');
        };
        return btn;
    }

    function processarHeader() {
        const header = document.getElementById("interaction-header-participant-name");
        
        if (header) {
            // Verifica se o botão já está lá para evitar loops
            if (header.querySelector(`.${buttonClass}`)) return;

            // Extrai o ID do texto: busca o padrão [números]
            // Ex: Alvaro - -[600mb_20gb_99]-[1231231] -> pega 1231231
            const text = header.innerText;
            const matches = text.match(/\[(\d+)\]/g);
            
            if (matches) {
                // Pega o último match (geralmente o ID do cliente)
                const lastMatch = matches[matches.length - 1];
                const idCliente = lastMatch.replace(/[\[\]]/g, '');

                const btn = criarBotao(idCliente);
                header.appendChild(btn);
            }
        }
    }

    // O MutationObserver observa se algo mudou na tela
    const observer = new MutationObserver(() => {
        processarHeader();
    });

    // Configura para observar mudanças em toda a árvore de elementos
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true // Observa se o texto interno mudou
    });

    // Execução inicial
    processarHeader();
})();
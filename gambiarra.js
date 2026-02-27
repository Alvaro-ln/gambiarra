javascript:(function(){
if(window.__clienteObserverAtivo)return;
window.__clienteObserverAtivo=true;

function aplicarLink(){
  const h=document.querySelector('#interaction-header-participant-name');
  if(!h)return;

  const textoOriginal=h.textContent;

  const regex=/\[(\d+)\]/g;

  const novoHTML=textoOriginal.replace(regex,function(match,id){
    const url='https://novorevan.brisanet.net.br/#/venda/cliente/'+id+'/sobre';
    return '[<a href="'+url+'" target="_blank" style="color:#00bfff;font-weight:bold;">'+id+'</a>]';
  });

  if(h.innerHTML!==novoHTML){
    h.innerHTML=novoHTML;
  }
}

aplicarLink();

const observer=new MutationObserver(function(){
  aplicarLink();
});

observer.observe(document.body,{
  childList:true,
  subtree:true
});
})();
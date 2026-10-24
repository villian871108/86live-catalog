// BGM: "Buy Something!" by CleytonKauffman, CC0, https://opengameart.org/content/shop-theme
(function(){var K='bgm_muted',a=new Audio('/audio/bgm.mp3');a.loop=true;a.volume=0.35;a.preload='none';
var muted=localStorage.getItem(K)==='1',started=false,b=document.createElement('button');b.id='bgm';b.type='button';b.setAttribute('aria-label','背景音乐开关');
function ui(){b.textContent=muted?'🔇':'🎵';b.className=muted?'off':(started&&!a.paused?'on':'')}
function play(){if(muted)return;var p=a.play();if(p&&p.then)p.then(function(){started=true;ui()}).catch(function(){})}
function first(e){if(e&&e.target&&e.target.id==='bgm')return;['click','touchstart','scroll','keydown'].forEach(function(t){removeEventListener(t,first,true)});play()}
['click','touchstart','scroll','keydown'].forEach(function(t){addEventListener(t,first,{capture:true,passive:true})});
b.onclick=function(e){e.stopPropagation();muted=!muted;localStorage.setItem(K,muted?'1':'0');if(muted)a.pause();else play();ui()};
document.addEventListener('visibilitychange',function(){if(document.hidden)a.pause();else if(started)play()});
document.body.appendChild(b);ui()})();

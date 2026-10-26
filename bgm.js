// BGM: hourly rotation of Kevin MacLeod (incompetech.com) tracks, CC BY 4.0 - see /audio/CREDITS.txt
(function(){var K='bgm_muted',T=['bgm.mp3?v=2','monkeys_spinning_monkeys.mp3','carefree.mp3','fluffing_a_duck.mp3','happy_alley.mp3','sneaky_snitch.mp3','wallpaper.mp3'];function hi(){return Math.floor(Date.now()/3600000)%T.length}var cur=hi(),a=new Audio('/audio/'+T[cur]);a.loop=true;setInterval(function(){var n=hi();if(n===cur)return;cur=n;var pl=!a.paused;a.src='/audio/'+T[n];if(pl){var p=a.play();if(p&&p.catch)p.catch(function(){})}},30000);a.volume=0.35;a.preload='none';
var muted=localStorage.getItem(K)==='1',started=false,b=document.createElement('button');b.id='bgm';b.type='button';b.setAttribute('aria-label','背景音乐开关');
function ui(){b.textContent=muted?'🔇':'🎵';b.className=muted?'off':(started&&!a.paused?'on':'')}
function play(){if(muted)return;var p=a.play();if(p&&p.then)p.then(function(){started=true;ui()}).catch(function(){})}
function first(e){if(e&&e.target&&e.target.id==='bgm')return;['click','touchstart','scroll','keydown'].forEach(function(t){removeEventListener(t,first,true)});play()}
['click','touchstart','scroll','keydown'].forEach(function(t){addEventListener(t,first,{capture:true,passive:true})});
b.onclick=function(e){e.stopPropagation();muted=!muted;localStorage.setItem(K,muted?'1':'0');if(muted)a.pause();else play();ui()};
document.addEventListener('visibilitychange',function(){if(document.hidden)a.pause();else if(started)play()});
document.body.appendChild(b);ui()})();

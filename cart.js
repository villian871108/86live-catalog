/* 86livemall cart */
(function(){
var K='86cart',MID='86livemallmsdnbhd';
function ld(){try{var a=JSON.parse(localStorage.getItem(K)||'[]');return Array.isArray(a)?a:[]}catch(e){return []}}
function sv(a){try{localStorage.setItem(K,JSON.stringify(a))}catch(e){}render()}
function pr(s){var m=String(s||'').replace(/,/g,'').match(/(\d+(?:\.\d+)?)/);return m?parseFloat(m[1]):null}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function pu(c){return 'https://86livemall.com/p/'+encodeURIComponent(String(c).trim().split(/\s+/)[0])+'.html'}
function msg(a){return '我要下单\n'+a.map(function(x){return x.c+' x'+x.n+' '+pu(x.c)}).join('\n')}
function url(m){return 'https://m.me/'+MID+'?text='+encodeURIComponent(m)}
var css='#cb{position:fixed;right:16px;bottom:18px;z-index:9000;background:#e8457c;color:#fff;border:0;border-radius:30px;padding:13px 18px;font-size:17px;font-weight:700;box-shadow:0 6px 18px #0004;cursor:pointer}#cb b{background:#fff;color:#e8457c;border-radius:12px;padding:1px 8px;margin-left:6px;font-size:15px}#cb.bump{animation:cbb .4s}@keyframes cbb{50%{transform:scale(1.15)}}'+
'#cm{position:fixed;inset:0;background:#0006;z-index:9500;display:none}#cp{position:absolute;left:0;right:0;bottom:0;max-height:85vh;overflow:auto;background:#fff;color:#222;border-radius:18px 18px 0 0;padding:16px;box-sizing:border-box;max-width:560px;margin:0 auto;font-size:15px}'+
'#cp h3{margin:0 0 10px;font-size:18px;display:flex;justify-content:space-between}#cp h3 button{border:0;background:none;font-size:24px;line-height:1;cursor:pointer}.ci{display:flex;align-items:center;gap:8px;border-bottom:1px solid #eee;padding:9px 0}.ci .nm{flex:1;min-width:0}.ci .nm b{color:#e8457c}.ci .nm div{font-size:13px;color:#555;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
'.ci .qq{display:flex;align-items:center;gap:4px}.ci .qq button{width:30px;height:30px;border:1px solid #ddd;background:#fafafa;border-radius:8px;font-size:17px;cursor:pointer}.ci .qq span{min-width:24px;text-align:center;font-weight:700}.ci .rm{border:0;background:none;color:#999;font-size:13px;cursor:pointer}'+
'#ctot{text-align:right;font-weight:700;margin:12px 0;font-size:17px}#csend{display:block;width:100%;background:#e8457c;color:#fff;border:0;border-radius:14px;padding:16px;font-size:19px;font-weight:700;cursor:pointer}#csend:disabled{opacity:.5}#cclr{display:block;margin:10px auto 0;border:0;background:none;color:#888;text-decoration:underline;cursor:pointer}'+
'#ctoast{position:fixed;left:50%;bottom:84px;transform:translateX(-50%);background:#333;color:#fff;padding:9px 16px;border-radius:20px;z-index:9600;font-size:15px;display:none;white-space:nowrap}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
var cb=document.createElement('button');cb.id='cb';cb.type='button';cb.innerHTML='🛒 购物车<b>0</b>';
var cm=document.createElement('div');cm.id='cm';cm.innerHTML='<div id="cp"><h3>🛒 我的购物车<button type="button" aria-label="关闭" id="cx">×</button></h3><div id="cl"></div><div id="ctot"></div><button type="button" id="csend">发送订单到 Messenger</button><button type="button" id="cclr">清空购物车</button></div>';
var ct=document.createElement('div');ct.id='ctoast';
function mount(){document.body.appendChild(cb);document.body.appendChild(cm);document.body.appendChild(ct);render()}
function render(){var a=ld(),n=0,tot=0,ok=true;a.forEach(function(x){n+=x.n;if(x.p==null)ok=false;else tot+=x.p*x.n});
cb.querySelector('b').textContent=n;cb.style.display=n?'':'none';
var l=document.getElementById('cl');if(!l)return;
l.innerHTML=a.length?a.map(function(x,i){return '<div class="ci"><div class="nm"><b>'+esc(x.c)+'</b> '+(x.p!=null?'RM'+x.p:'')+'<div>'+esc(x.t||'')+'</div></div><div class="qq"><button type="button" data-i="'+i+'" data-d="-1">−</button><span>'+x.n+'</span><button type="button" data-i="'+i+'" data-d="1">+</button></div><button type="button" class="rm" data-r="'+i+'">删除</button></div>'}).join(''):'<p style="text-align:center;color:#888">购物车是空的</p>';
document.getElementById('ctot').textContent=a.length&&ok?'合计 RM'+(Math.round(tot*100)/100)+'（不含邮费）':'';
document.getElementById('csend').disabled=!a.length}
function toast(s){ct.textContent=s;ct.style.display='block';clearTimeout(ct._t);ct._t=setTimeout(function(){ct.style.display='none'},1800)}
window.cartAdd=function(c,btn){var b=btn&&btn.closest('.b'),n=1,t='',p=null;
if(b){var i=b.querySelector('.qty input');if(i)n=typeof qv=='function'?qv(i):(parseInt(i.value,10)||1);var h=b.querySelector('h3,h1');if(h)t=h.textContent.trim();var pe=b.querySelector('.p');if(pe)p=pr(pe.textContent)}
var a=ld(),f=a.filter(function(x){return x.c===c})[0];if(f){f.n=Math.min(999,f.n+n);if(t)f.t=t;if(p!=null)f.p=p}else a.push({c:c,n:n,t:t,p:p});sv(a);
cb.classList.remove('bump');void cb.offsetWidth;cb.classList.add('bump');toast('✅ 已加入购物车：'+c+' x'+n)};
window.cartMsg=function(){return msg(ld())};window.cartUrl=function(){return url(msg(ld()))};
function send(){var a=ld();if(!a.length)return;var m=msg(a),u=url(m);
try{a.forEach(function(x){gtag('event','order_click',{product_code:x.c,quantity:x.n,via:'cart'})})}catch(e){}
var t=document.getElementById('t');if(t){t.textContent='已复制订单，进入 Messenger 后长按输入框 → 粘贴 → 发送';t.style.display='block';setTimeout(function(){t.style.display='none'},20000)}
var done=false;function go(){if(done)return;done=true;try{localStorage.removeItem(K)}catch(e){}render();cm.style.display='none';location.href=u}
try{navigator.clipboard.writeText(m).then(go,go)}catch(e){go()}setTimeout(go,1500)}
cb.onclick=function(){render();cm.style.display='block'};
cm.addEventListener('click',function(e){var g=e.target;if(g===cm||g.id==='cx'){cm.style.display='none';return}
if(g.dataset.d){var a=ld(),x=a[+g.dataset.i];x.n=Math.max(1,Math.min(999,x.n+ +g.dataset.d));sv(a)}
else if(g.dataset.r){var a2=ld();a2.splice(+g.dataset.r,1);sv(a2)}
else if(g.id==='cclr'){if(confirm('确定清空购物车？'))sv([])}else if(g.id==='csend')send()});
addEventListener('storage',function(e){if(e.key===K)render()});
if(document.body)mount();else document.addEventListener('DOMContentLoaded',mount)})();

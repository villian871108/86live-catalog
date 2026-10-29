#!/usr/bin/env python3
"""Regenerate homepage TOP rows (🔥 最多人下单 / 👀 最多人逛) + 已售 badges, commit & deploy.

Usage:
  python3 /workspace/site/update_hot.py                 # rebuild from current data, commit+push
  python3 /workspace/site/update_hot.py --views-csv GA.csv   # replace views from a GA "Pages and screens" CSV export
  python3 /workspace/site/update_hot.py --views-json v.json  # replace views from {code:views}
  python3 /workspace/site/update_hot.py --sold /path/ulive_sold.csv  # ulive keyword-level sold CSV (code,sold)
  --no-push   build + commit only     --dry-run  build only, no git

Data:
  sold  : ulive per-keyword sold CSV (default /workspace/ulive_sold.csv; export from ulive seller portal
          via u live bot / browser). Keywords like X60蓝, M18M18A, X54A白 are summed to base code (X60, M18, X54).
  views : /workspace/site/data/views.json {code: views} (GA page path /p/<CODE>.html).
  data/sold_exclude.json: codes whose ulive sold numbers belong to an older product with the same code.
"""
import argparse, csv, datetime as dt, json, os, re, subprocess, sys
from pathlib import Path

SITE = Path(__file__).resolve().parent
IDX = SITE / 'index.html'
DATA = SITE / 'data'
N_ROW = 8

def site_codes(h):
    L = h[h.find('<div id="list">'):]
    return list(dict.fromkeys(re.findall(r'class="cd">([^<]+)<', L)))

def natkey(c):
    m = re.match(r'([A-Z]+)(\d+)', c)
    return (m.group(1), int(m.group(2))) if m else (c, 0)

def load_sold(path, codes):
    raw = {}
    with open(path, encoding='utf-8-sig') as f:
        for r in csv.DictReader(f):
            k = (r.get('code') or '').strip().upper()
            m = re.match(r'([A-Z]+\d+)', k)
            if not m: continue
            try: n = int(float(r.get('sold') or 0))
            except ValueError: continue
            raw[m.group(1)] = raw.get(m.group(1), 0) + n
    ex = set()
    exf = DATA / 'sold_exclude.json'
    if exf.exists():
        e = json.load(open(exf, encoding='utf-8'))
        mt = dt.datetime.fromtimestamp(os.path.getmtime(path))
        if mt < dt.datetime.fromisoformat(e['until']):
            ex = set(e['codes'])
    cs = set(codes)
    return {k: v for k, v in raw.items() if k in cs and k not in ex and v > 0}, ex

def views_from_csv(path):
    v = {}
    for row in csv.reader(open(path, encoding='utf-8-sig')):
        for i, cell in enumerate(row):
            m = re.search(r'/p/([A-Za-z0-9]+)\.html', cell)
            if m:
                for x in row[i+1:]:
                    x = x.replace(',', '').strip()
                    if re.fullmatch(r'\d+(\.\d+)?', x):
                        c = m.group(1).upper(); v[c] = v.get(c, 0) + int(float(x)); break
                break
    return v

def top(d, n=N_ROW):
    return [k for k, _ in sorted(d.items(), key=lambda kv: (-kv[1], natkey(kv[0])))[:n]]

CSS = ('<style>.tops{margin-top:8px}.tops .hd{display:flex;align-items:baseline;gap:6px;margin:6px 0}'
       '.tops h2{font-size:16px;margin:0;color:#6b46b0}.tops small{font-size:11px;color:#e8457c}'
       '.tops .hs{display:grid;grid-auto-flow:column;grid-auto-columns:calc(50% - 4px);gap:8px;overflow-x:auto;'
       'scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;padding-bottom:6px;scrollbar-width:none}'
       '.tops .hs::-webkit-scrollbar{display:none}.tops .hs>.pc{scroll-snap-align:start;min-width:0}'
       '.tops .rk{position:absolute;top:6px;right:6px;background:linear-gradient(90deg,#8e44ff,#e8457c);color:#fff;'
       'font-size:11px;font-weight:700;padding:2px 7px;border-radius:8px;z-index:2}'
       '@media(min-width:700px){.tops .hs{grid-auto-columns:calc(25% - 6px)}}</style>')

def html_block(upd):
    return ('<!--HOT2-->' + CSS +
            '<section class="tops" id="hot"><div class="hd"><h2>🔥 最多人下单</h2><small>更新 ' + upd + '</small></div>'
            '<div class="hs" id="hotg"></div></section>'
            '<section class="tops" id="topv"><div class="hd"><h2>👀 最多人逛</h2></div>'
            '<div class="hs" id="viewg"></div></section><!--/HOT2-->')

def js_block(sold, hot, view):
    d = json.dumps({'S': sold, 'H': hot, 'V': view}, ensure_ascii=False, separators=(',', ':'))
    return ('<!--HOTJS--><script>(function(){var D=' + d + ',S=D.S,m={};'
            'document.querySelectorAll("#list .pc").forEach(function(c){var e=c.querySelector(".cd");if(!e)return;'
            'var k=e.textContent.trim();if(!m[k])m[k]=c;if(S[k]){var b=document.createElement("span");b.className="sold";'
            'b.textContent="已售 "+S[k];c.appendChild(b)}});'
            'function fill(id,ks,sec){var g=document.getElementById(id),n=0;ks.forEach(function(k){if(!m[k])return;'
            'var c=m[k].cloneNode(true);n++;var r=document.createElement("span");r.className="rk";r.textContent="TOP "+n;c.appendChild(r);'
            'c.querySelectorAll("img").forEach(function(i){i.removeAttribute("loading");i.loading="eager";var u=i.getAttribute("src");i.src="";i.src=u});'
            'g.appendChild(c)});if(!n)document.getElementById(sec).style.display="none"}'
            'fill("hotg",D.H,"hot");fill("viewg",D.V,"topv")})();</script><!--/HOTJS-->')

def patch(h, block, js):
    # remove old random 热卖 section (first run) or previous HOT2 block
    h = re.sub(r'<section class="hot" id="hot">.*?</section>', '', h, count=1, flags=re.S)
    h = re.sub(r'<!--HOT2-->.*?<!--/HOT2-->', '', h, count=1, flags=re.S)
    i = h.index('<div class="wrap">') + len('<div class="wrap">')
    h = h[:i] + block + h[i:]
    if '<!--HOTJS-->' in h:
        h = re.sub(r'<!--HOTJS-->.*?<!--/HOTJS-->', lambda _: js, h, count=1, flags=re.S)
    else:
        h, n = re.subn(r'<script>\(function\(\)\{var S=\{.*?\}\)\(\);</script>', lambda _: js, h, count=1, flags=re.S)
        if n != 1: sys.exit('old sold script not found')
    return h

def git(*a):
    return subprocess.run(['git', '-C', str(SITE), *a], check=True, capture_output=True, text=True).stdout

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--sold', default='/workspace/ulive_sold.csv')
    ap.add_argument('--views-csv'); ap.add_argument('--views-json')
    ap.add_argument('--no-push', action='store_true'); ap.add_argument('--dry-run', action='store_true')
    a = ap.parse_args()
    DATA.mkdir(exist_ok=True)
    if not a.dry_run:
        subprocess.run(['git', '-C', str(SITE), 'pull', '-q', '--rebase', 'origin', 'main'], check=False)
    h = IDX.read_text(encoding='utf-8')
    codes = site_codes(h)
    sold, ex = load_sold(a.sold, codes)
    vf = DATA / 'views.json'
    if a.views_csv: views = views_from_csv(a.views_csv)
    elif a.views_json: views = {k.upper(): int(v) for k, v in json.load(open(a.views_json)).items()}
    else: views = json.load(open(vf)) if vf.exists() else {}
    views = {k: v for k, v in views.items() if k in set(codes) and v > 0}
    hot, view = top(sold), top(views)
    now = dt.datetime.now()
    sold_mt = dt.datetime.fromtimestamp(os.path.getmtime(a.sold))
    json.dump(dict(sorted(sold.items(), key=lambda kv: -kv[1])), open(DATA / 'sold.json', 'w'), ensure_ascii=False, indent=0)
    json.dump(dict(sorted(views.items(), key=lambda kv: -kv[1])), open(vf, 'w'), ensure_ascii=False, indent=0)
    json.dump({'built': now.isoformat(timespec='minutes'), 'sold_source': a.sold,
               'sold_source_mtime': sold_mt.isoformat(timespec='minutes'), 'excluded': sorted(ex, key=natkey),
               'hot': [[k, sold[k]] for k in hot], 'view': [[k, views[k]] for k in view]},
              open(DATA / 'hot_meta.json', 'w'), ensure_ascii=False, indent=1)
    upd = sold_mt.strftime('%d/%m %H:%M')
    new = patch(h, html_block(upd), js_block(sold, hot, view))
    print('🔥 最多人下单:', ', '.join(f'{k}({sold[k]})' for k in hot))
    print('👀 最多人逛 :', ', '.join(f'{k}({views[k]})' for k in view))
    print(f'sold source {a.sold} (mtime {sold_mt:%Y-%m-%d %H:%M}); badges on {len(sold)} products; excluded {len(ex)}')
    if a.dry_run: return
    IDX.write_text(new, encoding='utf-8')
    git('add', 'index.html', 'data/sold.json', 'data/views.json', 'data/hot_meta.json', 'data/sold_exclude.json', 'update_hot.py')
    if not git('status', '--porcelain', '--untracked-files=no').strip():
        print('no changes'); return
    git('commit', '-q', '-m', f'update_hot: 最多人下单/最多人逛 {now:%Y-%m-%d %H:%M}')
    if not a.no_push:
        git('push', '-q', 'origin', 'HEAD:main'); print('pushed to origin/main (GitHub Pages → 86livemall.com)')

if __name__ == '__main__':
    main()

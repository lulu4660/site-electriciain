# -*- coding: utf-8 -*-
"""Version 2 du site, « Le fil » : direction graphique issue du logo (le trait bleu continu qui
dessine la maison et finit en prise). Mêmes textes et services que la version 1 (build.py).

    python _source/build.py && python _source/build_v2.py
Les pages sont écrites dans electriciain/v2/.
"""
import hashlib, json, re
from pathlib import Path

import build as v1
from build import NOM, ADRESSE, VILLE, HORAIRES, CONTACTS, FACEBOOK, INSTAGRAM, GMAPS, SERVICES, STEPS, FAQ, icon, scene

SITE = v1.ROOT
OUT = SITE / "v2"
ASSETS = OUT / "assets"

# Les scènes animées des services viennent de la feuille de style de la version 1.
_css1 = (SITE / "assets" / "style.css").read_text(encoding="utf-8")
SCENE_CSS = _css1[_css1.index("/* ---------- Scènes animées"):_css1.index("@media (max-width: 860px) {\n  .page-hero")]


def ver():
    return hashlib.sha1(b"".join((ASSETS / f).read_bytes() for f in ("v2.css", "v2.js", "plan3d.js"))).hexdigest()[:8]


THREE_JS = """<script type="importmap">{"imports": {"three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js", "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>
<script type="module" src="assets/plan3d.js?v=__VER__"></script>
"""


def nb(x):
    return x.replace(" ?", " ?").replace(" :", " :").replace(" !", " !")


def head(title, desc, extra=""):
    return f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#1f56c8">
<link rel="icon" href="../img/logo.webp">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,400..900;1,62..125,400..900&display=swap">
<link rel="stylesheet" href="assets/v2.css?v={VER}">
<script>document.documentElement.classList.add('js')</script>
<script src="assets/v2.js?v={VER}" defer></script>
{extra.replace("__VER__", VER)}</head>
<body>
<a class="skip" href="#main">Aller au contenu</a>
"""


def top(on_home=True):
    base = "" if on_home else "./"
    n, d, t = CONTACTS[0]
    return f"""<header class="top">
  <a class="top__logo" href="./"><img src="../img/logo.webp" alt="{NOM}, accueil" width="600" height="350"></a>
  <nav class="top__nav" aria-label="Navigation principale">
    <a href="{base}#services">Services</a><a href="{base}#methode">Méthode</a><a href="{base}#zone">Secteur</a><a href="contact.html">Contact</a>
  </nav>
  <a class="top__call" href="tel:{t}">{icon("phone")}<span>{d}</span></a>
</header>
<main id="main">
"""


def bolt(cls="bolt"):
    return f'<svg class="{cls}" viewBox="0 0 64 128" aria-hidden="true"><path d="M40 0 L4 70 H30 L18 128 L60 50 H34 Z"/></svg>'


def rows(exclude=None):
    out = []
    for s in SERVICES:
        if s["slug"] == exclude:
            continue
        out.append(f"""<li><a class="row" href="{s["slug"]}.html">
  <span class="row__name">{s["menu"]}</span>
  <span class="row__txt">{s["short"]}</span>
  <span class="row__ico">{icon(s["icon"])}</span>
</a></li>""")
    return f'<ul class="rows">{"".join(out)}</ul>'


def socket():
    # la prise murale où vient se brancher le câble qui descend le long de la page
    return """<svg class="socket" viewBox="0 0 120 120" aria-hidden="true">
  <rect x="6" y="6" width="108" height="108" rx="22" class="socket__plate"/>
  <circle cx="60" cy="60" r="34" class="socket__well"/>
  <circle cx="46" cy="60" r="5.5" class="socket__hole"/><circle cx="74" cy="60" r="5.5" class="socket__hole"/>
</svg>"""


def foot():
    calls = "".join(f"""<a class="call" href="tel:{t}"><span class="call__name">{n}</span><span class="call__num">{d}</span></a>""" for n, d, t in CONTACTS)
    return f"""</main>
<footer class="end" id="contact">
  <div class="wrap end__grid">
    <div>
      <h2 class="end__title">{nb("Un projet, une panne ?")}</h2>
      <p class="end__lead">Appelez directement l'un des deux associés. {HORAIRES.replace("Du l", "Du l")}.</p>
      <div class="calls">{calls}</div>
      <p class="end__alt"><a href="contact.html">Écrire un message</a> pour recevoir un devis gratuit.</p>
    </div>
    <div class="end__plug" data-wire-end>{socket()}</div>
  </div>
  <div class="wrap end__bar">
    <p>{NOM}, {ADRESSE}, {VILLE}</p>
    <p><a href="{FACEBOOK}" rel="noopener">Facebook</a><a href="{INSTAGRAM}" rel="noopener">Instagram</a><a href="../credits.html">Crédits photos</a><a href="../index.html">Version classique</a></p>
  </div>
</footer>
<svg class="wire" aria-hidden="true"><path class="wire__halo"/><path class="wire__line"/></svg>
</body>
</html>
"""


# ------------------------------------------------------------------ accueil

def plan3d():
    picks = "".join(f'<li><button type="button" class="pick" data-pick="{s["slug"]}">{icon(s["icon"])}<span>{s["menu"]}</span></button></li>' for s in SERVICES)
    tpls = "".join(f"""<template id="pl-{s["slug"]}" data-title="{s["menu"]}">
  <h3 class="h3">{s["title"]}</h3>
  <p>{s["short"]}</p>
  <ul class="mini">{"".join(f"<li>{i}</li>" for i in s["items"][:4])}</ul>
  <div class="plan__acts"><a class="btn btn--ink" href="{s["slug"]}.html">Voir le service</a><button type="button" class="back" data-back>Tous les métiers</button></div>
</template>""" for s in SERVICES)
    rot = lambda d: f'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="{d}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    return f"""
<section class="plan" id="maison">
  <div class="wrap">
    <div class="sec__head"><h2 class="h2">Visitez la maison</h2><p>Faites-la tourner et touchez un point jaune : chacun ouvre l'un de nos métiers, et l'équipement se met en marche.</p></div>
    <div class="plan__grid">
      <div class="plan__stage" data-plan>
        <canvas class="plan__canvas" role="img" aria-label="Maison en 3D ouverte, avec ses équipements électriques : tableau, éclairage connecté, alarme, radiateur, VMC, porte de garage motorisée, borne de recharge et bâtiment de bureaux."></canvas>
        <div class="plan__pins"></div>
        <div class="plan__tools">
          <button type="button" data-rot="-1" aria-label="Tourner vers la gauche">{rot("M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4")}</button>
          <button type="button" data-reset>Vue d'ensemble</button>
          <button type="button" data-rot="1" aria-label="Tourner vers la droite">{rot("M20 12a8 8 0 1 1-2.4-5.7M20 4v4h-4")}</button>
        </div>
        <p class="plan__hint">Glissez pour tourner, molette pour zoomer</p>
      </div>
      <aside class="plan__panel" aria-live="polite">
        <div class="plan__intro">
          <h3 class="h3">Huit métiers sous un même toit</h3>
          <ul class="picks">{picks}</ul>
        </div>
        <div class="plan__card" hidden></div>
      </aside>
    </div>
  </div>
  {tpls}
</section>
"""

def page_index():
    steps = "".join(f"""<li class="step"><span class="step__node" data-wire-node>{i}</span><h3>{t}</h3><p>{d}</p></li>"""
                    for i, (t, d) in enumerate(STEPS, 1))
    faq = "".join(f"<details><summary>{nb(q)}</summary><p>{nb(a)}</p></details>" for q, a in FAQ)
    towns = ["Oyonnax", "Bellignat", "Arbent", "Nantua", "Montréal-la-Cluse", "Izernore", "Saint-Martin-du-Frêne",
             "Port", "Bourg-en-Bresse", "et tout l'Ain"]
    t1 = CONTACTS[0]
    return head(f"{NOM} | Électriciens à Martignat, dans l'Ain",
                "Électriciens à Martignat (01) : installation, rénovation, dépannage, alarme, domotique, chauffage, VMC, portails, bornes de recharge.", THREE_JS) + top() + f"""
<section class="hero">
  <div class="hero__stage">
    <svg class="hero__house" preserveAspectRatio="none" aria-hidden="true"><path class="hero__line"/><g class="hero__plug"><rect x="-2" y="-11" width="22" height="22" rx="4"/><path d="M20 -5 h10 M20 5 h10"/></g></svg>
    {bolt("bolt hero__bolt")}
    <h1 class="hero__title"><span>Électriciens</span> <span>dans l'Ain</span></h1>
    <div class="hero__foot">
      <p class="hero__lead">Deux associés, un seul interlocuteur. Installation, rénovation et dépannage, de Martignat à Bourg-en-Bresse.</p>
      <a class="btn btn--volt" href="tel:{t1[2]}">{icon("phone")} Appeler le {t1[1]}</a>
    </div>
  </div>
</section>
""" + plan3d() + f"""
<section class="sec" id="services">
  <div class="wrap">
    <div class="sec__head"><h2 class="h2">Ce qu'on installe</h2><p>Huit métiers, une seule équipe. Particuliers, commerces, ateliers et sites industriels.</p></div>
    {rows()}
  </div>
</section>

<section class="volt">
  <div class="wrap volt__grid">
    <h2 class="volt__title">Garanti dix ans</h2>
    <div class="volt__txt">
      <p>Tous nos travaux sont couverts par la garantie décennale. Le devis est gratuit, détaillé, et ne vous engage à rien.</p>
      <img class="volt__stamp" src="../img/decennale.webp" alt="Garantie décennale" width="512" height="346" loading="lazy">
    </div>
  </div>
</section>

<section class="sec" id="methode">
  <div class="wrap">
    <div class="sec__head"><h2 class="h2">Comment ça se passe</h2><p>Du premier appel à la mise sous tension.</p></div>
    <ol class="steps">{steps}</ol>
  </div>
</section>

<section class="night" id="zone">
  <div class="wrap">
    <div class="sec__head"><h2 class="h2">Où on intervient</h2><p>Basés à Martignat, dans le Haut-Bugey, nous nous déplaçons dans tout le département.</p></div>
    <ul class="towns"><li class="towns__home">{icon("pin")}Martignat</li>{"".join(f"<li>{t}</li>" for t in towns)}</ul>
  </div>
</section>

<section class="sec" id="faq">
  <div class="wrap faq">
    <div class="sec__head"><h2 class="h2">Questions fréquentes</h2><p>{nb("Une autre question ? Appelez-nous, c'est le plus rapide.")}</p></div>
    <div class="faq__list">{faq}</div>
  </div>
</section>
""" + foot()


# ------------------------------------------------------------------ pages services
def page_service(s):
    items = "".join(f"<li>{i}</li>" for i in s["items"])
    intro = "".join(f"<p>{p}</p>" for p in s["intro"])
    extra = "".join(f"<p>{p}</p>" for p in s["extra"])
    t1 = CONTACTS[0]
    img = f'<figure class="photo"><img src="../{s["img"]}" alt="{s["title"]}" width="1500" height="1000" loading="lazy"></figure>' if s["img"] else ""
    return head(f"{s['title']} | {NOM}", f"{s['short']} {NOM}, électriciens à Martignat (01).") + top(False) + f"""
<section class="shero">
  <div class="wrap shero__grid">
    <div>
      <p class="crumb"><a href="./#services">Services</a></p>
      <h1 class="shero__title">{s["title"]}</h1>
      <p class="shero__lead">{s["lead"]}</p>
      <div class="shero__ctas">
        <a class="btn btn--volt" href="tel:{t1[2]}">{icon("phone")} {t1[1]}</a>
        <a class="btn btn--line" href="contact.html">Demander un devis</a>
      </div>
    </div>
    {scene(s["slug"])}
  </div>
</section>

<section class="sec">
  <div class="wrap duo">
    <div><h2 class="h3">{s["intro_h"]}</h2>{intro}</div>
    {img}
  </div>
</section>

<section class="sec sec--tight">
  <div class="wrap">
    <h2 class="h2">{s["list_h"]}</h2>
    <ul class="ticks">{items}</ul>
  </div>
</section>

<section class="volt volt--small">
  <div class="wrap volt__grid">
    <h2 class="h3">{s["extra_h"]}</h2>
    <div class="volt__txt">{extra}<p>Intervention à {s["city"]} et dans tout l'Ain.</p></div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="sec__head"><h2 class="h2">Nos autres services</h2></div>
    {rows(exclude=s["slug"])}
  </div>
</section>
""" + foot()


# ------------------------------------------------------------------ contact
def page_contact():
    opts = "".join(f"<option>{s['menu']}</option>" for s in SERVICES)
    return head(f"Contact | {NOM}", f"Contactez {NOM}, électriciens à Martignat (01). Devis gratuit.") + top(False) + f"""
<section class="shero shero--short">
  <div class="wrap">
    <h1 class="shero__title">Contact</h1>
    <p class="shero__lead">Le plus rapide reste le téléphone. Pour un devis, vous pouvez aussi nous écrire : on vous rappelle.</p>
  </div>
</section>

<section class="sec">
  <div class="wrap duo duo--top">
    <form class="form" data-email="{v1.EMAIL if not v1.EMAIL.endswith('example.com') else ''}" novalidate>
      <h2 class="h3">Demander un devis</h2>
      <label>Votre nom<input name="nom" autocomplete="name" required></label>
      <label>Téléphone<input name="tel" type="tel" autocomplete="tel" required></label>
      <label>Commune<input name="commune" autocomplete="address-level2"></label>
      <label>Service<select name="service"><option value="">Choisir</option>{opts}<option>Autre</option></select></label>
      <label>Votre projet<textarea name="message" rows="5"></textarea></label>
      <button class="btn btn--ink" type="submit">Envoyer la demande</button>
      <p class="form__note" hidden>{nb("L'envoi en ligne n'est pas encore activé : appelez-nous au")} {CONTACTS[0][1]}.</p>
    </form>
    <div class="info">
      <h2 class="h3">Nous trouver</h2>
      <p>{ADRESSE}<br>{VILLE}</p>
      <p>{HORAIRES}</p>
      <p><a class="link" href="{GMAPS}" rel="noopener">Ouvrir dans Google Maps</a></p>
    </div>
  </div>
</section>
""" + foot()


def main():
    global VER
    ASSETS.mkdir(parents=True, exist_ok=True)
    src = Path(__file__).resolve().parent
    (ASSETS / "v2.css").write_text((src / "v2.css").read_text(encoding="utf-8") + "\n" + SCENE_CSS, encoding="utf-8")
    (ASSETS / "v2.js").write_text((src / "v2.js").read_text(encoding="utf-8"), encoding="utf-8")
    (ASSETS / "plan3d.js").write_text((src / "plan3d.js").read_text(encoding="utf-8"), encoding="utf-8")
    VER = ver()
    pages = {"index.html": page_index(), "contact.html": page_contact()}
    for s in SERVICES:
        pages[s["slug"] + ".html"] = page_service(s)

    def stamp(m):
        f = SITE / m.group(2)
        v = hashlib.sha1(f.read_bytes()).hexdigest()[:8] if f.exists() else ""
        return f'{m.group(1)}="../{m.group(2)}?v={v}"' if v else m.group(0)
    for name, html in pages.items():
        html = re.sub(r'(src|href)="\.\./(img/[^"?]+)"', stamp, html)
        (OUT / name).write_text(html, encoding="utf-8")
        print("écrit v2/" + name)


if __name__ == "__main__":
    main()

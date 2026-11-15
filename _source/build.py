# -*- coding: utf-8 -*-
"""Génère les pages HTML du site Les Électrici'Ain.

Modifier les textes ici puis lancer :  python _source/build.py   (depuis la racine du dépôt)
Les pages .html sont écrites à la racine du dossier electriciain/.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "electriciain"

import hashlib
# Version des fichiers CSS/JS dans leur adresse : un navigateur ne garde jamais un ancien style.
VER = hashlib.sha1(b"".join((ROOT / "assets" / f).read_bytes() for f in ("style.css", "main.js"))).hexdigest()[:8]

# ------------------------------------------------------------------ infos
NOM = "Les Électrici'Ain"
ADRESSE = "49 Rue des Peupliers"
VILLE = "01100 Martignat"
HORAIRES = "Du lundi au samedi, de 8 h à 19 h"
EMAIL = "devis@example.com"  # FACTICE : à remplacer par la vraie adresse qui recevra les demandes
CONTACTS = [
    ("M. Vuillermoz", "06 46 24 50 05", "0646245005"),
    ("M. Bardet", "06 25 62 59 87", "0625625987"),
]
FACEBOOK = "https://www.facebook.com/profile.php?id=61553836072906"
INSTAGRAM = "https://www.instagram.com/leselectriciain"
GMAPS = "https://www.google.com/maps/place/Les+Electrici'Ain/@46.207962,5.6088978,15z"
ZONES = ["Martignat", "Oyonnax", "Bourg-en-Bresse", "Tout le département de l'Ain"]

# ------------------------------------------------------------------ icônes (traits, 24x24)
I = {
 "bolt": '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>',
 "shield": '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3z"/><path d="m9 12 2 2 4-4"/>',
 "home": '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><circle cx="12" cy="14" r="2"/><path d="M8.5 17.5a5 5 0 0 1 7 0"/>',
 "heat": '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 6v12M11 6v12M15 6v12M19 6v12" opacity=".0"/><path d="M7.5 9v6M12 9v6M16.5 9v6"/><path d="M5 18v2M19 18v2"/>',
 "fan": '<circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 1-7 4-7 2 0 3 2 2 4l-4 4"/><path d="M14 12c4 0 7 1 7 4 0 2-2 3-4 2l-4-4"/><path d="M12 14c0 4-1 7-4 7-2 0-3-2-2-4l4-4"/><path d="M10 12c-4 0-7-1-7-4 0-2 2-3 4-2l4 4"/>',
 "gate": '<path d="M3 21V8M21 21V8M3 10h18M3 15h18"/><path d="M7 10v11M11 10v11M15 10v11M19 10v11" opacity=".5"/><circle cx="21" cy="5" r="1.5"/>',
 "factory": '<path d="M3 21V10l6 4V10l6 4V6l6-3v18H3z"/><path d="M7 17h2M12 17h2M17 17h2"/>',
 "plug": '<rect x="4" y="3" width="10" height="18" rx="2"/><path d="M8 8h2l-1.5 3h2L8 15"/><path d="M14 8h3a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V9"/>',
 "phone": '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2"/>',
 "pin": '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
 "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 "award": '<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 8 5-3 5 3-1.5-8"/>',
 "users": '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
 "check": '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
 "wrench": '<path d="M14.5 6.5a4 4 0 0 0 5 5L21 13l-8 8-3-3 6-6-1.5-1.5a4 4 0 0 0-5-5L11 4l-1.5 1.5"/><path d="M3 21l6-6"/>',
 "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
 "chev": '<path d="m6 9 6 6 6-6"/>',
 "menu": '<path d="M4 7h16M4 12h16M4 17h16"/>',
 "fb": '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v7h4v-7h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5z"/>',
 "ig": '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>',
 "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
}

def icon(name):
    return ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{I[name]}</svg>')

# ------------------------------------------------------------------ services
SERVICES = [
 dict(slug="electricite-generale", menu="Électricité générale", icon="bolt", img="img/photo-electricite-generale.webp",
  title="Électricité générale", city="Martignat et Bourg-en-Bresse",
  short="Installation, rénovation, mise aux normes et dépannage, en neuf comme en rénovation.",
  h1="Électricité générale dans l'Ain",
  lead="Installation, rénovation, mise aux normes et dépannage : nos électriciens qualifiés réalisent vos travaux avec soin, chez les particuliers comme chez les professionnels.",
  intro_h="Installation, rénovation et dépannage",
  intro=["Les Électrici'Ain propose une gamme complète de services d'électricité générale, en neuf comme en rénovation. Selon vos besoins, nous prenons en charge la remise aux normes, l'installation de réseaux électriques complets ou le simple ajout de prises.",
         "Notre objectif : des installations sûres, fiables et conformes aux normes en vigueur, livrées dans les délais annoncés."],
  list_h="Ce que nous réalisons",
  items=["Installation électrique complète (neuf et rénovation)", "Mise aux normes NF C 15-100 et mise en sécurité",
         "Remplacement de tableau électrique", "Ajout de prises, circuits et interrupteurs",
         "Éclairage intérieur et extérieur : plafonniers, appliques, suspensions, spots LED",
         "Recherche de panne et dépannage électrique"],
  extra_h="L'éclairage, notre petit plus",
  extra=["Vous voulez moderniser l'éclairage de votre intérieur ou installer de nouveaux luminaires ? Nous vous conseillons sur le choix des modèles (plafonniers, appliques murales, suspensions) et nous les posons proprement, raccordements compris."]),
 dict(slug="alarme-interphonie", menu="Alarme & interphonie", icon="shield", img="img/photo-alarme-interphonie.webp",
  title="Alarme et interphonie", city="Oyonnax et Martignat",
  short="Alarmes anti-intrusion, détecteurs, vidéosurveillance, interphones et visiophones.",
  h1="Alarme & interphonie",
  lead="Nous installons, entretenons et dépannons vos systèmes d'alarme et d'interphonie pour protéger votre maison, votre commerce ou votre site industriel.",
  intro_h="Des solutions de sécurité sur mesure",
  intro=["Particulier ou professionnel, nous assurons l'installation et la maintenance de vos équipements d'alarme et d'interphonie. Chaque solution est pensée pour protéger vos bâtiments, votre matériel et vos proches contre les effractions.",
         "Nous intervenons aussi en dépannage rapide pour garantir la sécurité et le bon fonctionnement de vos équipements."],
  list_h="Nos équipements",
  items=["Alarmes anti-intrusion", "Détecteurs de mouvement et capteurs de bris de vitre",
         "Systèmes de vidéosurveillance", "Interphones et visiophones", "Contrôle d'accès",
         "Maintenance et dépannage"],
  extra_h="Protégé 24 h/24, 7 j/7",
  extra=["Résidentiel, commercial ou industriel : nous concevons un système d'alarme efficace et fiable, adapté à la configuration de vos locaux, pour une protection de jour comme de nuit."]),
 dict(slug="domotique", menu="Domotique", icon="home", img="img/photo-domotique.webp",
  title="Domotique", city="Martignat",
  short="Pilotez éclairage, chauffage, volets et sécurité depuis votre smartphone.",
  h1="Domotique & maison connectée",
  lead="Contrôlez et automatisez votre logement ou vos bureaux pour plus de confort et une meilleure efficacité énergétique.",
  intro_h="Votre maison devient intelligente",
  intro=["Nous concevons, installons et intégrons des systèmes domotiques adaptés à la configuration de vos locaux. Tous vos équipements se gèrent depuis une interface unique.",
         "Depuis un smartphone, une tablette ou un ordinateur, vous réglez l'éclairage, la température, les volets, les stores ou les appareils audiovisuels, où que vous soyez."],
  list_h="Ce que vous pouvez piloter",
  items=["Éclairage et scénarios d'ambiance", "Chauffage et régulation de température",
         "Volets roulants et stores", "Caméras, détecteurs de mouvement et d'intrusion",
         "Suivi des consommations", "Installation, maintenance et dépannage"],
  extra_h="Confort et sécurité réunis",
  extra=["La domotique s'intègre à vos équipements de sécurité (caméras, capteurs, détecteurs) pour vous alerter en temps réel et déclencher les bonnes actions automatiquement."]),
 dict(slug="chauffage-electrique", menu="Chauffage électrique", icon="heat", img="img/photo-chauffage-electrique.webp",
  title="Chauffage électrique", city="Bourg-en-Bresse et Martignat",
  short="Radiateurs, planchers chauffants, régulation : installation, entretien et dépannage.",
  h1="Chauffage électrique",
  lead="Nous installons, entretenons et dépannons vos systèmes de chauffage électrique pour un confort optimal et une facture maîtrisée.",
  intro_h="Installation, entretien et dépannage",
  intro=["Les Électrici'Ain prend en charge l'installation complète de votre chauffage électrique, en neuf comme en rénovation, dans les logements comme dans les locaux professionnels.",
         "Vous remplacez un chauffage existant ou vous équipez un nouveau logement ? Nous vous orientons vers la solution la plus efficace et la plus économique."],
  list_h="Nos solutions",
  items=["Radiateurs électriques à inertie", "Planchers chauffants", "Convecteurs et panneaux rayonnants",
         "Thermostats et régulation programmable", "Entretien et réparation",
         "Diagnostic de panne (thermostat, dysfonctionnement…)"],
  extra_h="Une panne ? On intervient",
  extra=["Problème de thermostat, radiateur qui ne chauffe plus ou toute autre anomalie : nous diagnostiquons et réparons rapidement pour vous rendre votre confort."]),
 dict(slug="vmc", menu="VMC", icon="fan", img="img/vmc.webp",
  title="VMC", city="Oyonnax et Martignat",
  short="VMC simple flux, double flux ou hygroréglable pour un air sain toute l'année.",
  h1="Ventilation VMC",
  lead="Nous posons des systèmes de ventilation mécanique contrôlée performants pour un air intérieur sain et une meilleure efficacité énergétique.",
  intro_h="Un air sain, un bâtiment protégé",
  intro=["Une bonne ventilation évite l'humidité, les moisissures et préserve votre bâtiment. Nous évaluons les besoins de vos locaux et les contraintes techniques pour concevoir la ventilation qui vous convient.",
         "Nous vous orientons vers le type de VMC le mieux adapté, puis nous assurons la pose et la mise en service."],
  list_h="Les systèmes que nous posons",
  items=["VMC simple flux", "VMC double flux avec récupération de chaleur", "VMC hygroréglable",
         "Remplacement de VMC existante", "Entretien et dépannage"],
  extra_h="Conseil personnalisé",
  extra=["Maison, appartement, local professionnel : chaque bâtiment a ses contraintes. Nous vous conseillons la solution la plus pertinente pour votre confort et votre budget."]),
 dict(slug="motorisation-portails-garages", menu="Motorisation portails & garages", icon="gate", img="img/photo-motorisation-portails-garages.webp",
  title="Motorisation de portails et garages", city="Martignat",
  short="Portails battants ou coulissants, portes de garage : installation et réparation.",
  h1="Motorisation portails & garages",
  lead="Automatisez vos accès pour gagner en confort et en sécurité au quotidien.",
  intro_h="Vos fermetures, automatisées",
  intro=["Nous installons, réparons et entretenons vos automatismes de portails et de portes de garage pour rendre l'accès à votre propriété plus pratique et plus sûr.",
         "Nous travaillons avec des marques reconnues pour vous garantir un fonctionnement fluide et durable."],
  list_h="Tous types de fermetures",
  items=["Portails battants", "Portails coulissants", "Portes de garage sectionnelles",
         "Portes basculantes et enroulables", "Télécommandes, digicodes et interphones",
         "Réparation et maintenance des automatismes"],
  extra_h="Le bon équipement pour votre accès",
  extra=["Selon la configuration de votre portail ou de votre garage, nous vous orientons vers la motorisation la plus adaptée, puis nous l'installons et la réglons."]),
 dict(slug="electricite-tertiaire-et-industrielle", menu="Tertiaire & industriel", icon="factory", img="img/photo-electricite-tertiaire-et-industrielle.webp",
  title="Électricité tertiaire et industrielle", city="Bourg-en-Bresse et Oyonnax",
  short="Bureaux, commerces, usines : courant fort, courant faible et maintenance.",
  h1="Électricité tertiaire & industrielle",
  lead="Conception, installation, maintenance et mise à niveau des installations électriques de vos locaux professionnels.",
  intro_h="Votre partenaire pour les pros",
  intro=["Bureaux, commerces, ateliers, usines : nous concevons et réalisons des installations électriques performantes et sécurisées, en tenant compte de vos contraintes d'activité.",
         "Quelle que soit l'ampleur du projet, nous vous garantissons un fonctionnement sûr, fiable et efficace."],
  list_h="Nos interventions",
  items=["Courant fort et courant faible", "Tableaux et armoires électriques",
         "Éclairage de locaux professionnels", "Câblage réseau et informatique",
         "Mise à niveau et mise en conformité", "Maintenance et dépannage"],
  extra_h="Optimiser votre installation",
  extra=["Pour améliorer la performance et la fiabilité de vos équipements, confiez-nous la mise à niveau de vos installations : nous intervenons en limitant l'impact sur votre activité."]),
 dict(slug="borne-irve", menu="Borne de recharge IRVE", icon="plug", img="img/photo-borne-irve.webp",
  title="Bornes de recharge IRVE", city="Martignat",
  short="Bornes de recharge pour véhicules électriques jusqu'à 22 kW.",
  h1="Bornes de recharge IRVE",
  lead="Nous installons des bornes de recharge pour véhicules électriques jusqu'à 22 kW, à domicile, en entreprise ou dans les lieux publics.",
  intro_h="Rechargez en toute sécurité",
  intro=["Les Électrici'Ain est spécialisé dans l'installation de bornes IRVE (Infrastructures de Recharge pour Véhicules Électriques).",
         "Nous vous aidons à choisir la borne adaptée à votre véhicule et à votre usage, puis nous l'installons dans le respect des normes."],
  list_h="Notre accompagnement",
  items=["Conseil personnalisé sur le choix de la borne", "Installation de bornes jusqu'à 22 kW",
         "Particuliers, entreprises et collectivités", "Maintenance et dépannage"],
  extra_h="Un projet de borne ?",
  extra=["Devis personnalisé, demande d'informations ou intervention rapide : contactez-nous, nous vous répondons rapidement."]),
]

REAL_DIR = ROOT / "img" / "realisations"
EXTS = {".jpg", ".jpeg", ".png", ".webp", ".avif"}

def realisations():
    """Photos déposées dans img/realisations/. La légende vient du nom du fichier :
    « 01 - Tableau électrique - Oyonnax.jpg » donne « Tableau électrique - Oyonnax »."""
    if not REAL_DIR.exists():
        return []
    out = []
    for f in sorted(REAL_DIR.iterdir()):
        if f.suffix.lower() in EXTS:
            name = f.stem.replace("_", " ")
            parts = [x.strip() for x in name.split(" - ")]
            if parts and parts[0].isdigit():
                parts = parts[1:]
            out.append((f"img/realisations/{f.name}", " - ".join(parts)))
    return out


def gallery(photos):
    items = []
    for i, (src, cap) in enumerate(photos):
        alt = cap or f"Réalisation {NOM} n°{i + 1}"
        figcap = f"<figcaption>{cap}</figcaption>" if cap else ""
        items.append(f'<figure class="shot"><a href="{src}" data-lightbox><img src="{src}" alt="{alt}" loading="lazy"></a>{figcap}</figure>')
    return '<div class="gallery">' + "".join(items) + "</div>"


PARTENAIRES = ["img/p1.webp", "img/p2.webp", "img/p3.webp", "img/p4.webp"]

# ------------------------------------------------------------------ gabarit
def head(title, desc, canonical, extra=""):
    return f"""<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="https://www.leselectrici-ain.fr/{canonical}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:image" content="img/logo.webp">
<meta name="theme-color" content="#ffffff">
<link rel="icon" href="img/logo.webp">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:ital,wght@0,500;0,600;0,700;1,600;1,700&display=swap" rel="stylesheet">
<script>document.documentElement.classList.add('js')</script>
<link rel="stylesheet" href="assets/style.css?v={VER}">
{SCHEMA}
{extra}</head>
<body>
"""

SCHEMA = """<script type="application/ld+json">
{"@context":"https://schema.org","@type":"Electrician","name":"Les Électrici'Ain",
"image":"https://www.leselectrici-ain.fr/img/logo.webp","url":"https://www.leselectrici-ain.fr/",
"telephone":"+33646245005",
"address":{"@type":"PostalAddress","streetAddress":"49 Rue des Peupliers","postalCode":"01100","addressLocality":"Martignat","addressCountry":"FR"},
"geo":{"@type":"GeoCoordinates","latitude":46.207962,"longitude":5.6088978},
"openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],"opens":"08:00","closes":"19:00"}],
"areaServed":"Ain","sameAs":["https://www.facebook.com/profile.php?id=61553836072906","https://www.instagram.com/leselectriciain"]}
</script>"""


def header(active):
    sub = "\n".join(
        f'<a href="{s["slug"]}.html"{" aria-current=\"page\"" if active == s["slug"] else ""}>{s["menu"]}</a>'
        for s in SERVICES)
    in_services = any(active == s["slug"] for s in SERVICES)
    phones = "".join(f'<a href="tel:{t}">{icon("phone").replace("<svg", "<svg width=14 height=14 style=vertical-align:-2px")} {n} <b>{d}</b></a>'
                     for n, d, t in CONTACTS)
    return f"""<a class="skip" href="#contenu">Aller au contenu</a>
<div class="topbar"><div class="container">
  <span>{HORAIRES}, garantie décennale sur tous les travaux</span>
  <span class="topbar__phones">{phones}</span>
</div></div>
<header class="header"><div class="container">
  <a class="logo" href="index.html" aria-label="{NOM}, accueil"><img src="img/logo.webp" alt="{NOM}" width="600" height="346"></a>
  <button class="burger" aria-label="Menu" aria-expanded="false" aria-controls="nav">{icon("menu")}</button>
  <nav class="nav" id="nav" aria-label="Navigation principale">
    <a href="index.html"{' aria-current="page"' if active == "index" else ""}>Accueil</a>
    <div class="nav__drop">
      <button type="button" aria-expanded="false"{' style="color:var(--blue)"' if in_services else ""}>Nos services {icon("chev")}</button>
      <div class="nav__menu">{sub}</div>
    </div>
    <a href="realisations.html"{' aria-current="page"' if active == "realisations" else ""}>Réalisations</a>
    <a href="index.html#entreprise">L'entreprise</a>
    <a href="contact.html"{' aria-current="page"' if active == "contact" else ""}>Contact</a>
    <a class="btn btn--yellow" href="contact.html">Devis gratuit</a>
  </nav>
</div></header>
<main id="contenu">
"""


def cta():
    calls = "".join(f'<a class="call" href="tel:{t}"><span>Appeler {n}</span><b>{d}</b></a>' for n, d, t in CONTACTS)
    return f"""<section class="cta"><div class="container">
  <div class="cta__text"><h2>Une panne, un projet&nbsp;?</h2><p>Appelez directement l'un des deux associés, ou décrivez votre besoin et nous vous rappelons.</p>
  <a class="btn btn--ink" href="contact.html">Demander un devis par écrit</a></div>
  <div class="cta__calls">{calls}</div>
</div></section>
"""


def footer():
    svc = "".join(f'<li><a href="{s["slug"]}.html">{s["menu"]}</a></li>' for s in SERVICES)
    ppl = "".join(f'<li>{n}<br><a class="footer__tel" href="tel:{t}">{d}</a></li>' for n, d, t in CONTACTS)
    return f"""</main>
<footer class="footer"><div class="container">
  <div class="footer__grid">
    <div>
      <a class="footer__logo" href="index.html" aria-label="{NOM}, accueil"><img src="img/logo.webp" alt="{NOM}" width="600" height="346" loading="lazy"></a>
      <p>Société d'électricité à Martignat. Électricité générale, tertiaire et industrielle pour les particuliers et les professionnels de l'Ain.</p>
      <div class="footer__social">
        <a href="{FACEBOOK}" target="_blank" rel="noopener" aria-label="Facebook">{icon("fb")}</a>
        <a href="{INSTAGRAM}" target="_blank" rel="noopener" aria-label="Instagram">{icon("ig")}</a>
      </div>
    </div>
    <div><h2 class="footer__title">Nos services</h2><ul>{svc}</ul></div>
    <div><h2 class="footer__title">Contact</h2><ul>
      {ppl}
      <li><a href="{GMAPS}" target="_blank" rel="noopener">{ADRESSE}<br>{VILLE}</a></li>
      <li>{HORAIRES}</li>
    </ul></div>
  </div>
  <div class="footer__bottom"><span>© {NOM}. Tous droits réservés. <a href="credits.html">Crédits photos</a></span><span>Garantie décennale sur tous nos travaux</span></div>
</div></footer>
<nav class="callbar" aria-label="Appeler">
  {"".join(f'<a href="tel:{t}">{icon("phone")}<span>Appeler<b>{n.split()[-1]}</b></span></a>' for n, d, t in CONTACTS)}
</nav>
<script src="assets/main.js?v={VER}" defer></script>
</body>
</html>
"""


def panel(exclude=None, animate=False):
    """Les services présentés comme les disjoncteurs d'un tableau électrique."""
    mods = []
    for s_ in [x for x in SERVICES if x["slug"] != exclude]:
        mods.append(f"""<li{' class="pw"' if animate else ''}><a class="brk brk--{s_["slug"]}" href="{s_["slug"]}.html">
  <span class="brk__label">{s_["title"]}</span>
  <span class="brk__face" aria-hidden="true"><span class="brk__win"></span><span class="brk__slot"><span class="brk__lever"></span></span>{icon(s_["icon"])}</span>
  <span class="brk__desc">{s_["short"]}</span>
</a></li>""")
    tpls = "".join(volet_template(x) for x in SERVICES if x["slug"] != exclude)
    return f'<div class="panel"><ul class="panel__rail">' + "\n".join(mods) + "</ul></div>" + tpls


def volet_template(s_):
    """Contenu d'un service, affiché dans le volet qui s'ouvre au clic sur son disjoncteur."""
    n, d, t = CONTACTS[0]
    intro = "".join(f"<p>{p}</p>" for p in s_["intro"])
    items = "".join(f"<li>{i}</li>" for i in s_["items"])
    extra = "".join(f"<p>{p}</p>" for p in s_["extra"])
    img = (f'<figure class="vc__img"><img src="{s_["img"]}" alt="{s_["title"]}" width="1500" height="1000" decoding="async"></figure>'
           if s_["img"] else "")
    return f"""<template id="volet-{s_["slug"]}" data-title="{s_["title"]}"><div class="vc">
  <div class="vc__head">
    <div>
      <h2 class="vc__title">{s_["h1"]}</h2>
      <p class="lead">{s_["lead"]}</p>
      <div class="hero__ctas">
        <a class="btn btn--yellow" href="contact.html">Demander un devis</a>
        <a class="btn btn--line" href="tel:{t}">{icon("phone")} {d}</a>
      </div>
    </div>
    {img}
  </div>
  <div class="vc__cols">
    <div><h3>{s_["intro_h"]}</h3>{intro}</div>
    <div><h3>{s_["list_h"]}</h3><ul class="checks">{items}</ul></div>
  </div>
  <div class="aside-note"><h3>{s_["extra_h"]}</h3>{extra}</div>
  <p class="vc__more"><a href="{s_["slug"]}.html">Voir la page complète : {s_["title"]}</a></p>
</div></template>"""



# ------------------------------------------------------------------ scènes animées par service
# Petites illustrations en traits (style des icônes), animées en CSS (classes .sc-*).
_K = 'stroke="#000" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"'
SCENES = {
 "electricite-generale": f"""
  <rect x="26" y="58" width="64" height="64" rx="12" fill="#fff" {_K}/>
  <circle cx="58" cy="90" r="19" fill="#f2f3f0" {_K}/>
  <circle cx="51" cy="90" r="3.2" fill="#000"/><circle cx="65" cy="90" r="3.2" fill="#000"/>
  <path d="M90 90 H138 Q154 90 154 106 V128 Q154 142 170 142 H186 Q194 142 194 134 V112" fill="none" {_K}/>
  <path class="sc-current" d="M90 90 H138 Q154 90 154 106 V128 Q154 142 170 142 H186 Q194 142 194 134 V112" fill="none" stroke="#f7c600" stroke-width="5" stroke-linecap="round"/>
  <circle class="sc-glow" cx="194" cy="66" r="34" fill="#f7c600"/>
  <path d="M194 40 a24 24 0 0 1 14 43 v12 h-28 v-12 a24 24 0 0 1 14 -43 z" fill="#fff" {_K}/>
  <path class="sc-filament" d="M186 80 l4 -10 l4 8 l4 -8 l4 10" fill="none" stroke="#f7c600" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M182 104 h24" {_K}/>""",
 "alarme-interphonie": f"""
  <path d="M44 100 L120 42 L196 100 V160 H44 Z" fill="#fff" {_K}/>
  <circle class="sc-ripple" cx="120" cy="104" r="12" fill="none" stroke="#2a5cb3" stroke-width="3"/>
  <circle class="sc-ripple sc-d2" cx="120" cy="104" r="12" fill="none" stroke="#2a5cb3" stroke-width="3"/>
  <rect x="102" y="92" width="36" height="26" rx="8" fill="#f2f3f0" {_K}/>
  <circle class="sc-led" cx="129" cy="101" r="4" fill="#d8261c"/>
  <path d="M110 108 h12" {_K}/>
  <path d="M106 160 v-28 h28 v28" fill="none" {_K}/>""",
 "domotique": f"""
  <path class="sc-wave" d="M98 46 q22 -14 44 0" fill="none" stroke="#2a5cb3" stroke-width="4" stroke-linecap="round"/>
  <path class="sc-wave sc-d2" d="M86 34 q34 -22 68 0" fill="none" stroke="#2a5cb3" stroke-width="4" stroke-linecap="round"/>
  <path class="sc-wave sc-d3" d="M74 22 q46 -30 92 0" fill="none" stroke="#2a5cb3" stroke-width="4" stroke-linecap="round"/>
  <path d="M44 112 L120 60 L196 112 V166 H44 Z" fill="#fff" {_K}/>
  <circle class="sc-glow sc-glow--sync" cx="120" cy="116" r="26" fill="#f7c600"/>
  <path d="M120 98 a14 14 0 0 1 8 25 v7 h-16 v-7 a14 14 0 0 1 8 -25 z" fill="#fff" {_K}/>
  <path d="M114 138 h12" {_K}/>""",
 "chauffage-electrique": f"""
  <path class="sc-heat" d="M84 92 q-9 -11 0 -22 q9 -11 0 -22" fill="none" stroke="#f0a800" stroke-width="4.5" stroke-linecap="round"/>
  <path class="sc-heat sc-d2" d="M120 92 q-9 -11 0 -22 q9 -11 0 -22" fill="none" stroke="#f0a800" stroke-width="4.5" stroke-linecap="round"/>
  <path class="sc-heat sc-d3" d="M156 92 q-9 -11 0 -22 q9 -11 0 -22" fill="none" stroke="#f0a800" stroke-width="4.5" stroke-linecap="round"/>
  <rect x="36" y="100" width="168" height="54" rx="10" fill="#fff" {_K}/>
  <path d="M58 112 v30 M78 112 v30 M98 112 v30 M118 112 v30 M138 112 v30 M158 112 v30" {_K}/>
  <circle cx="184" cy="127" r="7" fill="#f2f3f0" {_K}/>
  <path d="M52 154 v10 M188 154 v10" {_K}/>""",
 "vmc": f"""
  <circle cx="104" cy="92" r="62" fill="#fff" {_K}/>
  <circle cx="104" cy="92" r="50" fill="none" stroke="#c9cdc7" stroke-width="2"/>
  <g class="sc-spin">
    <path d="M104 92 C96 70 100 50 112 46 C122 44 124 62 104 92 Z" fill="#2a5cb3"/>
    <path d="M104 92 C126 84 146 88 150 100 C152 110 134 112 104 92 Z" fill="#2a5cb3"/>
    <path d="M104 92 C112 114 108 134 96 138 C86 140 84 122 104 92 Z" fill="#2a5cb3"/>
    <path d="M104 92 C82 100 62 96 58 84 C56 74 74 72 104 92 Z" fill="#2a5cb3"/>
  </g>
  <circle cx="104" cy="92" r="8" fill="#fff" {_K}/>
  <path class="sc-air" d="M178 70 h34" stroke="#2a5cb3" stroke-width="4" stroke-linecap="round"/>
  <path class="sc-air sc-d2" d="M184 92 h30" stroke="#2a5cb3" stroke-width="4" stroke-linecap="round"/>
  <path class="sc-air sc-d3" d="M178 114 h34" stroke="#2a5cb3" stroke-width="4" stroke-linecap="round"/>""",
 "motorisation-portails-garages": f"""
  <path d="M16 156 H224" {_K}/>
  <rect x="30" y="66" width="14" height="90" rx="2" fill="#f2f3f0" {_K}/>
  <circle class="sc-flash" cx="37" cy="56" r="8" fill="#ff8a00"/>
  <path d="M30 60 h14" {_K}/>
  <g class="sc-gate">
    <rect x="46" y="84" width="142" height="64" rx="3" fill="#fff" {_K}/>
    <path d="M66 84 v64 M86 84 v64 M106 84 v64 M126 84 v64 M146 84 v64 M166 84 v64 M46 116 h142" stroke="#000" stroke-width="2.4"/>
  </g>
  <rect x="190" y="66" width="14" height="90" rx="2" fill="#f2f3f0" {_K}/>
  <rect x="14" y="134" width="14" height="22" rx="3" fill="#2a5cb3" {_K}/>""",
 "electricite-tertiaire-et-industrielle": f"""
  <rect x="52" y="34" width="136" height="128" rx="4" fill="#fff" {_K}/>
  <g class="sc-windows">""" + "".join(
     f'<rect x="{68 + c * 28}" y="{50 + r * 26}" width="18" height="16" rx="2" fill="#e4e6e2" stroke="#000" stroke-width="2" style="--w:{(r * 4 + c) * 7 % 16}"/>'
     for r in range(4) for c in range(4)) + f"""</g>
  <path d="M108 162 v-20 h24 v20" fill="#f2f3f0" {_K}/>""",
 "borne-irve": f"""
  <rect x="30" y="34" width="62" height="120" rx="12" fill="#fff" {_K}/>
  <rect x="42" y="48" width="38" height="26" rx="4" fill="#2a5cb3"/>
  <path d="M58 54 l-6 10 h8 l-4 8" fill="none" stroke="#f7c600" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M24 154 h74" {_K}/>
  <path d="M92 116 C120 116 112 92 136 92" fill="none" {_K}/>
  <path class="sc-current sc-current--short" d="M92 116 C120 116 112 92 136 92" fill="none" stroke="#f7c600" stroke-width="5" stroke-linecap="round"/>
  <rect x="136" y="70" width="80" height="44" rx="8" fill="#fff" {_K}/>
  <rect x="216" y="84" width="8" height="16" rx="2" fill="#000"/>
  <rect class="sc-fill" x="143" y="77" width="66" height="30" rx="4" fill="#3bb36a"/>
  <path d="M178 80 l-8 13 h10 l-6 12" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>""",
}


def scene(slug):
    """Scène animée du service, dans un coffret gris (en-tête des pages services)."""
    return f"""<div class="scene" aria-hidden="true"><svg viewBox="0 0 240 180" class="scene__svg scene--{slug}">{SCENES[slug]}</svg></div>"""


def breaker(s_):
    """Un disjoncteur seul, décoratif, pour l'en-tête des pages services."""
    return f"""<div class="solo pw" aria-hidden="true" data-now><span class="brk__label">{s_["title"]}</span>
<span class="brk__face"><span class="brk__win"></span><span class="brk__slot"><span class="brk__lever"></span></span>{icon(s_["icon"])}</span></div>"""


def perks():
    data = [("Garantie décennale", "Tous nos travaux sont assurés pendant dix ans."),
            ("Devis gratuit", "Un prix clair avant le début du chantier, sans surprise."),
            ("Six jours sur sept", "Joignables du lundi au samedi, de 8 h à 19 h."),
            ("Deux associés", "Ceux qui font le devis sont ceux qui font le chantier.")]
    items = "".join(f"<div><dt>{t}</dt><dd>{d}</dd></div>" for t, d in data)
    return f"""<div class="pledge"><img class="pledge__stamp" src="img/decennale.webp" alt="Garantie décennale" width="512" height="346" loading="lazy"><dl>{items}</dl></div>"""


STEPS = [("Vous appelez", "Vous tombez directement sur l'un des deux associés, du lundi au samedi."),
         ("On regarde ensemble", "Nous faisons le point sur votre besoin, sur place si c'est utile."),
         ("Vous recevez le devis", "Gratuit, détaillé, sans surprise : vous savez ce que vous payez."),
         ("On réalise les travaux", "Chantier propre, délais tenus, travaux couverts par la garantie décennale.")]


def process():
    items = "".join(f"<li><h3>{t}</h3><p>{d}</p></li>" for t, d in STEPS)
    return f"""<section class="section"><div class="container">
  <h2>Comment ça se passe</h2>
  <ol class="steps">{items}</ol>
</div></section>"""


FAQ = [("Le devis est-il payant ?", "Non. Le devis est gratuit et ne vous engage à rien."),
       ("Dans quelles communes intervenez-vous ?", "Nous sommes basés à Martignat et intervenons à Oyonnax, dans le Haut-Bugey, jusqu'à Bourg-en-Bresse et dans tout le département de l'Ain."),
       ("Mon installation est ancienne : faut-il tout refaire ?", "Pas forcément. Nous commençons par regarder l'état de votre installation, puis nous vous proposons une mise en sécurité ou une rénovation complète, selon ce qui est nécessaire et votre budget."),
       ("Vos travaux sont-ils garantis ?", "Oui. Tous nos travaux sont couverts par la garantie décennale."),
       ("Travaillez-vous pour les professionnels ?", "Oui : bureaux, commerces, ateliers et sites industriels, en courant fort comme en courant faible."),
       ("Quand peut-on vous joindre ?", "Du lundi au samedi, de 8 h à 19 h, directement sur le portable de l'un des deux associés.")]


def faq():
    nb = lambda x: x.replace(" ?", "\u202f?").replace(" :", "\u202f:")
    items = "".join(f"<details><summary>{nb(q)}</summary><p>{nb(a)}</p></details>" for q, a in FAQ)
    data = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}
    import json
    return f"""<section class="section section--alt"><div class="container faq-grid">
  <div><h2>Questions fréquentes</h2><p>Une autre question&nbsp;? Appelez-nous, c'est le plus rapide.</p></div>
  <div class="faq">{items}</div>
</div>
<script type="application/ld+json">{json.dumps(data, ensure_ascii=False)}</script></section>"""


# ------------------------------------------------------------------ pages
def page_index():
    team = "".join(f"""<div class="person"><span class="person__name">{n}</span><a class="person__tel" href="tel:{t}">{d}</a></div>""" for n, d, t in CONTACTS)
    brands = "".join(f'<img src="{p}" alt="" loading="lazy" width="300" height="134">' for p in PARTENAIRES)
    zones = ", ".join(ZONES[:-1]) + " et " + ZONES[-1].lower()
    return head(f"Électricien à Martignat (01) | {NOM}",
                "Les Électrici'Ain, société d'électricité à Martignat : électricité générale, domotique, chauffage, VMC, alarme, bornes IRVE. Particuliers et pros dans l'Ain. Devis gratuit.",
                "") + header("index") + f"""
<section class="hero"><div class="container">
  <div class="hero__head">
    <h1>Électriciens à Martignat, pour les maisons et les entreprises de l'Ain</h1>
    <div class="hero__side">
      <p class="lead">Installation, rénovation, mise aux normes et dépannage. Deux associés qui répondent eux-mêmes au téléphone et viennent eux-mêmes sur le chantier.</p>
      <div class="hero__ctas">
        <a class="btn btn--yellow" href="contact.html">Demander un devis gratuit</a>
        <a class="btn btn--line" href="tel:{CONTACTS[0][2]}">{icon("phone")} {CONTACTS[0][1]}</a>
      </div>
    </div>
  </div>
  <h2 class="sr-only">Nos services</h2>
  {panel(animate=True)}
</div></section>

{teaser()}
<section class="section" id="entreprise"><div class="container">
  <div class="split">
    <div>
      <h2>Deux associés, un seul interlocuteur</h2>
      <p>Les Électrici'Ain est une société d'électricité installée à Martignat. Ses deux associés interviennent chez les particuliers comme chez les professionnels, partout dans l'Ain.</p>
      <p>Celui qui établit votre devis est celui qui réalise vos travaux : pas d'intermédiaire, des installations conformes aux normes et des délais tenus.</p>
      <div class="team">{team}</div>
    </div>
    <figure class="split__img"><img src="img/photo-entreprise.webp" alt="Tableau électrique ouvert, câblé proprement" loading="lazy" width="1500" height="1000"></figure>
  </div>
</div></section>

{process()}

<section class="section section--alt"><div class="container">
  <h2>Ce sur quoi vous pouvez compter</h2>
  {perks()}
</div></section>

<section class="section"><div class="container">
  <div class="split">
    <div>
      <h2>Partout dans l'Ain</h2>
      <p>Depuis Martignat, nous intervenons dans le Haut-Bugey, autour d'Oyonnax et jusqu'à Bourg-en-Bresse : {zones}.</p>
      <h3>Du matériel de marques reconnues</h3>
      <p>Nous posons du matériel Schneider Electric, Legrand, Hager et Soler&nbsp;&amp;&nbsp;Palau, pour des installations qui durent.</p>
      <div class="brands" aria-hidden="true">{brands}</div>
    </div>
    <figure class="split__img split__img--tall"><img src="img/photo-zone.webp" alt="Le lac de Nantua et les falaises du Haut-Bugey" loading="lazy" width="1500" height="1000"><figcaption>Le lac de Nantua, dans le Haut-Bugey</figcaption></figure>
  </div>
</div></section>

{faq()}
""" + cta() + footer()


def teaser():
    photos = realisations()
    if not photos:
        return ""
    more = f'<a class="btn btn--blue" href="realisations.html">Voir les {len(photos)} réalisations</a>' if len(photos) > 6 else ""
    return f"""<section class="section"><div class="container">
  <h2>Nos derniers chantiers</h2>
  {gallery(photos[:6])}
  <div class="row-btns">{more}
    <a class="btn btn--line" href="{INSTAGRAM}" target="_blank" rel="noopener">{icon("ig")} Suivre sur Instagram</a></div>
</div></section>"""


def page_hero(crumb, h1, lead, aside="", ctas=True, note=""):
    btns = f"""<div class="hero__ctas">
    <a class="btn btn--yellow" href="contact.html">Demander un devis</a>
    <a class="btn btn--line" href="tel:{CONTACTS[0][2]}">{icon("phone")} {CONTACTS[0][1]}</a>
  </div>""" if ctas else ""
    note = f'<p class="page-hero__note">{note}</p>' if note else ""
    return f"""<section class="page-hero"><div class="container">
  <div class="page-hero__text">
    <nav class="crumbs" aria-label="Fil d'Ariane"><a href="index.html">Accueil</a> <span aria-hidden="true">/</span> {crumb}</nav>
    <h1>{h1}</h1>
    <p class="lead">{lead}</p>
    {btns}{note}
  </div>
  {aside}
</div></section>"""


def page_realisations():
    photos = realisations()
    body = gallery(photos) if photos else '<p class="lead">Les photos de nos chantiers arrivent bientôt. En attendant, retrouvez nos réalisations sur Instagram.</p>'
    return head(f"Nos réalisations | {NOM}",
                "Découvrez les chantiers des Électrici'Ain : installations électriques, tableaux, domotique, bornes de recharge et motorisations dans l'Ain.",
                "realisations") + header("realisations") + page_hero(
        "Réalisations", "Nos réalisations",
        "Quelques installations réalisées chez des particuliers et des professionnels de l'Ain.", ctas=False) + f"""
<section class="section"><div class="container">
  {body}
  <div class="row-btns"><a class="btn btn--blue" href="{INSTAGRAM}" target="_blank" rel="noopener">{icon("ig")} Plus de photos sur Instagram</a></div>
</div></section>
""" + cta() + footer()


def page_service(s):
    img_block = (f'<figure class="split__img"><img src="{s["img"]}" alt="{s["title"]}" loading="lazy" width="1500" height="1000"></figure>'
                 if s["img"] else "")
    items = "".join(f"<li>{i}</li>" for i in s["items"])
    intro = "".join(f"<p>{p}</p>" for p in s["intro"])
    extra = "".join(f"<p>{p}</p>" for p in s["extra"])
    split_cls = "split" if s["img"] else "split split--text"
    return head(f"{s['title']} à {s['city'].split(' et ')[0]} (01) | {NOM}",
                f"{s['short']} {NOM}, électriciens à Martignat, interviennent dans l'Ain. Devis gratuit.",
                s["slug"]) + header(s["slug"]) + page_hero(
        s["title"], s["h1"], s["lead"], aside=scene(s["slug"]),
        note=f"Intervention à {s['city']} et dans tout l'Ain.") + f"""

<section class="section"><div class="container">
  <div class="{split_cls}">
    <div>
      <h2>{s["intro_h"]}</h2>
      {intro}
    </div>
    {img_block}
  </div>
</div></section>

<section class="section section--alt"><div class="container">
  <div class="split split--top">
    <div>
      <h2>{s["list_h"]}</h2>
      <ul class="checks">{items}</ul>
    </div>
    <div class="aside-note">
      <h3>{s["extra_h"]}</h3>
      {extra}
      <a class="btn btn--blue" href="contact.html">Nous contacter</a>
    </div>
  </div>
</div></section>

<section class="section"><div class="container">
  <h2>Ce sur quoi vous pouvez compter</h2>
  {perks()}
</div></section>

<section class="section section--panel"><div class="container">
  <h2>Nos autres services</h2>
  {panel(exclude=s["slug"])}
</div></section>
""" + cta() + footer()


LEAFLET = """<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" integrity="sha512-h9FcoyWjHcOcmEVkxOfTLnmZFWIH0iZhZT1H2TbOq55xssQGEJHEaIm+PgoUaZbRvQTNTluNOEfb1ZRy6D3BOw==" crossorigin="anonymous" referrerpolicy="no-referrer">
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js" integrity="sha512-puJW3E/qXDqYp9IfhAI54BJEaWIfloJ7JWs7OeD5i6ruC9JZL1gERT1wjtwXFlh7CjE7ZJ+/vcRZRkIYIb6p4g==" crossorigin="anonymous" referrerpolicy="no-referrer" defer></script>
"""


def page_contact():
    opts = "".join(f"<option>{s['title']}</option>" for s in SERVICES) + "<option>Dépannage</option><option>Autre</option>"
    ppl = "".join(f'<a class="person__tel" href="tel:{t}">{d}</a><span class="person__name">{n}</span>' for n, d, t in CONTACTS)
    return head(f"Contact et devis gratuit | {NOM}",
                "Contactez Les Électrici'Ain à Martignat pour un devis gratuit : 06 46 24 50 05 ou 06 25 62 59 87. Du lundi au samedi, de 8 h à 19 h.",
                "contact", extra=LEAFLET) + header("contact") + page_hero(
        "Contact", "Parlons de votre projet",
        "Appelez-nous directement ou laissez-nous votre demande : nous vous rappelons rapidement.", ctas=False) + f"""

<section class="section"><div class="container contact-grid">
  <div>
    <h2>Par téléphone</h2>
    <div class="contact-calls">{ppl}</div>
    <ul class="info-list">
      <li><span class="ico">{icon("pin")}</span><div><b>Adresse</b><a href="{GMAPS}" target="_blank" rel="noopener">{ADRESSE}<br>{VILLE}</a></div></li>
      <li><span class="ico">{icon("clock")}</span><div><b>Horaires</b>{HORAIRES}</div></li>
      <li><span class="ico">{icon("award")}</span><div><b>Garantie</b>Tous nos travaux sont couverts par la garantie décennale.</div></li>
    </ul>
  </div>
  <form class="form" action="" method="post" data-email="{EMAIL}">
    <h2>Demande de devis</h2>
    <div class="form__row">
      <div class="field"><label for="nom">Nom et prénom *</label><input id="nom" name="nom" required autocomplete="name"></div>
      <div class="field"><label for="tel">Téléphone *</label><input id="tel" name="tel" type="tel" required autocomplete="tel" inputmode="tel"></div>
    </div>
    <div class="form__row">
      <div class="field"><label for="email">E-mail</label><input id="email" name="email" type="email" autocomplete="email" spellcheck="false"></div>
      <div class="field"><label for="ville">Commune</label><input id="ville" name="ville" autocomplete="address-level2"></div>
    </div>
    <div class="field"><label for="service">Prestation</label><select id="service" name="service">{opts}</select></div>
    <div class="field"><label for="message">Votre demande *</label><textarea id="message" name="message" required placeholder="Par exemple : remplacement du tableau électrique d'une maison de 1980"></textarea></div>
    <button class="btn btn--yellow btn--block" type="submit">Envoyer ma demande</button>
    <p class="form__note" hidden>L'envoi en ligne n'est pas encore activé. Appelez-nous au <a href="tel:{CONTACTS[0][2]}">{CONTACTS[0][1]}</a> ou au <a href="tel:{CONTACTS[1][2]}">{CONTACTS[1][1]}</a>.</p>
    <small>* Champs obligatoires. Vos informations servent uniquement à répondre à votre demande.</small>
  </form>
</div></section>

<section class="section section--flush"><div class="container">
  <div class="mapbox">
    <div class="map" id="map" data-lat="46.207962" data-lng="5.6088978" role="region" aria-label="Carte : {ADRESSE}, {VILLE}"></div>
    <div class="mapcard">
      <b>{NOM}</b>
      <span>{ADRESSE}<br>{VILLE}</span>
      <small>{HORAIRES}</small>
    </div>
  </div>
</div></section>
""" + footer()


def page_404():
    # <base href="/"> : la page 404 peut être servie à n'importe quelle profondeur d'URL
    return head(f"Page introuvable | {NOM}", "Cette page n'existe pas ou a été déplacée.", "404").replace(
        '<meta charset="utf-8">', '<meta charset="utf-8">\n<base href="/">\n<meta name="robots" content="noindex">') + header("") + page_hero(
        "Page introuvable", "Cette page n'existe pas",
        "Le lien est peut-être ancien ou mal recopié. Choisissez un service ci-dessous ou revenez à l'accueil.", ctas=False) + f"""
<section class="section section--panel"><div class="container">
  {panel()}
  <div class="row-btns"><a class="btn btn--blue" href="index.html">Retour à l'accueil</a></div>
</div></section>
""" + footer()


import json as _json
CREDITS = _json.loads((Path(__file__).resolve().parent / "credits.json").read_text(encoding="utf-8"))
LIC_URL = {"CC0": "https://creativecommons.org/publicdomain/zero/1.0/deed.fr",
           "CC BY 4.0": "https://creativecommons.org/licenses/by/4.0/deed.fr",
           "CC BY-SA 2.0": "https://creativecommons.org/licenses/by-sa/2.0/deed.fr",
           "CC BY-SA 3.0": "https://creativecommons.org/licenses/by-sa/3.0/deed.fr",
           "CC BY-SA 4.0": "https://creativecommons.org/licenses/by-sa/4.0/deed.fr"}


def page_credits():
    rows = "".join(
        f"""<li><img src="img/photo-{k}.webp" alt="" width="1500" height="1000" loading="lazy"><div><b>{v["title"].removeprefix("File:")}</b>
<span>Auteur : {v["artist"] or "inconnu"}</span>
<span>Licence : <a href="{LIC_URL.get(v["lic"], "https://creativecommons.org/licenses/")}" target="_blank" rel="noopener">{v["lic"]}</a>, via <a href="{v["page"]}" target="_blank" rel="noopener">Wikimedia Commons</a> (recadrée)</span></div></li>"""
        for k, v in CREDITS.items())
    return head(f"Crédits photos | {NOM}", "Auteurs et licences des photos utilisées sur le site.", "credits") + header("") + page_hero(
        "Crédits photos", "Crédits photos",
        "Les photos d'illustration proviennent de Wikimedia Commons, sous licences libres. Merci à leurs auteurs.", ctas=False) + f"""
<section class="section"><div class="container"><ul class="credits">{rows}</ul></div></section>
""" + footer()


def main():
    pages = {"index.html": page_index(), "404.html": page_404(), "credits.html": page_credits(), "contact.html": page_contact(), "realisations.html": page_realisations()}
    for s in SERVICES:
        pages[s["slug"] + ".html"] = page_service(s)
    import re
    def stamp(m):   # version de chaque image dans son adresse : un navigateur ne garde jamais une ancienne photo
        f = ROOT / m.group(2)
        v = hashlib.sha1(f.read_bytes()).hexdigest()[:8] if f.exists() else ""
        return f'{m.group(1)}="{m.group(2)}?v={v}"' if v else m.group(0)
    for name, html in pages.items():
        html = re.sub(r'(src|href|content)="(img/[^"?]+)"', stamp, html)
        (ROOT / name).write_text(html, encoding="utf-8")
        print("écrit", name)


if __name__ == "__main__":
    main()

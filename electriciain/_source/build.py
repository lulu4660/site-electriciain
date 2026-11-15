# -*- coding: utf-8 -*-
"""Génère les pages HTML du site Les Électrici'Ain.

Modifier les textes ici puis lancer :  python _source/build.py
Les pages .html sont écrites à la racine du dossier electriciain/.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

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
 dict(slug="electricite-generale", menu="Électricité générale", icon="bolt", img="img/depannage.webp",
  title="Électricité générale", city="Martignat et Bourg-en-Bresse",
  short="Installation, rénovation, mise aux normes et dépannage, en neuf comme en rénovation.",
  h1="Électricité générale <em>dans l'Ain</em>",
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
 dict(slug="alarme-interphonie", menu="Alarme & interphonie", icon="shield", img=None,
  title="Alarme et interphonie", city="Oyonnax et Martignat",
  short="Alarmes anti-intrusion, détecteurs, vidéosurveillance, interphones et visiophones.",
  h1="Alarme & <em>interphonie</em>",
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
 dict(slug="domotique", menu="Domotique", icon="home", img="img/domotique.webp",
  title="Domotique", city="Martignat",
  short="Pilotez éclairage, chauffage, volets et sécurité depuis votre smartphone.",
  h1="Domotique & <em>maison connectée</em>",
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
 dict(slug="chauffage-electrique", menu="Chauffage électrique", icon="heat", img=None,
  title="Chauffage électrique", city="Bourg-en-Bresse et Martignat",
  short="Radiateurs, planchers chauffants, régulation : installation, entretien et dépannage.",
  h1="Chauffage <em>électrique</em>",
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
  h1="Ventilation <em>VMC</em>",
  lead="Nous posons des systèmes de ventilation mécanique contrôlée performants pour un air intérieur sain et une meilleure efficacité énergétique.",
  intro_h="Un air sain, un bâtiment protégé",
  intro=["Une bonne ventilation évite l'humidité, les moisissures et préserve votre bâtiment. Nous évaluons les besoins de vos locaux et les contraintes techniques pour concevoir la ventilation qui vous convient.",
         "Nous vous orientons vers le type de VMC le mieux adapté, puis nous assurons la pose et la mise en service."],
  list_h="Les systèmes que nous posons",
  items=["VMC simple flux", "VMC double flux avec récupération de chaleur", "VMC hygroréglable",
         "Remplacement de VMC existante", "Entretien et dépannage"],
  extra_h="Conseil personnalisé",
  extra=["Maison, appartement, local professionnel : chaque bâtiment a ses contraintes. Nous vous conseillons la solution la plus pertinente pour votre confort et votre budget."]),
 dict(slug="motorisation-portails-garages", menu="Motorisation portails & garages", icon="gate", img="img/motorisation.webp",
  title="Motorisation de portails et garages", city="Martignat",
  short="Portails battants ou coulissants, portes de garage : installation et réparation.",
  h1="Motorisation <em>portails & garages</em>",
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
 dict(slug="electricite-tertiaire-et-industrielle", menu="Tertiaire & industriel", icon="factory", img="img/tertiaire.jpg",
  title="Électricité tertiaire et industrielle", city="Bourg-en-Bresse et Oyonnax",
  short="Bureaux, commerces, usines : courant fort, courant faible et maintenance.",
  h1="Électricité <em>tertiaire & industrielle</em>",
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
 dict(slug="borne-irve", menu="Borne de recharge IRVE", icon="plug", img=None,
  title="Bornes de recharge IRVE", city="Martignat",
  short="Bornes de recharge pour véhicules électriques jusqu'à 22 kW.",
  h1="Bornes de recharge <em>IRVE</em>",
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
        items.append(f'<figure class="shot reveal"><a href="{src}" data-lightbox><img src="{src}" alt="{alt}" loading="lazy"></a>{figcap}</figure>')
    return '<div class="gallery">' + "".join(items) + "</div>"


PARTENAIRES = ["img/p1.webp", "img/p2.webp", "img/p3.webp", "img/p4.webp"]

# ------------------------------------------------------------------ gabarit
def head(title, desc, canonical):
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
<meta name="theme-color" content="#2a5cb3">
<link rel="icon" href="img/logo.webp">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:ital,wght@0,600;0,700;1,700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/style.css">
{SCHEMA}
</head>
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
    phones = "".join(f'<a href="tel:{t}">{icon("phone").replace("<svg", "<svg width=14 height=14 style=vertical-align:-2px")} {n} · {d}</a>'
                     for n, d, t in CONTACTS)
    return f"""<a class="sr-only" href="#contenu" style="position:absolute;left:-9999px">Aller au contenu</a>
<div class="topbar"><div class="container">
  <span>{HORAIRES} · Garantie décennale</span>
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
    n, d, t = CONTACTS[0]
    return f"""<section class="cta"><div class="container">
  <div><h2>Un projet ? Une panne ?</h2><p>Devis gratuit et réponse rapide. Appelez-nous ou écrivez-nous.</p></div>
  <div class="cta__btns">
    <a class="btn btn--blue" href="tel:{t}">{icon("phone")} {d}</a>
    <a class="btn btn--ghost" href="contact.html">Demander un devis</a>
  </div>
</div></section>
"""


def footer():
    svc = "".join(f'<li><a href="{s["slug"]}.html">{s["menu"]}</a></li>' for s in SERVICES)
    ppl = "".join(f'<li>{n} : <a href="tel:{t}">{d}</a></li>' for n, d, t in CONTACTS)
    return f"""</main>
<footer class="footer"><div class="container">
  <div class="footer__grid">
    <div>
      <a class="footer__logo" href="index.html"><img src="img/logo.webp" alt="{NOM}" width="600" height="346" loading="lazy"></a>
      <p>Société d'électricité à Martignat. Électricité générale, tertiaire et industrielle pour les particuliers et les professionnels de l'Ain.</p>
      <div class="footer__social">
        <a href="{FACEBOOK}" target="_blank" rel="noopener" aria-label="Facebook">{icon("fb")}</a>
        <a href="{INSTAGRAM}" target="_blank" rel="noopener" aria-label="Instagram">{icon("ig")}</a>
      </div>
    </div>
    <div><h4>Nos services</h4><ul>{svc}</ul></div>
    <div><h4>Contact</h4><ul>
      {ppl}
      <li><a href="{GMAPS}" target="_blank" rel="noopener">{ADRESSE}<br>{VILLE}</a></li>
      <li>{HORAIRES}</li>
    </ul></div>
  </div>
  <div class="footer__bottom"><span>© {NOM}. Tous droits réservés.</span><span>Travaux couverts par la garantie décennale</span></div>
</div></footer>
<div class="callbar">
  {"".join(f'<a class="btn btn--{c}" href="tel:{t}">{icon("phone")} {n.split()[-1]}</a>' for (n, d, t), c in zip(CONTACTS, ["yellow", "blue"]))}
</div>
<script src="assets/main.js" defer></script>
</body>
</html>
"""


def service_cards(exclude=None):
    out = []
    for s in SERVICES:
        if s["slug"] == exclude:
            continue
        out.append(f"""<a class="card reveal" href="{s["slug"]}.html">
  <span class="card__icon">{icon(s["icon"])}</span>
  <h3>{s["title"]}</h3><p>{s["short"]}</p>
  <span class="card__more">En savoir plus {icon("arrow")}</span>
</a>""")
    return "\n".join(out)


def perks():
    data = [("award", "Garantie décennale", "Tous nos travaux sont couverts."),
            ("users", "Deux associés", "Des interlocuteurs directs, sur chaque chantier."),
            ("clock", "6 jours sur 7", "Du lundi au samedi, de 8 h à 19 h."),
            ("check", "Devis gratuit", "Un prix clair, adapté à votre budget.")]
    return '<div class="perks reveal">' + "".join(
        f'<div class="perk">{icon(i)}<strong>{t}</strong><span>{d}</span></div>' for i, t, d in data) + "</div>"


# ------------------------------------------------------------------ pages
def page_index():
    team = "".join(f"""<div class="person"><span class="person__avatar">{n.split()[-1][0]}</span>
<div><b>{n}</b><span>Associé · </span><a href="tel:{t}">{d}</a></div></div>""" for n, d, t in CONTACTS)
    brands = "".join(f'<img src="{p}" alt="Marque partenaire" loading="lazy" width="300" height="134">' for p in PARTENAIRES)
    zones = "".join(f"<li>{z}</li>" for z in ZONES)
    return head(f"Électricien à Martignat (01) | {NOM}",
                "Les Électrici'Ain, société d'électricité à Martignat : électricité générale, domotique, chauffage, VMC, alarme, bornes IRVE. Particuliers et pros dans l'Ain. Devis gratuit.",
                "") + header("index") + f"""
<section class="hero">
  <div class="hero__bg"><img src="img/depannage.webp" alt="" fetchpriority="high"></div>
  <div class="container">
    <span class="eyebrow">Électriciens à Martignat · Ain</span>
    <h1>Votre électricité, <em>entre de bonnes mains</em></h1>
    <p class="lead">Installation, rénovation et dépannage électrique pour les particuliers et les professionnels de l'Ain. Des installations sûres, performantes et garanties dix ans.</p>
    <div class="hero__ctas">
      <a class="btn btn--yellow" href="contact.html">Demander un devis gratuit</a>
      <a class="btn btn--ghost" href="tel:{CONTACTS[0][2]}">{icon("phone")} {CONTACTS[0][1]}</a>
    </div>
    <div class="hero__badges">
      <div>{icon("award")} Garantie décennale</div>
      <div>{icon("clock")} Lun. au sam., 8 h à 19 h</div>
      <div>{icon("pin")} Martignat, Oyonnax, Bourg-en-Bresse</div>
    </div>
  </div>
</section>

<section class="section"><div class="container">
  <span class="eyebrow">Nos services</span>
  <h2>Tous vos travaux d'électricité</h2>
  <p class="lead">Résidentiel, tertiaire ou industriel : en neuf comme en rénovation, nous vous proposons des solutions adaptées à votre budget et aux besoins de votre bâtiment.</p>
  <div class="services">{service_cards()}</div>
</div></section>

{teaser()}
<section class="section section--alt" id="entreprise"><div class="container">
  <div class="split">
    <div class="reveal">
      <span class="eyebrow">L'entreprise</span>
      <h2>Deux associés passionnés</h2>
      <p>Les Électrici'Ain est une société d'électricité implantée à Martignat. Fondée par deux associés passionnés, elle intervient auprès des particuliers et des professionnels dans tout l'Ain.</p>
      <p>Quelle que soit l'ampleur de votre projet, nos électriciens qualifiés, formés aux dernières technologies et aux normes de sécurité les plus strictes, vous garantissent un travail soigné, conforme et respectueux des délais.</p>
      <div class="team">{team}</div>
    </div>
    <div class="split__img reveal"><img src="img/tertiaire.jpg" alt="Électricien des Électrici'Ain au travail sur une installation" loading="lazy"></div>
  </div>
</div></section>

<section class="section"><div class="container">
  <span class="eyebrow">Pourquoi nous choisir</span>
  <h2>Un travail fiable, garanti</h2>
  <p class="lead" style="margin-bottom:36px">Tous nos travaux sont couverts par la garantie décennale, gage de la fiabilité et de la durabilité de nos installations.</p>
  {perks()}
</div></section>

<section class="section section--alt"><div class="container">
  <div class="split split--top">
    <div class="reveal">
      <span class="eyebrow">Zone d'intervention</span>
      <h2>Partout dans l'Ain</h2>
      <p>Basés à Martignat, nous intervenons dans le Haut-Bugey, la région d'Oyonnax et jusqu'à Bourg-en-Bresse.</p>
      <ul class="zones">{zones}</ul>
    </div>
    <div class="reveal">
      <span class="eyebrow">Nos marques partenaires</span>
      <p>Nous posons du matériel de marques reconnues pour des installations durables.</p>
      <div class="brands">{brands}</div>
    </div>
  </div>
</div></section>
""" + cta() + footer()


def teaser():
    photos = realisations()
    if not photos:
        return ""
    more = f'<a class="btn btn--blue" href="realisations.html">Voir toutes nos réalisations ({len(photos)})</a>' if len(photos) > 6 else ""
    return f"""<section class="section" style="padding-top:0"><div class="container">
  <span class="eyebrow">Nos réalisations</span>
  <h2>Nos derniers chantiers</h2>
  {gallery(photos[:6])}
  <div style="margin-top:32px;display:flex;gap:12px;flex-wrap:wrap">{more}
    <a class="btn btn--ghost" style="color:var(--ink)" href="{INSTAGRAM}" target="_blank" rel="noopener">{icon("ig")} Suivez-nous sur Instagram</a></div>
</div></section>"""


def page_realisations():
    photos = realisations()
    body = gallery(photos) if photos else '<p class="lead">Les photos de nos chantiers arrivent bientôt. En attendant, retrouvez nos réalisations sur Instagram.</p>'
    return head(f"Nos réalisations | {NOM}",
                "Découvrez les chantiers des Électrici'Ain : installations électriques, tableaux, domotique, bornes de recharge et motorisations dans l'Ain.",
                "realisations") + header("realisations") + f"""
<section class="page-hero"><div class="container">
  <nav class="crumbs" aria-label="Fil d'Ariane"><a href="index.html">Accueil</a> / Réalisations</nav>
  <span class="eyebrow">Nos chantiers</span>
  <h1>Nos <em>réalisations</em></h1>
  <p class="lead">Un aperçu de nos installations chez les particuliers et les professionnels de l'Ain.</p>
</div></section>
<section class="section"><div class="container">
  {body}
  <div style="margin-top:36px"><a class="btn btn--blue" href="{INSTAGRAM}" target="_blank" rel="noopener">{icon("ig")} Plus de photos sur Instagram</a></div>
</div></section>
""" + cta() + footer()


def page_service(s):
    img_block = (f'<div class="split__img reveal"><img src="{s["img"]}" alt="{s["title"]} par {NOM}" loading="lazy"></div>'
                 if s["img"] else
                 f"""<div class="reveal" style="background:var(--blue-soft);border-radius:var(--radius);padding:40px;display:grid;place-items:center;min-height:300px;color:var(--blue)">
<div style="text-align:center"><div style="width:96px;height:96px;margin:0 auto 18px;background:var(--yellow);color:var(--ink);border-radius:24px;display:grid;place-items:center">{icon(s["icon"]).replace("<svg", "<svg width=52 height=52")}</div>
<h3 style="margin:0">{s["title"]}</h3><p style="margin:6px 0 0;color:var(--ink-2)">Devis gratuit · Garantie décennale</p></div></div>""")
    items = "".join(f"<li>{i}</li>" for i in s["items"])
    intro = "".join(f"<p>{p}</p>" for p in s["intro"])
    extra = "".join(f"<p>{p}</p>" for p in s["extra"])
    return head(f"{s['title']} à {s['city'].split(' et ')[0]} (01) | {NOM}",
                f"{s['short']} {NOM}, électriciens à Martignat, interviennent dans l'Ain. Devis gratuit.",
                s["slug"]) + header(s["slug"]) + f"""
<section class="page-hero"><div class="container">
  <nav class="crumbs" aria-label="Fil d'Ariane"><a href="index.html">Accueil</a> / {s["title"]}</nav>
  <span class="eyebrow">{s["city"]} · Ain</span>
  <h1>{s["h1"]}</h1>
  <p class="lead">{s["lead"]}</p>
  <div class="hero__ctas" style="margin-top:28px">
    <a class="btn btn--yellow" href="contact.html">Demander un devis</a>
    <a class="btn btn--ghost" href="tel:{CONTACTS[0][2]}">{icon("phone")} {CONTACTS[0][1]}</a>
  </div>
</div></section>

<section class="section"><div class="container">
  <div class="split">
    <div class="reveal">
      <span class="eyebrow">{s["title"]}</span>
      <h2>{s["intro_h"]}</h2>
      {intro}
    </div>
    {img_block}
  </div>
</div></section>

<section class="section section--alt"><div class="container">
  <div class="split split--top">
    <div class="reveal">
      <h2>{s["list_h"]}</h2>
      <ul class="checks">{items}</ul>
    </div>
    <div class="reveal">
      <h2>{s["extra_h"]}</h2>
      {extra}
      <a class="btn btn--blue" href="contact.html" style="margin-top:8px">Nous contacter</a>
    </div>
  </div>
</div></section>

<section class="section"><div class="container">
  {perks()}
</div></section>

<section class="section section--alt"><div class="container">
  <span class="eyebrow">Nos autres services</span>
  <h2>Nous faisons aussi</h2>
  <div class="services">{service_cards(exclude=s["slug"])}</div>
</div></section>
""" + cta() + footer()


def page_contact():
    opts = "".join(f"<option>{s['title']}</option>" for s in SERVICES) + "<option>Dépannage</option><option>Autre</option>"
    ppl = "".join(f'<a href="tel:{t}">{n} · {d}</a><br>' for n, d, t in CONTACTS)
    return head(f"Contact et devis gratuit | {NOM}",
                "Contactez Les Électrici'Ain à Martignat pour un devis gratuit : 06 46 24 50 05 ou 06 25 62 59 87. Du lundi au samedi, de 8 h à 19 h.",
                "contact") + header("contact") + f"""
<section class="page-hero"><div class="container">
  <nav class="crumbs" aria-label="Fil d'Ariane"><a href="index.html">Accueil</a> / Contact</nav>
  <span class="eyebrow">Devis gratuit</span>
  <h1>Parlons de <em>votre projet</em></h1>
  <p class="lead">Laissez-nous votre demande ou appelez-nous directement : nous vous répondons dans les plus brefs délais.</p>
</div></section>

<section class="section"><div class="container contact-grid">
  <div class="reveal">
    <h2>Nos coordonnées</h2>
    <ul class="info-list" style="margin-top:24px">
      <li><span class="ico">{icon("phone")}</span><div><b>Téléphone</b>{ppl}</div></li>
      <li><span class="ico">{icon("pin")}</span><div><b>Adresse</b><a href="{GMAPS}" target="_blank" rel="noopener">{ADRESSE}<br>{VILLE}</a></div></li>
      <li><span class="ico">{icon("clock")}</span><div><b>Horaires</b>{HORAIRES}</div></li>
      <li><span class="ico">{icon("award")}</span><div><b>Garantie</b>Tous nos travaux sont couverts par la garantie décennale.</div></li>
    </ul>
  </div>
  <form class="form reveal" action="" method="post" data-email="{EMAIL}">
    <h2 style="font-size:2rem">Demande de devis</h2>
    <div class="form__row">
      <div class="field"><label for="nom">Nom et prénom *</label><input id="nom" name="nom" required autocomplete="name"></div>
      <div class="field"><label for="tel">Téléphone *</label><input id="tel" name="tel" type="tel" required autocomplete="tel"></div>
    </div>
    <div class="form__row">
      <div class="field"><label for="email">E-mail</label><input id="email" name="email" type="email" autocomplete="email"></div>
      <div class="field"><label for="ville">Commune</label><input id="ville" name="ville" autocomplete="address-level2"></div>
    </div>
    <div class="field"><label for="service">Prestation</label><select id="service" name="service">{opts}</select></div>
    <div class="field"><label for="message">Votre demande *</label><textarea id="message" name="message" required placeholder="Décrivez votre projet ou votre panne…"></textarea></div>
    <button class="btn btn--yellow" type="submit" style="width:100%">Envoyer ma demande</button>
    <p class="form__note" hidden style="margin:14px 0 0;padding:12px 14px;background:var(--yellow-soft);border-radius:10px;color:var(--ink)">L'envoi en ligne n'est pas encore activé. Appelez-nous au <a href="tel:{CONTACTS[0][2]}">{CONTACTS[0][1]}</a> ou au <a href="tel:{CONTACTS[1][2]}">{CONTACTS[1][1]}</a>.</p>
    <small>* Champs obligatoires. Vos informations servent uniquement à répondre à votre demande.</small>
  </form>
</div></section>

<section class="section section--alt" style="padding-top:0;background:none"><div class="container">
  <iframe class="map" title="Plan d'accès : {ADRESSE}, {VILLE}" loading="lazy"
    src="https://www.openstreetmap.org/export/embed.html?bbox=5.5889%2C46.1980%2C5.6289%2C46.2180&amp;layer=mapnik&amp;marker=46.207962%2C5.6088978"></iframe>
</div></section>
""" + footer()


def main():
    pages = {"index.html": page_index(), "contact.html": page_contact(), "realisations.html": page_realisations()}
    for s in SERVICES:
        pages[s["slug"] + ".html"] = page_service(s)
    for name, html in pages.items():
        (ROOT / name).write_text(html, encoding="utf-8")
        print("écrit", name)


if __name__ == "__main__":
    main()

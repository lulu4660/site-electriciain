# -*- coding: utf-8 -*-
"""Emballe le dossier electriciain/ dans un Worker Cloudflare autonome (dist/worker.js).

Les fichiers sont intégrés au script : un seul envoi, sans l'étape d'envoi
séparé des « assets ». Lancer depuis la racine du dépôt :
    python _source/build.py && python _source/worker_bundle.py && wrangler deploy
"""
import base64, json, mimetypes
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "electriciain"
OUT = ROOT / "dist" / "worker.js"
TYPES = {".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
         ".js": "text/javascript; charset=utf-8", ".webp": "image/webp", ".jpg": "image/jpeg",
         ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".avif": "image/avif"}

files = {}
for f in sorted(SITE.rglob("*")):
    if f.is_file() and not f.name.startswith(("_", ".")):
        rel = "/" + f.relative_to(SITE).as_posix()
        t = TYPES.get(f.suffix.lower()) or mimetypes.guess_type(f.name)[0] or "application/octet-stream"
        files[rel] = [t, base64.b64encode(f.read_bytes()).decode()]

OUT.parent.mkdir(exist_ok=True)
OUT.write_text("""const FILES = %s;
const bin = {};
function body(p) {
  if (!bin[p]) { const s = atob(FILES[p][1]); const u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); bin[p] = u; }
  return bin[p];
}
const SEC = { "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin", "X-Frame-Options": "SAMEORIGIN" };
export default {
  fetch(req) {
    let p = decodeURIComponent(new URL(req.url).pathname);
    if (p.endsWith("/")) p += "index.html";
    if (!FILES[p] && FILES[p + ".html"]) p += ".html";
    const found = !!FILES[p];
    if (!found) p = "/404.html";
    const cache = p.startsWith("/img/") ? "public, max-age=2592000" : p.startsWith("/assets/") ? "public, max-age=86400" : "public, max-age=300";
    return new Response(req.method === "HEAD" ? null : body(p), { status: found ? 200 : 404, headers: { "Content-Type": FILES[p][0], "Cache-Control": cache, ...SEC } });
  }
};
""" % json.dumps(files), encoding="utf-8")
print(f"{len(files)} fichiers -> {OUT} ({OUT.stat().st_size // 1024} Ko)")

#!/usr/bin/env python3
"""Import a temporary Fish Audio MP3 from a GitHub Actions secret URL, never from git.
Accept only the project Render service trusted download endpoint.
The GH workflow should not log URL or print response bodies.
"""
import os,sys,urllib.parse,urllib.request
from pathlib import Path
u=os.environ.get('UNCLE_FISH_AUDIO_URL','').strip()
if not u:raise SystemExit('UNCLE_FISH_AUDIO_URL secret is required; cannot claim Fish-voiced preview')
p=urllib.parse.urlparse(u)
if p.scheme!='https' or p.hostname!='uncle-seo-mcp.onrender.com' or not p.path.startswith('/downloads/audio/') or not p.path.endswith('.mp3') or p.username or p.password:
    raise SystemExit('Refused: Fish download URL is not from the trusted service')
if len(sys.argv)!=2:raise SystemExit('Usage: python scripts/fetch_secure_fish.py <output_path>')
req=urllib.request.Request(u,headers={'User-Agent':'UncleExplainer-CI/1.0'})
with urllib.request.urlopen(req,timeout=60) as r:
    if r.url.split('/')[2] != 'uncle-seo-mcp.onrender.com':raise SystemExit('Disallowed redirect destination')
    data=r.read(5_000_000)
if not (20_000<len(data)<5_000_000):raise SystemExit('MP3 response size invalid or expired')
d=Path(sys.argv[1]);d.parent.mkdir(parents=True,exist_ok=True);d.write_bytes(data)
print('Fish master imported to RUNNER_TEMP ('+str(len(data))+' bytes); not committed or uploaded')

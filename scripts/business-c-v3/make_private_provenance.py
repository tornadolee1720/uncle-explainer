#!/usr/bin/env python3
"""Operator-side integrity manifest for ten PRIVATE Fish Audio sentence files.

This verifies bytes, NOT the provider identity. Do not commit audio/manifest.
"""
import argparse,hashlib,json
from pathlib import Path
p=argparse.ArgumentParser()
p.add_argument('voice_dir',type=Path)
p.add_argument('output',type=Path)
a=p.parse_args()
ids=[f'b{i:02}' for i in range(1,11)];items={}
for k in ids:
 f=next((a.voice_dir/(k+ext) for ext in ['.mp3','.wav','.m4a'] if (a.voice_dir/(k+ext)).is_file()),None)
 if not f:raise SystemExit('Missing physical Fish sentence: '+k)
 items[k]=f
doc={'voice_key':'taiwan_ad_male','scope':'internal','line_ids':ids,
 'source_assertion':'Operator states these are approved Fish Audio project-voice outputs',
 'sha256':{k:hashlib.sha256(f.read_bytes()).hexdigest() for k,f in items.items()},
 'publish_allowed':False,
 'note':'File hashes verify integrity, not provider signature or linguistic correctness'}
a.output.parent.mkdir(parents=True,exist_ok=True)
a.output.write_text(json.dumps(doc,ensure_ascii=False,indent=2),encoding='utf8')
print('Fish sentence file manifest produced locally. Keep MP3 and manifest private.')

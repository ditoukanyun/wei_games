"""Reject misleading successful Cocos builds with missing scenes/scripts."""
from pathlib import Path
import json,sys
root=Path(sys.argv[1] if len(sys.argv)>1 else 'build/web-mobile')
config=json.loads((root/'assets/main/config.json').read_text())
expected={f'db://assets/scene/{name}.scene' for name in ['loading','home','game']}
assert expected <= set(config.get('scenes',{})), 'Release is missing required scenes'
script=(root/'assets/main/index.js').read_text()
assert len(script)>50000, 'Release contains module stubs instead of game scripts'
for term in ['loadingView','gameView','daojuNum','GameOverAni','shengliPopTs']:
 assert term in script, f'Missing script: {term}'
print('Release verified: loading/home/game scenes and complete gameplay scripts')

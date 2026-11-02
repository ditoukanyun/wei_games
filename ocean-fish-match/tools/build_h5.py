"""Build with the verified Creator installation, then reject incomplete outputs."""
from pathlib import Path
import os,subprocess,sys
root=Path(__file__).resolve().parents[1]
creator=Path(os.environ.get('COCOS_CREATOR_BIN','/Users/wei/Applications/CocosCreator-Verified.app/Contents/MacOS/CocosCreator'))
if not creator.exists():raise SystemExit('Set COCOS_CREATOR_BIN to a working Cocos Creator 3.8.8 executable')
log=root/'evidence/latest-cocos-build.log'
with log.open('w') as f:
 result=subprocess.run([str(creator),'--project',str(root),'--build','platform=web-mobile;debug=false;startScene=1042344d-c20d-4927-91cc-4f6eec3da4f6'],cwd=root,stdout=f,stderr=subprocess.STDOUT)
# Creator may return 36 after a successful command build; validate actual artifacts.
text=log.read_text(errors='replace')
if 'Finished' not in text or 'missing or invalid' in text or '初始场景不存在' in text:
 raise SystemExit(f'Build rejected; inspect {log}')
subprocess.run([sys.executable,str(root/'tools/verify_h5_release.py'),str(root/'build/web-mobile')],check=True)

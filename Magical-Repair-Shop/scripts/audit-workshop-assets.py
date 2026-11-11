"""Read-only inventory of serialized sprite references; not a visual replacement verifier."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
uuids={}
for meta in (root/'assets').rglob('*.meta'):
 try:d=json.loads(meta.read_text())
 except (ValueError,OSError):continue
 path=str(meta.relative_to(root))[:-5]
 if d.get('uuid'):uuids[d['uuid']]=path
 for sid,sub in d.get('subMetas',{}).items():
  if sub.get('uuid'):uuids[sub['uuid']]=path+'@'+sid
rows=[]
files=list((root/'assets/scenes').glob('*.scene'))+list((root/'assets/Bundles/bundle/Preload/Prefabs').glob('*.prefab'))
for file in files:
 try:data=json.loads(file.read_text())
 except (ValueError,OSError):continue
 if not isinstance(data,list):continue
 for item in data:
  if item.get('__type__')!='cc.Sprite':continue
  ref=item.get('_spriteFrame') or {};uuid=ref.get('__uuid__','')
  node=data[item['node']['__id__']];names=[];cursor=node;active=True
  for _ in range(30):
   names.append(cursor.get('_name','<instance>'));active=active and cursor.get('_active',True)
   parent=cursor.get('_parent');
   if not parent:break
   cursor=data[parent['__id__']]
  rows.append({'file':str(file.relative_to(root)),'node':'/'.join(reversed(names)),'enabled':item.get('_enabled',True),'activeHierarchy':active,'texture':uuids.get(uuid,uuids.get(uuid.split('@')[0],uuid))})
out=root/'output/design/serialized-sprite-inventory.json';out.write_text(json.dumps(rows,ensure_ascii=False,indent=2))
print('Inventoried',len(rows),'sprites across',len(files),'files; output',out)
for row in rows:
 if '/scenes/' in row['file'] and row['enabled'] and row['activeHierarchy']:print(row['node'],'=>',row['texture'])

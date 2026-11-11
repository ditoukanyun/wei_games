"""Replace known UI sprite references, preserving nodes/events/physics and backing up files."""
import json,shutil
from pathlib import Path
root=Path(__file__).resolve().parents[1]
old=json.loads((root/'assets/resources/images/p_imgs.plist.meta').read_text())
new=json.loads((root/'assets/resources/workshop/ui-kit.plist.meta').read_text())
frames={x['name']:x['uuid'] for x in new['subMetas'].values()}
names={
 'add_hole_logo':'add-hole','refresh_pin':'shuffle','clear_logo':'collect','bucket_img':'collect',
 'bs':'coin','bs_1':'coin','bs_bg':'ivory-panel','bs_coins_bg':'ivory-button',
 'btn_base':'teal-button','btn_bg_2':'teal-button','btn_blue':'teal-button','btn_green':'teal-button','btn_yellow':'teal-button',
 'btn_close':'close','setting':'settings','sound':'sound','main_btn_bg':'teal-button',
 'green_bg_small':'teal-button','box_3':'ivory-panel','box_4':'ivory-panel',
 'level_bg':'ivory-button','loadbg':'ivory-button','loadfill':'teal-button','panel_bg':'ivory-panel',
 'empty_hole':'hole','empty_holering':'hole','hole':'hole','hole_bg':'hole','hole_ring':'hole','holering':'hole','target':'hole'}
mapping={v['uuid']:frames[names[v['name']]] for v in old['subMetas'].values() if v.get('name') in names}
report=[]
for p in (root/'assets').rglob('*'):
 if p.suffix not in ['.scene','.prefab']:continue
 data=json.loads(p.read_text());count=0
 for item in data:
  if item.get('__type__')!='cc.Sprite':continue
  ref=item.get('_spriteFrame') or {};uuid=ref.get('__uuid__')
  if uuid not in mapping:continue
  ref['__uuid__']=mapping[uuid];item['_sizeMode']=0;count+=1
 if not count:continue
 backup=root/'.optimization-backup/workshop/serialized-ui'/p.relative_to(root);backup.parent.mkdir(parents=True,exist_ok=True)
 if not backup.exists():shutil.copy2(p,backup)
 p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');report.append({'file':str(p.relative_to(root)),'replacedSprites':count})
(root/'output/design/serialized-ui-replacements.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print('Replaced',sum(x['replacedSprites'] for x in report),'UI sprites in',len(report),'files')

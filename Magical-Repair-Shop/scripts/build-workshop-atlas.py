"""Describe existing UI bitmap cells as a native Cocos atlas; no pixel conversion."""
import plistlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
names=['teal-button','ivory-button','ivory-panel','repair-ticket','teal-screw','coral-screw','brass-screw','hole','settings','back','close','sound','shuffle','add-hole','collect','coin']
frames={}
for i,name in enumerate(names):
 x=round((i%4)*313.5);y=round((i//4)*313.5)
 w=round(((i%4)+1)*313.5)-x;h=round(((i//4)+1)*313.5)-y
 if i<2:y=97;h=154
 frames[name+'.png']={'aliases':[],'spriteOffset':'{0,0}','spriteSize':f'{{{w},{h}}}','spriteSourceSize':f'{{{w},{h}}}','textureRect':f'{{{{{x},{y}}},{{{w},{h}}}}}','textureRotated':False}
doc={'frames':frames,'metadata':{'format':3,'pixelFormat':'RGBA8888','premultiplyAlpha':False,'realTextureFileName':'ui-kit.png','textureFileName':'ui-kit.png','size':'{1254,1254}'}}
out=root/'assets/resources/workshop/ui-kit.plist';out.write_bytes(plistlib.dumps(doc,sort_keys=False));print(out)

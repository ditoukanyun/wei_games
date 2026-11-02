from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageColor
import json,shutil,plistlib,re,math
R=Path(__file__).resolve().parents[1];A=R/'assets';S=R/'art/source';B=R/'art/threepage-originals'
logo_src=Path('/Users/wei/.codex/generated_images/01a1917f-abb2-7ef3-941f-92385f350567/exec-dde6d323-39a5-49e5-b11c-b36e45ac7f89.png')
shutil.copy2(logo_src,S/'aquarium-wordmark.png')
logo=Image.open(S/'aquarium-wordmark.png').convert('RGBA');box=logo.getchannel('A').point(lambda x:255 if x>25 else 0).getbbox();logo=logo.crop(box)
def fit(im,sz):
 im=im.copy();im.thumbnail(sz,Image.Resampling.LANCZOS);o=Image.new('RGBA',sz);o.alpha_composite(im,((sz[0]-im.width)//2,(sz[1]-im.height)//2));return o
def label(im,t,size=24,color='#235c70'):
 d=ImageDraw.Draw(im);f=ImageFont.truetype('/System/Library/Fonts/STHeiti Medium.ttc',size);bb=d.textbbox((0,0),t,font=f);d.text(((im.width-bb[2]+bb[0])/2,(im.height-bb[3]+bb[1])/2-bb[1]),t,font=f,fill=color);return im
def pill(sz,fill='#eafff7'):
 im=Image.new('RGBA',sz);d=ImageDraw.Draw(im);d.rounded_rectangle((1,1,sz[0]-2,sz[1]-2),radius=sz[1]/2-1,fill=fill,outline='#f9fffc',width=2);return im
def glossy(sz,fill):
 # Draw a new, subtle pearlescent surface with a soft upper reflection.
 w,h=sz;scale=2;im=Image.new('RGBA',(w*scale,h*scale));mask=Image.new('L',im.size);md=ImageDraw.Draw(mask)
 md.rounded_rectangle((2,2,w*scale-3,h*scale-5),radius=min(h*.46,w*.22)*scale,fill=255)
 rgb=ImageColor.getrgb(fill);d=ImageDraw.Draw(im)
 for y in range(h*scale):
  t=y/max(1,h*scale-1);lift=.34*(1-t)**2
  c=tuple(int(v+(255-v)*lift) for v in rgb)
  d.line((0,y,w*scale,y),fill=c+(255,))
 im.putalpha(mask);d=ImageDraw.Draw(im)
 r=min(h*.46,w*.22)*scale
 d.rounded_rectangle((3,3,w*scale-4,h*scale-6),radius=r,outline='#f3fffd',width=3)
 d.arc((12,10,w*scale-13,h*scale-20),192,340,fill='#ffffff80',width=3)
 reflection=Image.new('RGBA',im.size);rd=ImageDraw.Draw(reflection)
 rd.rounded_rectangle((18,10,w*scale-19,int(h*.48*scale)),radius=int(h*.22*scale),fill='#ffffff28')
 im=Image.alpha_composite(im,reflection)
 return im.resize(sz,Image.Resampling.LANCZOS)
def water(sz):
 im=Image.new('RGBA',sz);m=Image.new('L',sz);ImageDraw.Draw(m).rounded_rectangle((1,1,sz[0]-2,sz[1]-2),radius=sz[1]/2-1,fill=255);d=ImageDraw.Draw(im)
 for y in range(sz[1]):
  t=y/sz[1];d.line((0,y,sz[0],y),fill=(int(120-95*t),int(238-70*t),int(239-45*t),255))
 for x in range(10,sz[0],45):d.arc((x,3,x+65,sz[1]-3),190,340,fill='#e4ffffb0',width=2)
 im.putalpha(m);return im
rawbg=Image.open(S/'background.png').convert('RGBA').resize((720,1600),Image.Resampling.LANCZOS)
home=rawbg.copy();home.alpha_composite(fit(logo,(460,300)),(130,325))
for i,pos,sz in [(0,(100,660),(205,205)),(1,(275,630),(205,205)),(2,(445,690),(180,180)),(3,(115,835),(185,185)),(4,(275,810),(265,210))]:home.alpha_composite(fit(Image.open(S/f'character-{i}.png'),sz),pos)
home.save(A/'resources/Img/首页背景@2x.png')
loading=rawbg.copy();loading.alpha_composite(fit(Image.open(S/'character-4.png'),(420,420)),(150,640));loading.save(A/'res/loadingUI/加载页背景@2x.png')
fit(logo,(586,365)).save(A/'res/loadingUI/logo@2x.png')
water((492,37)).save(A/'res/loadingUI/分数进度@2x.png');pill((542,90),'#daefed').save(A/'res/loadingUI/分数进度背景@2x.png')
# Music sprites show current state; legacy names describe the action (开启 = currently muted).
def music_sprite(sz,muted):
 im=Image.new('RGBA',sz);im.alpha_composite(label(pill((104,104)),'♪',64),(6,10));d=ImageDraw.Draw(im)
 d.ellipse((84,10,106,32),fill='#99acb1' if muted else '#74c865',outline='#ffffff',width=3)
 if muted:d.line((31,86,83,34),fill='#6d8f99',width=6)
 return im
for p in [A/'resources/UI/关闭@2x.png',A/'resources/UI/开启@2x.png']:
 music_sprite((116,136),'开启' in p.name).save(p)
def replace_atlas(name,paint):
 p=A/'resources/UI'/f'{name}.plist';data=plistlib.loads(p.read_bytes());im=Image.open(p.with_suffix('.png')).convert('RGBA')
 for n,f in data['frames'].items():
  x,y,w,h=map(int,re.findall(r'\d+',f['frame']));new=paint(n,(w,h))
  if new is None:continue
  if f['rotated']:new=new.transpose(Image.Transpose.ROTATE_270)
  im.paste(new,(x,y))
 im.save(p.with_suffix('.png'))
def hu(n,sz):
 if 'gameStart' in n:return label(glossy(sz,'#269dab'),'开始游戏',48,'#ffffff')
 if 'paihang' in n:return label(glossy(sz,'#ac9bd8'),'排行榜',40,'#ffffff')
 if '礼包' in n:
  im=Image.new('RGBA',sz)
  im.alpha_composite(fit(Image.open(S/'character-5.png'),(110,94)),(3,0))
  im.alpha_composite(label(pill((116,38),'#fff6e3'),'已领取' if '冷却' in n else '每日礼物',23),(0,96))
  return im
 if '音乐' in n:
  return music_sprite(sz,'开启' in n)
replace_atlas('首页精灵图',hu)
for gift in ['礼包领取@2x.png','礼包冷却@2x.png']:
 p=A/'resources/UI'/gift;sz=Image.open(p).size
 im=Image.new('RGBA',sz);im.alpha_composite(fit(Image.open(S/'character-5.png'),(sz[0],94)),(0,0))
 im.alpha_composite(label(pill((sz[0],38),'#fff6e3'),'已领取' if '冷却' in gift else '每日礼物',23),(0,96));im.save(p)
label(glossy((330,96),'#279dab'),'领取礼物',36,'#ffffff').save(A/'resources/pop/每日福利/直接领取@2x.png')
glossy((330,96),'#e1f3ec').save(A/'resources/pop/每日福利/领取按钮背景@2x.png')
def gu(n,sz):
 if '顶部UI背景' in n:
  im=Image.new('RGBA',sz);ImageDraw.Draw(im).rounded_rectangle((2,2,sz[0]-3,sz[1]-3),radius=45,fill='#eafff7',outline='#ffffff',width=4);return im
 if '分数进度背景' in n:return pill(sz,'#a5d2d4')
 if '分数进度' in n:return water(sz)
 if '购买' in n:
  im=pill(sz);im.alpha_composite(fit(Image.open(S/'character-5.png'),(32,32)),(5,5));tx=label(Image.new('RGBA',(56,42)),'50',26);im.alpha_composite(tx,(36,0));return im
replace_atlas('游戏道具UI',gu)
for name in ['home','loading','game']:
 p=A/f'scene/{name}.scene';s=json.loads((B/f'scene/{name}.scene').read_text())
 if name=='home':
  s[64]['value'].update(x=535,y=950)
  idx=len(s);s.append({'__type__':'CCPropertyOverrideInfo','targetInfo':{'__id__':63},'propertyPath':['_lscale'],'value':{'__type__':'cc.Vec3','x':0.68,'y':0.68,'z':1}});s[61]['propertyOverrides'].append({'__id__':idx})
  s[82]['_bottom']-=38;s[70]['_lpos']['y']-=38
  # Keep the secondary ranking control evenly spaced below the primary action.
  s[76]['_lpos']['y']=-141.373
 if name=='loading':
  s[8]['_lpos']['y']=300
  lm=json.loads((A/'res/loadingUI/logo@2x.png.meta').read_text());s[10]['_spriteFrame']['__uuid__']=next(v['uuid'] for v in lm['subMetas'].values() if v['importer']=='sprite-frame')
  s[11]['_lpos']['y']=-340;s[15]['_contentSize'].update(width=520,height=52);s[16]['_sizeMode']=0
  s[12]['_lpos'].update(x=-246,y=0)
  s[18]['_lpos']['y']=-460;s[21]['_active']=False
 if name=='game':
  parentY=s[332]['_lpos']['y']+s[331]['_lpos']['y'];s[333]['_lpos']['y']=445-parentY
  s[430]['_contentSize'].update(width=712,height=150);s[432]['_sizeMode']=0
  for i in [8,27]:s[i]['_lpos']['y']=-20
  for i in [10,330]:s[i]['_top']=300
  s[401]['_lpos'].update(x=290,y=588-445);s[401]['_lscale'].update(x=.8,y=.8)
  s[334]['_lpos'].update(x=175,y=30);s[336]['_fontSize']=34;s[336]['_actualFontSize']=34
  s[344]['_lpos'].update(x=-235,y=30);s[349]['_enabled']=False;s[347]['_fontSize']=32;s[347]['_actualFontSize']=32
  s[337]['_lpos'].update(x=0,y=-35);s[350]['_active']=False
  s[438]['_lpos']['y']=350-parentY
  for i,x in [(359,-215),(373,0),(387,215)]:s[i]['_lpos'].update(x=x,y=-455-445)
  for i in [360,374,388]:s[i]['_lpos']['y']=-115
  for i in [363,377,391]:s[i]['_lpos'].update(x=0,y=-115)
  for i in [367,381,395]:s[i]['_contentSize'].update(width=120,height=42)
  for i in [368,382,396]:s[i]['_enabled']=False
  for i in [364,378,392]:s[i]['_lpos'].update(x=0,y=0)
  for o in s:
   if o.get('_name')=='toolCaption':
    o['_lpos']['y']=-72
    lab=s[o['_components'][1]['__id__']];lab['_enableOutline']=True;lab['_outlineWidth']=3;lab['_outlineColor']={'__type__':'cc.Color','r':241,'g':255,'b':248,'a':255}
 p.write_text(json.dumps(s,ensure_ascii=False,indent=2)+'\n')
print('Applied approved three-page design')

# The old music sprite used a tall 116x136 box; enforce square render bounds.
for rel in ['bundles/Prefabs/UI/musicSetting.prefab','bundles/Prefabs/UI/qiandaoPop.prefab']:
 backup=B/rel;backup.parent.mkdir(parents=True,exist_ok=True)
 if not backup.exists():shutil.copy2(A/rel,backup)
 data=json.loads(backup.read_text())
 if 'musicSetting' in rel:
  for i in [3,9]:data[i]['_contentSize'].update(width=104,height=104)
  for i in [5,11]:data[i]['_sizeMode']=0
  data[14]['_contentSize'].update(width=116,height=116)
 else:
  for i in [21,42]:data[i]['_contentSize'].update(width=330,height=96)
  for i in [23,44]:data[i]['_sizeMode']=0;data[i]['_type']=0
  data[20]['_lpos'].update(x=0,y=-252);data[29]['_lpos'].update(x=0,y=-140)
  data[30]['_lpos'].update(x=-100,y=0);data[36]['_lpos'].update(x=24,y=0)
  data[39]['_fontSize']=36;data[39]['_actualFontSize']=36;data[39]['_verticalAlign']=1
 (A/rel).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')

# Equal capsule actions replace the old square resume buttons.
label(glossy((220,82),'#279dab'),'继续游戏',30,'#ffffff').save(A/'resources/pop/是否继续/是@2x.png')
label(glossy((220,82),'#f1c8c1'),'重新开始',30,'#804f50').save(A/'resources/pop/是否继续/否@2x.png')
rel='bundles/Prefabs/UI/isJixu.prefab';backup=B/rel;backup.parent.mkdir(parents=True,exist_ok=True)
if not backup.exists():shutil.copy2(A/rel,backup)
data=json.loads(backup.read_text())
for i in [12,21]:data[i]['_contentSize'].update(width=220,height=82)
for i in [14,23]:data[i]['_sizeMode']=0;data[i]['_type']=0
data[11]['_lpos'].update(x=125,y=-45);data[20]['_lpos'].update(x=-125,y=-45)
(A/rel).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')

# Compact combo feedback, sized for the HUD instead of covering the board.
for i,name,caption,width in [(0,'酷@2x.png','漂亮！',180),(1,'太棒了@2x.png','太棒了！',220),(2,'真是精彩@2x.png','真精彩！',240),(3,'根本停不下来@2x.png','海底大连消！',280)]:
 im=pill((width,60),'#174d60');d=ImageDraw.Draw(im)
 d.rounded_rectangle((3,3,width-4,56),radius=27,outline='#a7e2d6',width=2)
 label(im,caption,30,'#fff7dd').save(A/'resources/UI/评分'/name)
 rel=f'bundles/Prefabs/guliPop/{i}.prefab';backup=B/rel;backup.parent.mkdir(parents=True,exist_ok=True)
 if not backup.exists():shutil.copy2(A/rel,backup)
 data=json.loads(backup.read_text());data[2]['_contentSize'].update(width=width,height=60);data[4]['_sizeMode']=0
 (A/rel).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')

# Warm, more celebratory combo feedback without covering the central board.
for i,name,caption,width in [(0,'酷@2x.png','漂亮！',230),(1,'太棒了@2x.png','太棒了！',280),(2,'真是精彩@2x.png','真精彩！',300),(3,'根本停不下来@2x.png','海底大连消！',340)]:
 im=glossy((width,78),'#d77937')
 label(im,caption,40,'#fff9e6').save(A/'resources/UI/评分'/name)
 p=A/f'bundles/Prefabs/guliPop/{i}.prefab';data=json.loads(p.read_text());data[2]['_contentSize'].update(width=width,height=78);p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')

# Celebratory typography: oversized warm letters with a cream rim and teal depth.
for i,name,caption,width in [(0,'酷@2x.png','漂亮！',320),(1,'太棒了@2x.png','太棒了！',400),(2,'真是精彩@2x.png','真精彩！',400),(3,'根本停不下来@2x.png','海底大连消！',580)]:
 scale=2;height=140;im=Image.new('RGBA',(width*scale,height*scale));d=ImageDraw.Draw(im)
 font=ImageFont.truetype('/System/Library/Fonts/STHeiti Medium.ttc',76*scale)
 box=d.textbbox((0,0),caption,font=font);x=(width*scale-(box[2]-box[0]))/2-box[0];y=(height*scale-(box[3]-box[1]))/2-box[1]-5*scale
 d.text((x,y+6*scale),caption,font=font,fill='#15576a',stroke_width=11*scale,stroke_fill='#15576a')
 d.text((x,y),caption,font=font,fill='#f79a36',stroke_width=8*scale,stroke_fill='#fff8dc')
 d.text((x,y),caption,font=font,fill='#f38a2b',stroke_width=1*scale,stroke_fill='#f38a2b')
 for cx,cy,r in [(14,26,8),(width-14,96,7)]:
  points=[]
  for step in range(8):
   angle=-math.pi/2+step*math.pi/4;radius=r if step%2==0 else r*.35;points.append(((cx+math.cos(angle)*radius)*scale,(cy+math.sin(angle)*radius)*scale))
  d.polygon(points,fill='#ffe394')
 im.resize((width,height),Image.Resampling.LANCZOS).save(A/'resources/UI/评分'/name)
 p=A/f'bundles/Prefabs/guliPop/{i}.prefab';data=json.loads(p.read_text());data[2]['_contentSize'].update(width=width,height=height);p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')

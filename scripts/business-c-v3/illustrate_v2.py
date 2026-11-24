#!/usr/bin/env python3
"""Regenerate original illustrated V2 scenes (fictional characters + moving cash).
These are Pillow programmatic animations, not native-vpro scenes or actual people.
Run: python scripts/business-c-v3/illustrate_v2.py <workdir>
"""
import math,os,subprocess,sys
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFont
W,H,FPS=540,960,30
D=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else None
if not D:raise SystemExit('Provide work directory')
D.mkdir(parents=True,exist_ok=True)
font_path=next((x for x in [
 Path('fonts/NotoSansTC-Regular.ttf'),
 Path('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc')] if x.exists()),None)
if not font_path:raise SystemExit('Missing Noto TC font; use existing CI font setup')
fonts={}
def font(n):
 if n not in fonts:fonts[n]=ImageFont.truetype(str(font_path),n)
 return fonts[n]
def clamp(x):return max(0,min(1,x))
def ease(x):x=clamp(x);return 1-(1-x)**3
yy,xx=np.mgrid[0:H,0:W];y=yy/H;x=xx/W
g=np.maximum(0,1-np.sqrt(((x-.55)/.75)**2+((y-.42)/.8)**2))
BACKGROUND=Image.fromarray(np.stack([14+26*y+26*g,29+28*y+19*g,36+25*y+15*g],axis=-1).astype('uint8'),'RGB')
def rect(d,r,radius,color,edge=None,width=2):
 d.rounded_rectangle(tuple(map(round,r)),radius,fill=color,outline=edge,width=width)
def text(d,xy,t,n=25,c='#f9e9c8',anchor=None):
 d.text(xy,t,font=font(n),fill=c,anchor=anchor)
def base():
 im=BACKGROUND.copy();d=ImageDraw.Draw(im)
 for px in range(18,W,37):
  for py in range(20,H,37):d.ellipse((px,py,px+1,py+1),fill='#64837d')
 rect(d,(18,12,522,77),18,'#17383d','#5b7771',2)
 text(d,(35,26),'UNCLE / BUSINESS STORY',18)
 text(d,(35,57),'虛構案例 • 原創人物與金流示意',13,'#c0d4c8')
 return im,d
def person(d,cx,cy,role,t,gesture):
 skin='#e1be91' if role=='boss' else '#afcbb5';shirt='#356374' if role=='boss' else '#aa7959'
 bounce=2*math.sin(t*7)
 d.ellipse((cx-95,cy+218,cx+95,cy+242),fill='#142c35')
 d.polygon([(cx-89,cy+205),(cx-89,cy+100),(cx-56,cy+50),(cx+56,cy+50),(cx+89,cy+100),(cx+89,cy+205)],fill=shirt)
 d.polygon([(cx-25,cy+60),(cx,cy+100),(cx+25,cy+60)],fill='#fff4da')
 d.rectangle((cx-20,cy+29,cx+20,cy+72),fill=skin)
 d.ellipse((cx-61,cy-70+bounce,cx+61,cy+60+bounce),fill=skin)
 d.pieslice((cx-66,cy-77+bounce,cx+66,cy+6+bounce),180,349,fill='#1c2b30')
 if role=='boss':
  for dx in [-28,28]:rect(d,(cx+dx-20,cy-6+bounce,cx+dx+20,cy+18+bounce),7,None,'#233d44',4)
 else:
  for dx in [-24,24]:d.ellipse((cx+dx-3,cy+7+bounce,cx+dx+3,cy+13+bounce),fill='#1d3032')
  d.arc((cx-20,cy+23+bounce,cx+20,cy+45+bounce),180,355,fill='#3b4c44',width=3)
 d.line((cx-66,cy+104,cx-113,cy+160-50*gesture),fill=skin,width=20)
 d.line((cx+66,cy+104,cx+112,cy+148-50*gesture),fill=skin,width=20)
def bubble(d,x1,y1,x2,y2,a,b,tone='light'):
 bg='#f4ead8' if tone=='light' else '#c8dfd8'
 rect(d,(x1,y1,x2,y2),23,bg,'#c4a577' if tone=='light' else '#79a49d',4)
 d.polygon([(x2-60,y2-2),(x2-45,y2+29),(x2-89,y2-2)],fill=bg)
 text(d,(x1+18,y1+21),a,29,'#263a3b')
 text(d,(x1+18,y1+65),b,22,'#314b4d')
def intro(t):
 im,d=base();shift=17*math.sin(math.pi*min(t/7,1))
 d.polygon([(0,675),(0,485),(270+shift,389),(540,511),(540,742)],fill='#263e41')
 for i in range(4):
  xx=20+i*140-int(shift);yy=515+(i%2)*13
  d.rectangle((xx,yy,xx+112,yy+150),fill='#7d644a',outline='#a58b64',width=3)
  d.line((xx+55,yy,xx+55,yy+150),fill='#c3a476',width=3)
 k=ease(t/.65)
 person(d,round(-85+205*k),458,'boss',t,0.6 if t>4 else 0)
 person(d,round(620-195*k),458,'staff',t,0.6 if t>2.2 else 0)
 text(d,(270,123),'接到訂單，',42,'#f6e2be','ma')
 text(d,(270,188),'卻快付不出薪水？',35,'#ffffff','ma')
 if t<2.4:
  bubble(d,19,277,318,386,'老闆！一百萬','訂單進來了！')
  label='訂單面額 NT$ 100 萬'
 elif t<4.75:
  bubble(d,193,277,522,392,'可是員工的薪水','今天要怎麼付？','cool')
  label='有訂單 ≠ 有現金'
 else:
  bubble(d,140,270,494,387,'帳戶只剩 20 萬','前面還要先付 70 萬','cool')
  label='收款前缺口 50 萬'
 rect(d,(42,712,498,801),19,'#1a3639','#c7a678',3)
 text(d,(270,745),label,27,'#f7d39e','ma')
 rect(d,(24,842,516,918),17,'#152c31','#63736a')
 text(d,(270,861),'一百萬訂單，為什麼沒錢發薪？',23,'#ffffff','ma')
 return im
def cash(t):
 im,d=base()
 text(d,(270,139),'現金不是帳面數字',32,'#f7e6c7','ma')
 text(d,(270,195),'付款時間差，才是危機',25,'#d5e1d4','ma')
 rect(d,(33,244,507,366),23,'#284b4d','#b4c8b7',3)
 text(d,(53,256),'必須先付',23,'#d5ddd2')
 text(d,(484,266),'70 萬',40,'#f6caa0','ra')
 text(d,(55,323),'材料 45 萬＋薪資／廠房 25 萬',20,'#f3ead6')
 rect(d,(33,435,507,549),23,'#234a48','#8dae9a',3)
 text(d,(53,452),'目前可用現金',23,'#d0e4d9')
 text(d,(486,469),'20 萬',38,'#d3eec7','ra')
 for i in range(7):
  tt=(t-.15-i*.26)/1.6
  if 0<=tt<=1:
   v=ease(tt);cx=185+141*v+12*math.sin(v*math.pi+i);cy=503-200*v
   d.ellipse((cx-15,cy-15,cx+15,cy+15),fill='#e8be74',outline='#fae1b0',width=2)
   text(d,(cx,cy-10),'$',18,'#5b4a37','ma')
 d.line([(270,430),(270,392)],fill='#efc57e',width=7)
 d.polygon([(257,404),(283,404),(270,385)],fill='#efc57e')
 text(d,(270,581),'70 萬 − 20 萬',31,'#ede4d2','ma')
 p=ease((t-1.1)/1.3)
 rect(d,(41,637,499,784),26,'#543439','#f3a17c',4)
 text(d,(270,656),'收款前資金缺口',23,'#ffe0ce','ma')
 text(d,(270,704),f'{int(50*p)} 萬',53,'#ffa982','ma')
 text(d,(51,797),'流動性風險 ≠ 確定倒閉',20,'#d8dcd2')
 rect(d,(46,848,494,880),10,'#1c2b31')
 if p>.01:rect(d,(48,850,48+int(442*p),878),7,'#e59972')
 text(d,(270,899),'虛構情境示意｜非真實企業',17,'#a5bab1','ma')
 return im
def write(name,fn,N):
 dest=D/(name+'.mp4')
 args=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24',
   '-s',f'{W}x{H}','-r',str(FPS),'-i','pipe:0',
   '-vf','scale=720:1280:flags=lanczos,format=yuv420p','-an','-c:v','libx264',
   '-preset','veryfast','-crf','20','-r','30','-movflags','+faststart',str(dest)]
 proc=subprocess.Popen(args,stdin=subprocess.PIPE,stderr=subprocess.PIPE)
 for frame in range(N):proc.stdin.write(fn(frame/FPS).tobytes())
 proc.stdin.close()
 err=proc.stderr.read();ret=proc.wait()
 if ret:raise RuntimeError(name+' FFmpeg failure '+err.decode(errors='replace')[-1300:])
 print(name, str(dest),N)
write('intro_drama',intro,211)
write('cash_motion',cash,137)

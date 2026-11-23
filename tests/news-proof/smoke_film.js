window.ready=(async()=>{
 const F=await FB.init({counts:['assets/clips/counts.json'],fonts:KIT.FONTS,subMax:12});
 const K=await KIT.use(F);
 await KIT_VERT.use(K,{skin:'dark',brand:'NEWS ENGINE SMOKE'});
 KIT_UNCLE.preset('shop',{bg:'assets/kit/ph/city.jpg'});
 await K.film([
  {scene:'vp-ask',until:'@b02',says:'示範鏡頭：提出新聞問題，僅測程式渲染，不代表真實新聞截圖',bg:'assets/kit/ph/city.jpg',lines:['新聞證據','能抓到嗎？'],at:['@b01','@b01:數字']},
  {scene:'vp-number',says:'示範原版 vpro 數字元件，不宣稱這是官方新聞素材',bg:'assets/kit/ph/city.jpg',value:'115.8',unit:'B USD',label:'僅測元件渲染',at:'@b02'}
 ]);
 return K.go();
})();

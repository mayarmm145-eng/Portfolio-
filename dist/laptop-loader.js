// Keep the static laptop and all essential content visible during async loading.
(() => {
 const anchor=document.querySelector('.qa-laptop-anchor');
 const constrained=(navigator.deviceMemory && navigator.deviceMemory<=2)||navigator.connection?.saveData;
 if(constrained){anchor.dataset.modelState='fallback';return;}
 const load=()=>import('./hero3d.js').catch(()=>{anchor.dataset.modelState='fallback';window.qaInvestigation?.release();});
 requestAnimationFrame(()=>requestAnimationFrame(()=>{
   if('requestIdleCallback' in window) requestIdleCallback(load,{timeout:1200}); else setTimeout(load,200);
 }));
})();

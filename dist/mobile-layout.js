(() => {
 const media=matchMedia('(max-width:800px)'),layout=document.querySelector('.hero-layout');
 const reader=document.createElement('section');reader.className='mobile-investigation';reader.setAttribute('aria-labelledby','mobile-investigation-title');layout.append(reader);
 const deck=document.querySelector('.story-deck'),chapters=[...document.querySelectorAll('.story-chapter')];
 const cards=['front','mid','back'].map(n=>document.querySelector('.story-card-'+n));
 function render(){
 const ar=document.documentElement.lang==='ar';
 const t=(en,arText)=>ar?arText:en;
 const money=n=>`<bdi>${n} ${ar?'د.ك':'KWD'}</bdi>`;
 reader.innerHTML=`<h2 id="mobile-investigation-title">${t('Refund investigation','تحقيق الاسترداد')}</h2><p>${t('Same payment. Different refund outcome.','الدفعة نفسها، لكن نتيجة الاسترداد مختلفة.')}</p><div class="mobile-comparison"><article class="mobile-state"><h3>${t('Healthy state','الحالة السليمة')}<span>${t('PASS','ناجح')}</span></h3><dl><div><dt>${t('Payment charged','الدفعة المحصّلة')}</dt><dd>${money('75.000')}</dd></div><div><dt>${t('Refund processed','الاسترداد المنفّذ')}</dt><dd>${money('65.000')}</dd></div><div><dt>${t('Reconciliation','التسوية')}</dt><dd>${t('Correct','صحيحة')}</dd></div></dl></article><article class="mobile-state broken"><h3>${t('Broken state','الحالة المتأثرة')}<span>${t('FAIL','فشل')}</span></h3><dl><div><dt>${t('Payment charged','الدفعة المحصّلة')}</dt><dd>${money('75.000')}</dd></div><div><dt>${t('Refund recorded','الاسترداد المسجّل')}</dt><dd>${money('55.000')}</dd></div><div><dt>${t('Still owed to customer','المتبقي للعميل')}</dt><dd>${money('10.000')}</dd></div></dl></article></div><details><summary>${t('Follow the technical evidence','تتبّع الأدلة التقنية')}</summary><div class="mobile-trace"><article><h3>${t('UI — Refund failed','الواجهة — فشل الاسترداد')}</h3><p>${t('The remaining 10.000 KWD refund attempt failed.','فشلت محاولة استرداد الـ10.000 د.ك المتبقية.')}</p></article><article><h3>API</h3><code>POST /api/refunds → 403<br>INVALID_REFUND_AMOUNT</code></article><article><h3>${t('Root cause hypothesis','فرضية السبب الجذري')}</h3><code>Booking state = stale</code><p>${t('Cancellation committed before the refund service refreshed. This hypothesis requires verification.','حُفظ الإلغاء قبل تحديث حالة الحجز لدى خدمة الاسترداد. هذه فرضية تحتاج إلى تحقق.')}</p></article><article><h3>${t('Business impact · P1 Financial','أثر مالي · أولوية P1')}</h3><p>${t('The customer remains owed 10.000 KWD; refund reconciliation is incorrect.','لا يزال للعميل 10.000 د.ك، وتسوية الاسترداد غير صحيحة.')}</p></article></div><p>${t('Illustrative example. No client data.','مثال توضيحي لا يحتوي على بيانات عملاء.')}</p></details>`;
 }
 function arrange(){cards.forEach((card,i)=>{card.setAttribute('aria-hidden','true');(media.matches?chapters[i]:deck).append(card)});}
 render();arrange();media.addEventListener('change',arrange);document.addEventListener('site-language-change',render);
})();

// Keep the compact mobile navigation predictable after anchor navigation.
(() => {
  const menu = document.querySelector('.mobile-menu');
  if (!menu) return;
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      menu.querySelector('summary')?.focus();
    }
  });
})();

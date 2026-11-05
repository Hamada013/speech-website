import {start} from '../../assessment-shared/app.mjs';
start().catch(()=>{document.getElementById('loading').hidden=false;document.getElementById('loading').textContent='تعذر تحميل التطبيق. أعد تحميل الصفحة. / The app could not load. Reload the page.';});

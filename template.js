
    (() => {
      const tabs = [...document.querySelectorAll('.day-tab[data-day]')];
      const panels = [...document.querySelectorAll('.day-panel')];
      const routeMapData = {
        day1: {
          title:'第一日｜岡山機場、飯店與晚餐候選',
          points:[
            {name:'岡山桃太郎機場',detail:'15:55 巴士首選；16:55 或計程車備選',coords:[34.7569,133.8553]},
            {name:'岡山站・Hotel Granvia',detail:'入住、休息後步行前往晚餐',coords:[34.6664,133.9180]},
            {name:'てんぷら 千の種',detail:'19:00 已確認・2 位',coords:[34.6628,133.9248]}
          ]
        },
        day2: {
          title:'第二日｜岡山市區景點順序',
          points:[
            {name:'岡山站',detail:'路面電車出發',coords:[34.6664,133.9180]},
            {name:'岡山城',detail:'烏城天守',coords:[34.6652,133.9361]},
            {name:'岡山後樂園',detail:'庭園・由月見橋前往',coords:[34.6677,133.9350]},
            {name:'岡山神社',detail:'岡山城守護神・買岡山城御守',coords:[34.66775,133.93164]},
            {name:'cafe Antenna',detail:'週四咖啡主案・moyau 為條件式備選',coords:[34.6695471,133.9311740]},
            {name:'麵酒一照庵',detail:'午餐・岡山本店',coords:[34.6642078,133.9271244]},
            {name:'表町商店街',detail:'午後慢逛',coords:[34.6616,133.9294]},
            {name:'Sushi Yanagiya',detail:'17:30・2 位・已確認',coords:[34.6599,133.9234]}
          ]
        },
        'day3-denim': {
          title:'第三日｜兒島倉敷',
          points:[
            {number:1,name:'岡山站',detail:'JR 瀨戶大橋線',coords:[34.6664,133.9180]},
            {number:'2–3',label:'2·3',name:'兒島站・牛仔褲街',detail:'計程車接續 MOMOTARO 與丹寧店舖',coords:[34.4680,133.8048]},
            {number:4,name:'倉敷站',detail:'天城線直達巴士／JR 經岡山',coords:[34.6016,133.7653]}
          ]
        },
        'day3-denim-kurashiki': {
          title:'第三日｜倉敷步行路線',
          maxZoom:18,
          points:[
            {number:5,name:'阿智神社',detail:'抵達後先上山參拜',coords:[34.5975,133.7734]},
            {number:6,name:'平翠軒',detail:'下山後開始食品選物',coords:[34.5967,133.7750]},
            {number:7,name:'倉敷帆布 美觀地區店',detail:'帆布包與生活小物',coords:[34.59643,133.77372]},
            {number:8,name:'林源十郎商店',detail:'生活設計與屋頂展望',coords:[34.5967,133.7718]},
            {number:9,name:'滔々 toutou',detail:'民藝器物與手仕事',coords:[34.5951,133.7702]},
            {number:10,name:'倉敷美觀地區',detail:'日落後夜間景觀',coords:[34.5958,133.7709]},
            {number:11,name:'かしわ屋 こばやし',detail:'18:30 已確認・2 位',coords:[34.6000,133.7648]}
          ]
        },
        day4: {
          title:'第四日｜岡山站到機場',
          points:[
            {name:'岡山站・飯店',detail:'取行李、搭機場巴士',coords:[34.6664,133.9180]},
            {name:'岡山桃太郎機場',detail:'國際線報到',coords:[34.7569,133.8553]}
          ]
        }
      };

      const routeMaps = new Map();
      let wheelZoomMapId = null;

      function updateWheelZoomHint(mapId,active) {
        const element = document.getElementById('route-map-' + mapId);
        if (!element) return;
        element.classList.toggle('wheel-zoom-active',active);
        const hint = element.querySelector('.map-wheel-hint');
        if (hint) hint.textContent = active
          ? '滾輪縮放已開啟 · 點地圖外關閉'
          : '點一下地圖，再用滾輪縮放';
      }

      function disableWheelZoom() {
        if (!wheelZoomMapId) return;
        const mapId = wheelZoomMapId;
        const map = routeMaps.get(mapId);
        if (map) map.scrollWheelZoom.disable();
        wheelZoomMapId = null;
        updateWheelZoomHint(mapId,false);
      }

      function enableWheelZoom(mapId) {
        if (wheelZoomMapId === mapId) return;
        disableWheelZoom();
        const map = routeMaps.get(mapId);
        if (!map) return;
        map.scrollWheelZoom.enable();
        wheelZoomMapId = mapId;
        updateWheelZoomHint(mapId,true);
      }

      function ensureWheelZoomHint(element,mapId) {
        let hint = element.querySelector('.map-wheel-hint');
        if (hint) return hint;
        hint = document.createElement('div');
        hint.className = 'map-wheel-hint';
        hint.id = 'map-wheel-hint-' + mapId;
        hint.setAttribute('role','status');
        hint.setAttribute('aria-live','polite');
        hint.textContent = '點一下地圖，再用滾輪縮放';
        element.append(hint);
        return hint;
      }

      document.addEventListener('pointerdown',event => {
        if (!wheelZoomMapId) return;
        const activeMap = document.getElementById('route-map-' + wheelZoomMapId);
        if (activeMap && !activeMap.contains(event.target)) disableWheelZoom();
      },true);
      document.addEventListener('keydown',event => {
        if (event.key === 'Escape') disableWheelZoom();
      });

      function showMapError(element) {
        element.dataset.loaded = 'false';
        const empty = document.createElement('div');
        empty.className = 'map-empty';
        const inner = document.createElement('div');
        inner.className = 'map-empty-inner';
        const title = document.createElement('strong');
        title.textContent = '地圖暫時無法載入';
        const copy = document.createElement('p');
        copy.textContent = '這個免金鑰地圖需要網路連線；仍可使用下方「開啟大圖」查看路線。';
        inner.append(title,copy);
        empty.append(inner);
        element.replaceChildren(empty);
      }

      function ensureRouteMap(mapId) {
        const element = document.getElementById('route-map-' + mapId);
        const route = routeMapData[mapId];
        if (!element || !route) return;
        if (element.dataset.loaded === 'true') {
          ensureWheelZoomHint(element,mapId);
          const existing = routeMaps.get(mapId);
          if (existing) setTimeout(() => existing.invalidateSize(), 0);
          return;
        }
        if (typeof L === 'undefined') {
          showMapError(element);
          return;
        }
        const canvas = document.createElement('div');
        canvas.className = 'leaflet-container';
        canvas.setAttribute('aria-label', route.title);
        canvas.tabIndex = 0;
        element.replaceChildren(canvas);
        try {
          const map = L.map(canvas,{scrollWheelZoom:false,zoomControl:true});
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
            maxZoom:19,
            attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }).addTo(map);
          const coordinates = route.points.map(point => point.coords);
          L.polyline(coordinates,{color:'#41657b',weight:4,opacity:.82,dashArray:'10 8'}).addTo(map);
          route.points.forEach((point,index) => {
            const number = point.number ?? (index + 1);
            const label = point.label ?? number;
            const wide = String(label).length > 1;
            const icon = L.divIcon({
              className:'route-number-icon' + (wide ? ' route-number-wide' : ''),
              html:String(label),
              iconSize:[wide ? 42 : 32,32],
              iconAnchor:[wide ? 21 : 16,16],
              popupAnchor:[0,-16]
            });
            L.marker(point.coords,{icon,title:number + '. ' + point.name})
              .addTo(map)
              .bindPopup('<div class="route-popup"><b>' + number + '. ' + point.name + '</b><span>' + point.detail + '</span></div>');
          });
          const bounds = L.latLngBounds(coordinates).pad(.16);
          const maxZoom = route.maxZoom ?? 14;
          map.fitBounds(bounds,{padding:[24,24],maxZoom});
          routeMaps.set(mapId,map);
          const hint = ensureWheelZoomHint(element,mapId);
          canvas.setAttribute('aria-describedby',hint.id);
          map.on('click',() => enableWheelZoom(mapId));
          canvas.addEventListener('keydown',event => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            enableWheelZoom(mapId);
          });
          element.dataset.loaded = 'true';
          setTimeout(() => { map.invalidateSize(); map.fitBounds(bounds,{padding:[24,24],maxZoom}); }, 60);
        } catch (_) {
          showMapError(element);
        }
      }

      function refreshMapsWithin(container) {
        if (!container) return;
        container.querySelectorAll('.route-map').forEach(element => {
          if (element.closest('[hidden]')) return;
          const mapId = element.id.replace('route-map-','');
          ensureRouteMap(mapId);
        });
      }

      function activate(dayId, moveFocus = false) {
        disableWheelZoom();
        tabs.forEach(tab => {
          const active = tab.dataset.day === dayId;
          tab.setAttribute('aria-selected', String(active));
          tab.tabIndex = active ? 0 : -1;
          if (active && moveFocus) tab.focus();
        });
        panels.forEach(panel => { panel.hidden = panel.id !== dayId; });
        refreshMapsWithin(document.getElementById(dayId));
        try { history.replaceState(null, '', '#' + dayId); } catch (_) {}
        window.scrollTo({ top: document.querySelector('.nav-wrap').offsetTop, behavior: 'smooth' });
      }

      tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => activate(tab.dataset.day));
        tab.addEventListener('keydown', event => {
          if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
          event.preventDefault();
          let next = index;
          if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
          if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = tabs.length - 1;
          activate(tabs[next].dataset.day, true);
        });
      });

      const hashDay = location.hash.slice(1);
      if (panels.some(panel => panel.id === hashDay)) activate(hashDay);
      else refreshMapsWithin(document.getElementById('day1'));

      const storageKey = 'okayama-denim-2026-checklist';
      let saved = {};
      try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch (_) {}
      const boxes = [...document.querySelectorAll('.checklist input[type="checkbox"]')];
      boxes.forEach(box => {
        if (Object.prototype.hasOwnProperty.call(saved, box.dataset.key)) box.checked = saved[box.dataset.key];
        box.addEventListener('change', () => {
          const current = {};
          boxes.forEach(item => { current[item.dataset.key] = item.checked; });
          try { localStorage.setItem(storageKey, JSON.stringify(current)); } catch (_) {}
          updateProgress();
        });
      });

      function updateProgress() {
        document.querySelectorAll('.check-card').forEach(card => {
          const items = [...card.querySelectorAll('input[type="checkbox"]')];
          const done = items.filter(item => item.checked).length;
          const percent = Math.round((done / items.length) * 100);
          card.querySelector('.progress > span').style.width = percent + '%';
          card.querySelector('.progress-label').textContent = `已完成 ${done} / ${items.length}`;
        });
      }
      updateProgress();

      document.getElementById('printButton').addEventListener('click', () => window.print());
    })();
  
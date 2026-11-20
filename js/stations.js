'use strict';
/* ═══════════ деталізовані робочі місця, їхні ефекти та картинки будівель для меню ═══════════ */
function structDetail(B, legs, id) {
  switch (id) {
    case 'fire':
      for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5, x = Math.sin(a) * 0.38, z = Math.cos(a) * 0.38, w = 0.075 + (k % 3) * 0.012; B(x - w, 0, z - w, x + w, 0.12 + (k % 2) * 0.05, z + w, k % 2 ? 0x77756e : 0x8d8a82); }
      B(-0.24, 0, -0.24, 0.24, 0.04, 0.24, 0x2a2826); B(-0.28, 0.04, -0.06, 0.28, 0.14, 0.04, 0x5a3d27); B(-0.05, 0.07, -0.28, 0.05, 0.17, 0.28, 0x4f3622); B(-0.2, 0.1, -0.2, -0.1, 0.2, 0.2, 0x3a2a1c);
      B(-0.47, 0, -0.03, -0.42, 1.0, 0.03, 0x4a4f55); B(0.42, 0, -0.03, 0.47, 1.0, 0.03, 0x4a4f55); B(-0.47, 0.96, -0.025, 0.47, 1.0, 0.025, 0x4a4f55); B(-0.015, 0.76, -0.015, 0.015, 0.96, 0.015, 0x2a2d32);
      B(-0.13, 0.52, -0.13, 0.13, 0.74, 0.13, 0x1f2226); B(-0.15, 0.72, -0.15, 0.15, 0.76, 0.15, 0x34383d); B(-0.1, 0.74, -0.1, 0.1, 0.775, 0.1, 0x8a5a2a);
      return true;
    case 'bench':
      B(-0.5, 0.8, -0.38, 0.5, 0.88, 0.38, 0x9a7a52); B(-0.5, 0.66, 0.3, 0.5, 0.8, 0.36, 0x7d6038); legs(0.8, 0x6f5530);
      B(-0.44, 0.26, -0.3, 0.44, 0.3, 0.3, 0x7d6038); B(-0.38, 0.3, -0.24, -0.08, 0.5, 0.1, 0x8a2f2a); B(-0.26, 0.5, -0.1, -0.2, 0.54, -0.04, 0x2a2d32); B(0.02, 0.3, -0.2, 0.36, 0.44, 0.16, 0xc9a66a);
      B(-0.5, 0.88, -0.38, 0.5, 1.5, -0.33, 0x6f5530); B(-0.5, 1.5, -0.4, 0.5, 1.55, -0.3, 0x5a3d27);
      B(-0.38, 1.05, -0.33, -0.34, 1.4, -0.3, 0x8a6a48); B(-0.43, 1.33, -0.33, -0.29, 1.42, -0.29, 0x8a9096);
      B(-0.16, 1.0, -0.33, -0.12, 1.42, -0.3, 0xb8bcc0); B(-0.19, 1.0, -0.33, -0.09, 1.08, -0.29, 0x3a2a1c);
      B(0.06, 1.12, -0.33, 0.4, 1.3, -0.31, 0xb8bcc0); B(0.06, 1.2, -0.33, 0.14, 1.38, -0.29, 0x8a6a48);
      B(0.24, 0.88, -0.28, 0.44, 1.02, -0.1, 0x4a4f55); B(0.3, 1.02, -0.22, 0.38, 1.06, -0.16, 0x2a2d32); B(0.44, 0.93, -0.2, 0.52, 0.97, -0.18, 0x2a2d32);
      B(-0.4, 0.88, 0.02, 0.05, 0.92, 0.2, 0xc9a66a); B(-0.3, 0.92, 0.06, 0, 0.95, 0.16, 0xd8b87a); B(-0.44, 0.88, -0.22, -0.3, 0.895, -0.08, 0xe8e4d8);
      return true;
    case 'furnace':
      B(-0.47, 0, -0.47, 0.47, 0.16, 0.47, 0x6a6862); B(-0.43, 0.16, -0.43, 0.43, 1.05, 0.43, 0x8a4a3a);
      for (const y of [0.38, 0.6, 0.82]) B(-0.44, y, -0.44, 0.44, y + 0.03, 0.44, 0x6b3a2e);
      B(-0.26, 0.2, 0.43, 0.26, 0.66, 0.46, 0x5d5b56); B(-0.2, 0.24, 0.44, 0.2, 0.6, 0.465, 0x16110e);
      B(-0.47, 1.05, -0.47, 0.47, 1.14, 0.47, 0x6a6862); B(-0.34, 1.14, -0.34, 0.34, 1.36, 0.34, 0x8a4a3a);
      B(-0.17, 1.36, -0.17, 0.17, 2.1, 0.17, 0x6a6862); B(-0.21, 2.1, -0.21, 0.21, 2.18, 0.21, 0x4a4846); B(0.43, 0.3, -0.26, 0.47, 0.62, 0.02, 0x4a4f55); B(0.47, 0.42, -0.14, 0.5, 0.48, -0.1, 0x2a2d32);
      return true;
    case 'anvil':
      B(-0.5, 0, -0.5, 0.02, 0.78, 0.5, 0x8a4a3a); for (const y of [0.26, 0.52]) B(-0.51, y, -0.51, 0.03, y + 0.03, 0.51, 0x6b3a2e);
      B(-0.5, 0.78, -0.5, 0.02, 0.9, 0.5, 0x6a6862); B(-0.42, 0.9, -0.4, -0.06, 0.94, 0.4, 0x2a1a14);
      B(-0.5, 0.9, -0.5, -0.42, 1.7, 0.5, 0x8a4a3a); B(-0.5, 1.7, -0.5, 0.02, 1.82, 0.5, 0x6a6862); B(-0.4, 1.82, -0.2, -0.1, 2.3, 0.2, 0x5d5b56);
      B(0.14, 0, -0.16, 0.42, 0.42, 0.16, 0x5a3d27); B(0.12, 0.42, -0.12, 0.44, 0.5, 0.12, 0x2a2d32); B(0.06, 0.5, -0.18, 0.5, 0.64, 0.18, 0x34383d); B(0, 0.54, -0.08, 0.06, 0.62, 0.08, 0x34383d);
      B(0.16, 0.64, -0.03, 0.4, 0.68, 0.03, 0x8a6a48); B(0.36, 0.62, -0.06, 0.46, 0.72, 0.06, 0x8a9096);
      B(0.2, 0, 0.26, 0.46, 0.3, 0.5, 0x4a6a8a); B(0.22, 0.3, 0.28, 0.44, 0.32, 0.48, 0x3a5a7a);
      return true;
    case 'ammo':
      B(-0.5, 0.78, -0.38, 0.5, 0.85, 0.38, 0x5a5f66); legs(0.78, 0x3a3d42); B(-0.46, 0.3, -0.32, 0.46, 0.34, 0.32, 0x4a4f55);
      B(-0.36, 0.85, -0.16, -0.12, 0.95, 0.12, 0x34383d); B(-0.28, 0.95, -0.06, -0.2, 1.42, 0.02, 0x8a2f2a); B(-0.3, 1.42, -0.08, -0.18, 1.5, 0.04, 0x34383d); B(-0.24, 1.38, -0.03, 0.14, 1.42, 0, 0x2a2d32); B(0.1, 1.3, -0.05, 0.18, 1.46, 0.02, 0x1a1a1c);
      B(0.14, 0.85, -0.3, 0.44, 1.0, -0.06, 0x6a7a4a); B(0.16, 1.0, -0.28, 0.42, 1.03, -0.08, 0x5a6a3e);
      for (let k = 0; k < 4; k++) B(0.16 + k * 0.07, 0.85, 0.1, 0.2 + k * 0.07, 0.97, 0.14, 0xd0b050);
      B(-0.1, 0.85, 0.14, 0.06, 1.04, 0.3, 0x2a2826); B(-0.08, 1.04, 0.16, 0.04, 1.08, 0.28, 0xc9382c);
      B(-0.4, 0.34, -0.26, -0.1, 0.56, 0, 0x6a7a4a); B(0, 0.34, -0.2, 0.36, 0.5, 0.2, 0x7a5a36);
      return true;
  }
  return false;
}
/* жар у печі й кузні: тьмяний у спокої, яскравий під час роботи */
function addStationFx(s, grp) {
  const m = Base.mats; if (!m.ember) { m.ember = new THREE.MeshBasicMaterial({ color: 0x6a2008 }); m.emberOn = new THREE.MeshBasicMaterial({ color: 0xff8a2a }); }
  if (s.id === 'furnace') { s.ember = new THREE.Mesh(GEO.box, m.ember); s.ember.scale.set(0.38, 0.32, 0.02); s.ember.position.set(0, 0.42, 0.468); grp.add(s.ember); }
  else if (s.id === 'anvil') { s.ember = new THREE.Mesh(GEO.box, m.ember); s.ember.scale.set(0.34, 0.03, 0.76); s.ember.position.set(-0.24, 0.955, 0); grp.add(s.ember); }
}
function stationFx(s, dt, t) {
  if (s.ember) {
    const on = !!(P.craft && P.craft.r.st === s.def.st && dist2(s.cx, s.cz, P.x, P.z) < 10.5); s.ember.material = on ? Base.mats.emberOn : Base.mats.ember;
    if (on) Base.mats.emberOn.color.setHSL(0.07, 1, 0.5 + 0.1 * Math.sin(t * 17));
  }
  if (s.id === 'fire' && chance(dt * 3) && dist2(s.cx, s.cz, P.x, P.z) < 1200) spawnParts(1, s.cx + rnd(-0.08, 0.08), 0.85, s.cz + rnd(-0.08, 0.08), 0, 1.0, 0, 0.25, 0x77756e, 1.5, 0.08, -0.45);
}
/* картинки будівель рендеряться з тих самих моделей, що стоять у світі */
function makeBuildIcons(renderer) {
  const sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight(0xffffff, 0x8a8a8a, 3.2));
  const dl = new THREE.DirectionalLight(0xffffff, 3.4); dl.position.set(2, 4, 3); sc.add(dl);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 30), size = 96, prev = renderer.getSize(new THREE.Vector2()), pr = renderer.getPixelRatio(), ex = renderer.toneMappingExposure;
  renderer.setPixelRatio(1); renderer.setSize(size, size, false); renderer.setClearColor(0x2c322b, 1); renderer.toneMappingExposure = 1.3;
  const cv = document.createElement('canvas'); cv.width = cv.height = size;
  const ctx = cv.getContext('2d'), box = new THREE.Box3(), c = new THREE.Vector3(), sz = new THREE.Vector3(), fm = new THREE.MeshBasicMaterial({ color: 0xffa13a }), fg = new THREE.ConeGeometry(0.2, 0.6, 5).translate(0, 0.3, 0);
  for (const b of BUILDS) {
    const g = new THREE.Group(); g.add(new THREE.Mesh(structGeo(b.id), MAT.vc));
    if (b.id === 'fire' || b.id === 'torch') { const f = new THREE.Mesh(fg, fm); f.position.y = b.id === 'fire' ? 0.16 : 1.66; if (b.id === 'torch') f.scale.setScalar(0.6); g.add(f); }
    sc.add(g); box.setFromObject(g); box.getCenter(c); box.getSize(sz);
    const h = Math.max(sz.x, sz.y, sz.z) * 0.72 + 0.08; cam.left = -h; cam.right = h; cam.top = h; cam.bottom = -h; cam.updateProjectionMatrix();
    cam.position.set(c.x + 5, c.y + 4.2, c.z + 5); cam.lookAt(c);
    renderer.render(sc, cam); ctx.clearRect(0, 0, size, size); ctx.drawImage(renderer.domElement, 0, 0, size, size); ICON['b_' + b.id] = cv.toDataURL(); sc.remove(g);
  }
  renderer.setPixelRatio(pr); renderer.setSize(prev.x, prev.y, false); renderer.toneMappingExposure = ex;
}

import { useState, useMemo } from "react";
import { jsPDF } from "jspdf";
import specs from "./panels.json";

/* ============================================================
   CONFIG — panel & processor specs live in panels.json.
   Calculation constants stay here since they aren't device specs.
   ============================================================ */
const PANELS = specs.panels;
const PROCESSORS = specs.processors;
const BREAKER_DERATE = 0.8;
const MM_PER_FT = 304.8;
// RubyLED logo (embedded). Swap this data URI for a hosted URL in production.
const LOGO_URL = "data:image/png;base64,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";

const CELL_RED = "#C0504D";
const CELL_BLUE = "#4F81BD";

function ftIn(feet) {
  const f = Math.floor(feet);
  const i = Math.round((feet - f) * 12);
  return i === 12 ? `${f + 1}' 0"` : `${f}' ${i}"`;
}
function gcd(a, b) { return b ? gcd(b, a % b) : a; }
function slugify(s) {
  return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function colName(i) {
  let s = "";
  i += 1;
  while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); }
  return s;
}

/* Build the serpentine cable route for one port group.
   Returns { pts: [[x,y]...], arrows: [{x,y,down}] } in panel units. */
function portRoute(c0, cLast, ch) {
  const pts = [];
  const arrows = [];
  for (let c = c0; c <= cLast; c++) {
    const x = c + 0.5;
    const down = (c - c0) % 2 === 0;
    if (c === c0) pts.push([x, 0.02]);
    if (down) {
      if (c !== c0) pts.push([x, 0.5]);          // arrive at top center from previous col
      pts.push([x, ch - 0.5]);                    // run down
      if (c !== cLast) pts.push([c + 1.5, ch - 0.5]); // turn right along bottom
    } else {
      pts.push([x, 0.5]);                         // run up
      if (c !== cLast) pts.push([c + 1.5, 0.5]);  // turn right along top
    }
    arrows.push({ x, y: ch / 2, down });
  }
  return { pts, arrows };
}

export default function RubyLEDCalc() {
  const [panelId, setPanelId] = useState(PANELS[0].id);
  const [procId, setProcId] = useState(PROCESSORS[0].id);
  const [mode, setMode] = useState("size");
  const [lock169, setLock169] = useState(true);
  const [metric, setMetric] = useState(false);
  const [inW, setInW] = useState(16);
  const [inH, setInH] = useState(9);
  const [pW, setPW] = useState(10);
  const [pH, setPH] = useState(6);
  const [toast, setToast] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [screenName, setScreenName] = useState("");

  const panel = PANELS.find(p => p.id === panelId);
  const proc = PROCESSORS.find(p => p.id === procId);

  // Unit toggle converts entered values so the physical wall never changes.
  const toggleUnits = () => {
    if (mode === "size") {
      if (metric) { setInW(+(inW / 0.3048).toFixed(2)); setInH(+(inH / 0.3048).toFixed(2)); }
      else { setInW(+(inW * 0.3048).toFixed(2)); setInH(+(inH * 0.3048).toFixed(2)); }
    }
    setMetric(m => !m);
  };

  const calc = useMemo(() => {
    const panelWft = panel.wMM / MM_PER_FT;
    const panelHft = panel.hMM / MM_PER_FT;
    let cw, ch;

    if (mode === "size") {
      const wFt = metric ? inW / 0.3048 : inW;
      const hFt = metric ? inH / 0.3048 : inH;
      cw = Math.max(1, Math.round(wFt / panelWft));
      ch = lock169
        ? Math.max(1, Math.round((cw * panel.wMM * 9) / (16 * panel.hMM)))
        : Math.max(1, Math.round(hFt / panelHft));
    } else {
      cw = Math.max(1, pW);
      ch = lock169
        ? Math.max(1, Math.round((cw * panel.wMM * 9) / (16 * panel.hMM)))
        : Math.max(1, pH);
    }

    const wMM = cw * panel.wMM, hMM = ch * panel.hMM;
    const resW = cw * panel.pxW, resH = ch * panel.pxH;
    const totalPx = resW * resH;
    const total = cw * ch;
    const g = gcd(resW, resH);

    const pxPerPanel = panel.pxW * panel.pxH;
    const panelsPerPort = Math.max(1, Math.floor(proc.portCap / pxPerPanel));
    const colsPerPort = Math.max(1, Math.floor(panelsPerPort / ch));
    const portsUsed = Math.ceil(cw / colsPerPort);

    return {
      cw, ch, total,
      wFt: wMM / MM_PER_FT, hFt: hMM / MM_PER_FT,
      wM: wMM / 1000, hM: hMM / 1000,
      resW, resH, totalPx,
      ratioTxt: `${resW / g}:${resH / g}`, ratio: (resW / resH).toFixed(3),
      viewM: panel.pitch, viewFt: panel.pitch * 3.28084,
      lbs: total * panel.kg * 2.20462, kgs: total * panel.kg,
      maxKW: (total * panel.maxW) / 1000, avgKW: (total * panel.avgW) / 1000,
      amps120: (total * panel.maxW) / 120, amps208: (total * panel.maxW) / 208,
      cir120: Math.ceil((total * panel.maxW) / 120 / (20 * BREAKER_DERATE)),
      cir208: Math.ceil((total * panel.maxW) / 208 / (20 * BREAKER_DERATE)),
      colsPerPort, portsUsed,
      fits: portsUsed <= proc.ports,
    };
  }, [panel, proc, mode, lock169, metric, inW, inH, pW, pH]);

  const groups = useMemo(() => {
    const out = [];
    for (let p = 0; p < calc.portsUsed; p++) {
      const c0 = p * calc.colsPerPort;
      const cLast = Math.min(c0 + calc.colsPerPort - 1, calc.cw - 1);
      out.push({ port: p + 1, c0, cLast, ...portRoute(c0, cLast, calc.ch) });
    }
    return out;
  }, [calc]);

  const proposalText = useMemo(() => {
    const c = calc;
    const dims = metric
      ? `${c.wM.toFixed(2)}m W x ${c.hM.toFixed(2)}m H`
      : `${ftIn(c.wFt)} W x ${ftIn(c.hFt)} H`;
    return [
      `LED WALL SUMMARY - RubyLED ${panel.name}`,
      ``,
      `Wall Size: ${dims}`,
      `Panel Configuration: ${c.cw} wide x ${c.ch} high (${c.total} panels)`,
      `Resolution: ${c.resW} x ${c.resH} (${(c.totalPx / 1e6).toFixed(2)}M pixels)`,
      `Aspect Ratio: ${c.ratioTxt} (${c.ratio})`,
      `Pixel Pitch: ${panel.pitch}mm`,
      `Minimum Viewing Distance: ${c.viewFt.toFixed(1)} ft`,
      `Total Weight: ${Math.round(c.lbs).toLocaleString()} lbs`,
      `Max Power: ${Math.round(c.maxKW * 1000).toLocaleString()} W`,
      `Circuits (20A @ 80%): ${c.cir120} @ 120V or ${c.cir208} @ 208V`,
      `Processor: ${proc.name} - ${c.portsUsed} of ${proc.ports} ports used (${c.colsPerPort} columns per port)`,
    ].join("\n");
  }, [calc, panel, proc, metric]);

  const proposalFields = useMemo(() => {
    const c = calc;
    const dims = metric
      ? `${c.wM.toFixed(2)}m × ${c.hM.toFixed(2)}m`
      : `${ftIn(c.wFt)} × ${ftIn(c.hFt)}`;
    return [
      ["Panel Model", panel.name],
      ["Wall Size", dims],
      ["Panel Configuration", `${c.cw} wide × ${c.ch} high (${c.total} panels)`],
      ["Resolution", `${c.resW} × ${c.resH} (${(c.totalPx / 1e6).toFixed(2)}M pixels)`],
      ["Aspect Ratio", `${c.ratioTxt} (${c.ratio})`],
      ["Pixel Pitch", `${panel.pitch}mm`],
      ["Minimum Viewing Distance", metric ? `${c.viewM.toFixed(1)} m` : `${c.viewFt.toFixed(1)} ft`],
      ["Total Weight", metric ? `${Math.round(c.kgs).toLocaleString()} kg` : `${Math.round(c.lbs).toLocaleString()} lbs`],
      ["Max Power", `${Math.round(c.maxKW * 1000).toLocaleString()} W`],
      ["Circuits (20A @ 80%)", `${c.cir120} @ 120V or ${c.cir208} @ 208V`],
      ["Processor / Ports", `${proc.name} — ${c.portsUsed} of ${proc.ports} ports used (${c.colsPerPort} columns/port)`],
    ];
  }, [calc, panel, proc, metric]);

  const copyIt = () => {
    const done = () => { setToast("Copied to clipboard"); setTimeout(() => setToast(""), 1800); };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(proposalText).then(done).catch(fallback);
    } else fallback();
    function fallback() {
      const ta = document.createElement("textarea");
      ta.value = proposalText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      done();
    }
  };

  /* ---------- Render the wiring map to a canvas for export ---------- */
  const buildMapCanvas = () => {
    const CELL = 160;                     // px per panel (high res for crisp export)
    const TOP = 120;                      // space for port badges
    const PAD = 36;
    const w = calc.cw * CELL + PAD * 2;
    const h = calc.ch * CELL + TOP + PAD;
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const g2 = cv.getContext("2d");
    g2.imageSmoothingEnabled = true;
    g2.imageSmoothingQuality = "high";

    g2.fillStyle = "#FFFFFF";
    g2.fillRect(0, 0, w, h);

    const ox = PAD, oy = TOP;
    const X = x => ox + x * CELL;
    const Y = y => oy + y * CELL;

    // panels
    for (let r = 0; r < calc.ch; r++) {
      for (let c = 0; c < calc.cw; c++) {
        g2.fillStyle = (r + c) % 2 === 0 ? CELL_RED : CELL_BLUE;
        g2.fillRect(X(c) + 2, Y(r) + 2, CELL - 4, CELL - 4);
        g2.fillStyle = "rgba(255,255,255,.92)";
        g2.font = "600 22px 'IBM Plex Mono', monospace";
        g2.textAlign = "left";
        g2.fillText(`${colName(c)},${r + 1}`, X(c) + 10, Y(r) + 30);
      }
    }

    // cable routes
    g2.lineJoin = "round";
    g2.lineCap = "round";
    groups.forEach(gr => {
      g2.strokeStyle = "#111";
      g2.lineWidth = 7;
      g2.beginPath();
      gr.pts.forEach(([x, y], i) => {
        i === 0 ? g2.moveTo(X(x), Y(y)) : g2.lineTo(X(x), Y(y));
      });
      g2.stroke();
      // direction arrows mid-column
      g2.fillStyle = "#111";
      gr.arrows.forEach(a => {
        const ax = X(a.x), ay = Y(a.y), s = 18;
        g2.beginPath();
        if (a.down) { g2.moveTo(ax - s, ay - s); g2.lineTo(ax + s, ay - s); g2.lineTo(ax, ay + s); }
        else { g2.moveTo(ax - s, ay + s); g2.lineTo(ax + s, ay + s); g2.lineTo(ax, ay - s); }
        g2.closePath(); g2.fill();
      });
      // feed line + port badge
      const bx = X(gr.c0 + 0.5), by = TOP - 52;
      g2.beginPath(); g2.moveTo(bx, by + 28); g2.lineTo(bx, Y(0.02)); g2.stroke();
      g2.beginPath(); g2.arc(bx, by, 28, 0, Math.PI * 2);
      g2.fillStyle = gr.port > proc.ports ? "#FF4D4D" : "#FFF";
      g2.fill(); g2.strokeStyle = "#111"; g2.lineWidth = 4; g2.stroke();
      g2.fillStyle = gr.port > proc.ports ? "#FFF" : "#111";
      g2.font = "700 26px 'IBM Plex Mono', monospace"; g2.textAlign = "center";
      g2.fillText(String(gr.port), bx, by + 9);
    });

    // centered size / panel count overlay — matches the on-screen data map
    const cx = ox + (calc.cw * CELL) / 2;
    const cy = oy + (calc.ch * CELL) / 2;
    const dimsTxt = metric
      ? `${calc.wM.toFixed(2)}m × ${calc.hM.toFixed(2)}m`
      : `${ftIn(calc.wFt)} × ${ftIn(calc.hFt)}`;
    const resTxt = `${calc.resW} × ${calc.resH} px · ${calc.cw} × ${calc.ch} panels (${calc.total})`;
    g2.textAlign = "center";
    g2.shadowColor = "rgba(0,0,0,.85)";
    g2.shadowBlur = 24;
    g2.fillStyle = "#FFFFFF";
    g2.font = "800 72px Poppins, sans-serif";
    g2.fillText(dimsTxt, cx, cy - 6);
    g2.font = "600 30px 'IBM Plex Mono', monospace";
    g2.fillText(resTxt, cx, cy + 44);
    g2.shadowBlur = 0;

    // title
    g2.fillStyle = "#111";
    g2.font = "700 28px 'IBM Plex Mono', monospace";
    g2.textAlign = "left";
    g2.fillText(`RubyLED ${panel.name} — ${calc.cw}x${calc.ch} — ${proc.name} (${calc.portsUsed}/${proc.ports} ports)`, PAD, 42);

    return cv;
  };

  /* ---------- Build & download the one-page proposal PDF ---------- */
  const exportPdf = (rawName) => {
    const cv = buildMapCanvas();
    const imgData = cv.toDataURL("image/png");

    const doc = new jsPDF({ unit: "pt", format: "letter", orientation: "portrait" });
    const pageW = doc.internal.pageSize.getWidth();
    const marginX = 40;
    const contentW = pageW - marginX * 2;

    // header
    const name = rawName.trim() || "LED Wall";
    let y = 56;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(17, 17, 17);
    doc.text(name, marginX, y);

    // thin red rule under the header
    y += 12;
    doc.setDrawColor(174, 0, 27);
    doc.setLineWidth(1.5);
    doc.line(marginX, y, pageW - marginX, y);
    y += 26;

    // data map graphic, scaled to fit width with margins, aspect preserved,
    // capped in height so the field table always has room below it
    const maxImgH = 380;
    let imgW = contentW;
    let imgH = (imgW * cv.height) / cv.width;
    if (imgH > maxImgH) {
      imgH = maxImgH;
      imgW = (imgH * cv.width) / cv.height;
    }
    const imgX = marginX + (contentW - imgW) / 2;
    doc.addImage(imgData, "PNG", imgX, y, imgW, imgH);
    y += imgH + 28;

    // proposal fields as a two-column table with alternating row shading
    const rowH = 22;
    const col1W = contentW * 0.4;
    doc.setFontSize(10.5);
    proposalFields.forEach(([label, value], i) => {
      if (i % 2 === 1) {
        doc.setFillColor(243, 243, 243);
        doc.rect(marginX, y, contentW, rowH, "F");
      }
      doc.setFont("helvetica", "bold");
      doc.setTextColor(17, 17, 17);
      doc.text(label, marginX + 10, y + rowH / 2 + 3.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40);
      doc.text(value, marginX + col1W + 10, y + rowH / 2 + 3.5);
      y += rowH;
    });

    const slug = slugify(name) || "led-wall";
    doc.save(`${slug}.pdf`);
  };

  const submitExport = (e) => {
    e.preventDefault();
    exportPdf(screenName);
    setExportOpen(false);
    setToast("PDF downloaded");
    setTimeout(() => setToast(""), 1800);
  };

  const dev169 = Math.abs(calc.resW / calc.resH - 16 / 9) < 0.02;
  const compact = calc.cw * calc.ch > 500 || calc.cw > 30;

  const cells = [];
  for (let r = 0; r < calc.ch; r++) {
    for (let c = 0; c < calc.cw; c++) {
      cells.push(
        <div key={`${c}-${r}`} className={`cell ${(r + c) % 2 === 0 ? "red" : "blue"}`}>
          {!compact && <span className="cid">{colName(c)},{r + 1}</span>}
        </div>
      );
    }
  }

  return (
    <div className="app">
      <style>{css}</style>

      <header className="hdr">
        {LOGO_URL ? (
          <div className="mark">
            <img src={LOGO_URL} alt="RubyLED" className="logo" />
            <span className="sub">Screen Calculator</span>
          </div>
        ) : (
          <div className="mark">
            <span className="chip" />
            <h1>Ruby<b>LED</b> <span className="sub">Screen Calculator</span></h1>
          </div>
        )}
        <button className="unit" onClick={toggleUnits}>
          {metric ? "METRIC" : "IMPERIAL"} ⇄
        </button>
      </header>

      <div className="grid">
        {/* ============ CONTROLS ============ */}
        <section className="card controls">
          <label className="lbl"><span className="tick" />Panel Model</label>
          <select value={panelId} onChange={e => setPanelId(e.target.value)}>
            {PANELS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="specline">
            {panel.pitch}mm · {panel.pxW}×{panel.pxH}px · {panel.wMM}×{panel.hMM}mm
          </div>

          <label className="lbl"><span className="tick" />Processor</label>
          <select value={procId} onChange={e => setProcId(e.target.value)}>
            {PROCESSORS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div className="specline">{proc.ports} ports · {(proc.portCap / 1e3).toFixed(0)}K px/port</div>

          <label className="lbl"><span className="tick" />Input Mode</label>
          <div className="seg">
            <button className={mode === "size" ? "on" : ""} onClick={() => setMode("size")}>Wall size</button>
            <button className={mode === "count" ? "on" : ""} onClick={() => setMode("count")}>Panel count</button>
          </div>

          <button className={`lockbtn ${lock169 ? "locked" : ""}`} onClick={() => setLock169(v => !v)}>
            <span>{lock169 ? "🔒" : "🔓"}</span>
            16:9 Ratio {lock169 ? "Locked" : "Unlocked"}
          </button>

          {mode === "size" ? (
            <div className="inputs">
              <div className="field">
                <label>Width ({metric ? "m" : "ft"})</label>
                <input type="number" min="1" step={metric ? 0.5 : 1} value={inW}
                  onChange={e => setInW(+e.target.value || 0)} />
              </div>
              <div className={`field ${lock169 ? "dim" : ""}`}>
                <label>Height ({metric ? "m" : "ft"})</label>
                <input type="number" min="1" step={metric ? 0.5 : 1}
                  value={lock169 ? +(metric ? calc.hM : calc.hFt).toFixed(2) : inH}
                  disabled={lock169} onChange={e => setInH(+e.target.value || 0)} />
                {lock169 && <span className="auto">auto</span>}
              </div>
            </div>
          ) : (
            <div className="inputs">
              <div className="field">
                <label>Panels wide</label>
                <input type="number" min="1" value={pW} onChange={e => setPW(+e.target.value || 1)} />
              </div>
              <div className={`field ${lock169 ? "dim" : ""}`}>
                <label>Panels high</label>
                <input type="number" min="1" value={lock169 ? calc.ch : pH} disabled={lock169}
                  onChange={e => setPH(+e.target.value || 1)} />
                {lock169 && <span className="auto">auto</span>}
              </div>
            </div>
          )}

          <div className="note">Panel & processor specs load from panels.json — update that file without touching code.</div>
        </section>

        {/* ============ RESULTS ============ */}
        <section className="results">
          <div className="preview card">
            <div className="maptitle">
              <span>DATA MAP · {proc.name}</span>
              <span className="mapright">
                <span className={calc.fits ? "good" : "bad"}>
                  {calc.portsUsed} / {proc.ports} ports{calc.fits ? "" : " · OVER CAPACITY"}
                </span>
                <button className="dlbtn" onClick={() => { setScreenName(""); setExportOpen(true); }}>⬇ Export</button>
              </span>
            </div>

            <div className="badgerow" style={{ gridTemplateColumns: `repeat(${calc.cw}, 1fr)` }}>
              {groups.map(gr => (
                <div key={gr.port} className="badge"
                  style={{ gridColumn: `${gr.c0 + 1} / span ${gr.cLast - gr.c0 + 1}` }}>
                  <span className={gr.port > proc.ports ? "over" : ""}>{gr.port}</span>
                </div>
              ))}
            </div>

            <div className="mapwrap"
              style={{ aspectRatio: `${calc.cw * panel.wMM} / ${calc.ch * panel.hMM}` }}>
              <div className="wallmap" style={{ gridTemplateColumns: `repeat(${calc.cw}, 1fr)` }}>
                {cells}
              </div>
              <svg className="routes" viewBox={`0 0 ${calc.cw} ${calc.ch}`} preserveAspectRatio="none">
                {groups.map(gr => (
                  <g key={gr.port}>
                    <polyline
                      points={gr.pts.map(([x, y]) => `${x},${y}`).join(" ")}
                      fill="none" stroke="#111" strokeWidth="0.06" strokeLinejoin="round" />
                    {!compact && gr.arrows.map((a, i) => (
                      <polygon key={i}
                        points={a.down
                          ? `${a.x - 0.14},${a.y - 0.12} ${a.x + 0.14},${a.y - 0.12} ${a.x},${a.y + 0.14}`
                          : `${a.x - 0.14},${a.y + 0.12} ${a.x + 0.14},${a.y + 0.12} ${a.x},${a.y - 0.14}`}
                        fill="#111" />
                    ))}
                  </g>
                ))}
              </svg>
              <div className="wallinfo">
                <div className="dims">
                  {metric
                    ? `${calc.wM.toFixed(2)}m × ${calc.hM.toFixed(2)}m`
                    : `${ftIn(calc.wFt)} × ${ftIn(calc.hFt)}`}
                </div>
                <div className="res">{calc.resW} × {calc.resH} px · {calc.cw} × {calc.ch} panels ({calc.total})</div>
              </div>
            </div>

            <div className="previewbar">
              <span>
                {metric
                  ? `${calc.wM.toFixed(2)}m × ${calc.hM.toFixed(2)}m`
                  : `${ftIn(calc.wFt)} × ${ftIn(calc.hFt)}`} · {calc.cw} × {calc.ch} panels ({calc.total})
              </span>
              <span className={dev169 ? "good" : "warn"}>
                {calc.ratioTxt}{lock169 && !dev169 ? " · nearest to 16:9" : ""}
              </span>
            </div>
          </div>

          <div className="stats">
            <Stat k="Resolution" v={`${calc.resW} × ${calc.resH}`} s={`${(calc.totalPx / 1e6).toFixed(2)}M px`} />
            <Stat k="Aspect Ratio" v={calc.ratioTxt} s={calc.ratio} />
            <Stat k="Min. Viewing" v={metric ? `${calc.viewM.toFixed(1)} m` : `${calc.viewFt.toFixed(1)} ft`} s={`${panel.pitch}mm pitch`} />
            <Stat k="Weight" v={metric ? `${Math.round(calc.kgs).toLocaleString()} kg` : `${Math.round(calc.lbs).toLocaleString()} lbs`} s={`${calc.total} panels`} />
            <Stat k="Max Power" v={`${Math.round(calc.maxKW * 1000).toLocaleString()} W`} s={`avg ${Math.round(calc.avgKW * 1000).toLocaleString()} W`} />
            <Stat k="Amps" v={`${calc.amps208.toFixed(1)} A @ 208V`} s={`${calc.amps120.toFixed(1)} A @ 120V`} />
            <Stat k="Circuits 20A" v={`${calc.cir208} @ 208V`} s={`${calc.cir120} @ 120V · 80% derate`} />
            <Stat k="Data Ports" v={`${calc.portsUsed} / ${proc.ports}`} s={`${calc.colsPerPort} col/port · ${proc.name}`} warn={!calc.fits} />
          </div>

          <div className="card copyblock">
            <div className="copyhead">
              <label className="lbl"><span className="tick" />Proposal Output</label>
              <button className="copybtn" onClick={copyIt}>Copy for Proposal</button>
            </div>
            <pre>{proposalText}</pre>
          </div>
        </section>
      </div>

      {exportOpen && (
        <div className="modal" onClick={() => setExportOpen(false)}>
          <div className="modalbox exportbox" onClick={e => e.stopPropagation()}>
            <div className="modalhead">
              <span>Export Proposal PDF</span>
              <button className="modalclose" onClick={() => setExportOpen(false)}>✕</button>
            </div>
            <form onSubmit={submitExport}>
              <div className="modalbody">
                <div className="field">
                  <label>Screen Name</label>
                  <input
                    type="text"
                    autoFocus
                    placeholder="e.g. Main Sanctuary Wall"
                    value={screenName}
                    onChange={e => setScreenName(e.target.value)}
                  />
                </div>
              </div>
              <div className="modalbtns">
                <button type="button" className="dlbtn" onClick={() => setExportOpen(false)}>Cancel</button>
                <button type="submit" className="copybtn">Export</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function Stat({ k, v, s, warn }) {
  return (
    <div className={`stat card ${warn ? "statwarn" : ""}`}>
      <div className="k">{k}</div>
      <div className="v">{v}</div>
      <div className="s">{s}</div>
    </div>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500;700;800&family=IBM+Plex+Mono:wght@400;600&display=swap');
* { box-sizing: border-box; margin: 0; }
.app { min-height: 100vh; background: #101014; color: #ECECF1; font-family: 'Poppins', sans-serif; padding: 20px; }
.hdr { display: flex; justify-content: space-between; align-items: center; max-width: 1180px; margin: 0 auto 20px; }
.logo { height: 42px; display: block; }
.mark { display: flex; align-items: center; gap: 12px; }
.chip { width: 22px; height: 30px; background: #AE001B; transform: skewX(-14deg); box-shadow: 0 0 24px rgba(174,0,27,.55); }
.mark h1 { font-size: 22px; font-weight: 500; letter-spacing: .5px; }
.mark h1 b { font-weight: 800; color: #FF2742; }
.mark .sub { font-size: 12px; color: #7A7A86; font-weight: 500; margin-left: 8px; letter-spacing: 2px; text-transform: uppercase; }
.unit { background: none; border: 1px solid #2C2C34; color: #B9B9C4; padding: 8px 14px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; cursor: pointer; letter-spacing: 1px; }
.unit:hover { border-color: #AE001B; color: #fff; }
.grid { display: grid; grid-template-columns: 300px 1fr; gap: 16px; max-width: 1180px; margin: 0 auto; }
@media (max-width: 860px) { .grid { grid-template-columns: 1fr; } }
.card { background: #17171D; border: 1px solid #23232B; padding: 16px; }
.lbl { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #8D8D99; margin: 18px 0 8px; }
.lbl:first-child { margin-top: 0; }
.tick { width: 10px; height: 14px; background: #AE001B; transform: skewX(-14deg); display: inline-block; }
select, input { width: 100%; background: #101015; border: 1px solid #2C2C34; color: #ECECF1; padding: 10px 12px; font-family: 'IBM Plex Mono', monospace; font-size: 14px; }
select:focus, input:focus { outline: 2px solid #AE001B; outline-offset: -1px; }
input:disabled { opacity: .45; }
.specline { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #6E6E7A; margin-top: 8px; }
.seg { display: flex; border: 1px solid #2C2C34; }
.seg button { flex: 1; background: none; border: none; color: #8D8D99; padding: 10px; font-family: 'Poppins'; font-weight: 600; font-size: 13px; cursor: pointer; }
.seg button.on { background: #AE001B; color: #fff; }
.lockbtn { width: 100%; margin-top: 14px; padding: 12px; cursor: pointer; background: #101015; border: 1px dashed #3A3A44; color: #8D8D99; font-family: 'Poppins'; font-weight: 600; font-size: 13px; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all .15s; }
.lockbtn.locked { border: 1px solid #AE001B; background: rgba(174,0,27,.12); color: #FF6B7F; }
.inputs { display: flex; gap: 10px; margin-top: 14px; }
.field { flex: 1; position: relative; }
.field label { display: block; font-size: 11px; color: #8D8D99; margin-bottom: 5px; font-weight: 600; }
.field .auto { position: absolute; right: 8px; bottom: 10px; font-size: 10px; color: #FF6B7F; font-family: 'IBM Plex Mono', monospace; letter-spacing: 1px; }
.note { margin-top: 18px; font-size: 11px; color: #5E5E6A; line-height: 1.5; }
.results { display: flex; flex-direction: column; gap: 16px; }
.maptitle { display: flex; justify-content: space-between; align-items: center; font-family: 'IBM Plex Mono', monospace; font-size: 11px; letter-spacing: 1px; color: #8D8D99; margin-bottom: 10px; flex-wrap: wrap; gap: 8px; }
.mapright { display: flex; align-items: center; gap: 12px; }
.maptitle .good { color: #6BCF8E; }
.maptitle .bad { color: #FF4D4D; font-weight: 600; }
.dlbtn { background: none; border: 1px solid #2C2C34; color: #B9B9C4; padding: 6px 12px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; cursor: pointer; }
.dlbtn:hover { border-color: #AE001B; color: #fff; }
.badgerow { display: grid; gap: 1px; margin-bottom: 4px; }
.badge { display: flex; justify-content: center; }
.badge span { width: 22px; height: 22px; border-radius: 50%; background: #fff; color: #17171D; font-family: 'IBM Plex Mono', monospace; font-weight: 600; font-size: 11px; display: flex; align-items: center; justify-content: center; border: 2px solid #33333D; }
.badge span.over { background: #FF4D4D; color: #fff; }
.mapwrap { position: relative; max-height: 440px; }
.wallmap { display: grid; gap: 1px; background: #33333D; border: 2px solid #33333D; width: 100%; height: 100%; }
.cell { position: relative; min-height: 0; }
.cell.red { background: ${CELL_RED}; }
.cell.blue { background: ${CELL_BLUE}; }
.cell .cid { position: absolute; top: 2px; left: 3px; font-family: 'IBM Plex Mono', monospace; font-size: clamp(6px, 0.9vw, 10px); color: rgba(255,255,255,.85); }
.routes { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.wallinfo { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none; text-align: center; }
.wallinfo .dims { font-family: 'Poppins'; font-weight: 800; font-size: clamp(18px, 3.6vw, 32px); color: #fff; text-shadow: 0 2px 6px rgba(0,0,0,.85), 0 0 24px rgba(0,0,0,.7); }
.wallinfo .res { font-family: 'IBM Plex Mono', monospace; font-size: clamp(10px, 1.4vw, 14px); color: #fff; margin-top: 4px; text-shadow: 0 2px 6px rgba(0,0,0,.85), 0 0 18px rgba(0,0,0,.7); }
.previewbar { display: flex; justify-content: space-between; margin-top: 12px; font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #8D8D99; flex-wrap: wrap; gap: 6px; }
.previewbar .good { color: #6BCF8E; }
.previewbar .warn { color: #E8B44A; }
.stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
.stat .k { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: #7A7A86; font-weight: 700; }
.stat .v { font-family: 'IBM Plex Mono', monospace; font-weight: 600; font-size: 17px; margin: 6px 0 3px; color: #fff; }
.stat .s { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #6E6E7A; }
.statwarn { border-color: #FF4D4D; }
.statwarn .v { color: #FF4D4D; }
.copyblock pre { font-family: 'IBM Plex Mono', monospace; font-size: 12px; color: #B9B9C4; background: #101015; border: 1px solid #23232B; padding: 14px; margin-top: 10px; white-space: pre-wrap; line-height: 1.6; }
.copyhead { display: flex; justify-content: space-between; align-items: center; }
.copyhead .lbl { margin: 0; }
.copybtn { background: #AE001B; border: none; color: #fff; padding: 10px 18px; cursor: pointer; font-family: 'Poppins'; font-weight: 700; font-size: 13px; clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%); }
.copybtn:hover { background: #D1122F; }
.modal { position: fixed; inset: 0; background: rgba(0,0,0,.75); display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 50; }
.modalbox { background: #17171D; border: 1px solid #33333D; max-width: 900px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; }
.modalhead { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 12px 14px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #B9B9C4; border-bottom: 1px solid #23232B; }
.modalclose { background: none; border: none; color: #8D8D99; font-size: 16px; cursor: pointer; }
.modalclose:hover { color: #fff; }
.exportbox { max-width: 400px; }
.modalbody { padding: 16px 14px; }
.modalbtns { padding: 12px 14px; display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #23232B; }
.toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #AE001B; color: #fff; padding: 10px 22px; font-weight: 600; font-size: 13px; box-shadow: 0 8px 30px rgba(0,0,0,.5); animation: pop .2s ease; }
@keyframes pop { from { opacity: 0; transform: translate(-50%, 8px); } }
@media (prefers-reduced-motion: reduce) { .toast { animation: none; } }
`;

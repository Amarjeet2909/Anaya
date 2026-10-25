const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');

for (const [width, height] of [[320, 568], [390, 844], [768, 1024], [1440, 900]]) {
  const nodes = {};
  function element() {
    return {
      children: [],
      style: { setProperty() {}, removeProperty() {} },
      classList: { add() {}, remove() {} },
      listeners: {},
      addEventListener(name, callback) { this.listeners[name] = callback; },
      getBoundingClientRect() { return { left: 100, top: 300, right: 200, bottom: 350, width: 100, height: 50 }; },
      appendChild(child) { this.children.push(child); },
      replaceChildren() { this.children = []; }, focus() {},
      play() { this.playing = true; return Promise.resolve(); },
      matches() { return !!this.popoverOpen; },
      showPopover() { this.popoverOpen = true; },
      hidePopover() { this.popoverOpen = false; },
      showModal() { this.open = true; },
      close() { this.open = false; }
    };
  }
  const document = {
    getElementById(id) { return nodes[id] ??= element(); },
    createElement: element,
    createDocumentFragment: element
  };
  const window = {
    innerWidth: width, innerHeight: height,
    matchMedia() { return { matches: width === 320 }; },
    addEventListener() {}
  };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'script.js'), 'utf8'), {
    document, window, performance: { now: () => 1000 }, setTimeout: () => 1, clearTimeout() {}, Math
  });
  nodes.noButton.listeners.pointerdown({ preventDefault() {}, clientX: 150, clientY: 325 });
  const x = parseFloat(nodes.noButton.style.left);
  const y = parseFloat(nodes.noButton.style.top);
  assert.ok(x >= 14 && x + 100 <= width - 14, 'No stays within horizontal bounds');
  assert.ok(y >= 14 && y + 50 <= height - 14, 'No stays within vertical bounds');
  assert.ok(!(x < 224 && x + 100 > 76 && y < 374 && y + 50 > 276), 'No does not cover Yes');
  nodes.yesButton.listeners.click();
  assert.equal(nodes.celebration.open, true);
  assert.equal(nodes.noButton.hidden, true);
  assert.equal(nodes.loveSong.playing, true, 'Yes starts the song');
  assert.equal(nodes.loveSong.loop, true, 'Song is set to repeat');
  if (width !== 320) {
    assert.equal(nodes.confetti.popoverOpen, true, 'Hearts are above the modal');
    assert.equal(nodes.confetti.children[0].children.length, 110, 'Celebration creates 110 hearts and sparkles');
  }
  nodes.keepMoment.listeners.click();
  assert.equal(nodes.celebration.open, false);
  assert.equal(nodes.loveSong.playing, true, 'Closing does not stop the music');
  console.log(`PASS: ${width}x${height} runaway bounds, acceptance, looping music, hearts, and closing`);
}
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  if (!match[1].startsWith('http')) assert.ok(fs.existsSync(path.join(root, match[1])), match[1]);
}
console.log('PASS: all local asset references');

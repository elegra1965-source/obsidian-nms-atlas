'use strict';
const { Plugin, Notice } = require('obsidian');

module.exports = class NMSDiscoveryToast extends Plugin {
  async onload() {
    // brief debounce so a burst of modify events = one toast
    let last = 0;
    const fire = (msg) => {
      const now = Date.now();
      if (now - last < 1500) return;
      last = now;
      new Notice('◆ ' + msg, 2200);
    };

    this.registerEvent(this.app.vault.on('create', (f) => {
      if (f && f.extension === 'md') fire('ENTRY REGISTERED — ' + f.basename);
    }));

    // "modify" fires on save; keep it gentle
    this.registerEvent(this.app.vault.on('modify', (f) => {
      if (f && f.extension === 'md') fire('DATA SYNCED — ' + f.basename);
    }));
  }
};

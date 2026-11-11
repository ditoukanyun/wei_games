
'use strict';
const fs = require('fs');
const path = require('path');
let timer;
let disposed = false;

async function repairImportedAssets() {
    try {
        if (disposed) return;
        const registry = await Editor.Message.request('asset-db', 'query-all-importer');
        if (!['effect', 'scene', 'typescript'].every(name => registry.includes(name))) {
            throw new Error('Creator asset importers are still unavailable');
        }
        // These files can have been scanned as unknown before project extensions load.
        const effects = await Editor.Message.request('asset-db', 'query-assets', { pattern: 'db://internal/**/*.effect' });
        const custom = await Editor.Message.request('asset-db', 'query-asset-info', 'db://assets/resources/workshop/enamel.effect');
        const scripts = await Editor.Message.request('asset-db', 'query-assets', { pattern: 'db://assets/**/*.ts' });
        for (const asset of effects.concat(custom ? [custom] : [], scripts)) {
            if (disposed) return;
            await Editor.Message.request('asset-db', 'reimport-asset', asset.uuid);
        }
        if (disposed) return;
        fs.writeFileSync(path.join(Editor.Project.path, '.optimization-backup/workshop/importer-health.json'), JSON.stringify({
            repairedAt: new Date().toISOString(), importers: registry.length,
            effects: effects.length + (custom ? 1 : 0), scripts: scripts.length
        }, null, 2));
        console.info('[WorkshopImporters] Asset import recovery complete');
        Editor.Message.send('scene', 'soft-reload');
        Editor.Message.send('preview', 'reload-terminal');
    } catch (error) {
        console.error('[WorkshopImporters] Asset import recovery failed', error);
    }
}
exports.load = () => {
    disposed = false;
    // Allow built-in and project contributions to finish registering with the worker.
    timer = setTimeout(repairImportedAssets, 6000);
};
exports.unload = () => { disposed = true; clearTimeout(timer); };

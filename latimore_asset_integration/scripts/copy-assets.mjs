#!/usr/bin/env node
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
const exts = { images:['.png','.jpg','.jpeg','.webp','.gif','.svg','.ico','.avif'], fonts:['.woff','.woff2','.ttf','.otf','.eot'], css:['.css','.scss'], manifest:['.webmanifest','.json'] };
const SRC = process.argv[2];
if(!SRC){ console.error('Usage: node latimore_asset_integration/scripts/copy-assets.mjs <srcDir>'); process.exit(1); }
const repoRoot = process.cwd();
const dests = { brand:path.join(repoRoot,'public','latimore','brand'), images:path.join(repoRoot,'public','latimore','images'), fonts:path.join(repoRoot,'public','fonts'), root:path.join(repoRoot,'public'), globalsAppend:path.join(repoRoot,'app','globals.css.append.txt'), importMap:path.join(repoRoot,'latimore_asset_integration','import-map.json') };
for (const d of [dests.brand,dests.images,dests.fonts,dests.root,path.dirname(dests.importMap)]) { await fsp.mkdir(d,{recursive:true}); }
function safeName(p){ return p.replace(/[^a-zA-Z0-9._/-]+/g,'-'); }
async function copyFileWithDedup(src, destDir, baseName) {
    await fsp.mkdir(destDir, { recursive: true })
  
    const { name, ext } = path.parse(baseName)
    let i = 0
    let out = path.join(destDir, baseName)
  
    while (fs.existsSync(out)) {
      i += 1
      out = path.join(destDir, `${name}-${i}${ext}`)
    }
  
    await fsp.copyFile(src, out)
    return out
  }
const importMap={records:[]};
async function walk(dir){ const ents=await fsp.readdir(dir,{withFileTypes:true}); for(const e of ents){ const full=path.join(dir,e.name); if(e.isDirectory()){ await walk(full); continue; } const ext=path.extname(e.name).toLowerCase(); const rel=path.relative(SRC,full); const safeRel=safeName(rel); let target=null; if(exts.images.includes(ext)){ const isBrand=/logo|brand|icon/i.test(full)||/brand|logo/.test(path.dirname(rel)); const destDir=isBrand?dests.brand:path.join(dests.images,path.dirname(safeRel)); target=await copyFileWithDedup(full,destDir,path.basename(safeRel)); } else if(exts.fonts.includes(ext)){ target=await copyFileWithDedup(full,dests.fonts,path.basename(safeRel)); } else if(exts.css.includes(ext)){ const cssText=await fsp.readFile(full,'utf8'); await fsp.appendFile(dests.globalsAppend, `\n/* From ${rel} */\n`+cssText+'\n'); target=path.join('app','globals.css (APPEND NOTE)'); } else if(exts.manifest.includes(ext) && /manifest|site\.webmanifest|favicon|icon/i.test(e.name)){ target=await copyFileWithDedup(full,dests.root,path.basename(safeRel)); } else if(ext==='.ico'){ target=await copyFileWithDedup(full,dests.root,'favicon.ico'); } else { continue; } importMap.records.push({source:rel.replaceAll('\\','/'), dest:path.relative(repoRoot,target).replaceAll('\\','/')}); } }
await walk(SRC);
await fsp.writeFile(dests.importMap, JSON.stringify(importMap,null,2));
console.log(`Imported ${importMap.records.length} assets. Map written to ${path.relative(repoRoot,dests.importMap)}`);

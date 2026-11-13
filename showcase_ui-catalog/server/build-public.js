// build-public.js
//
// THE PUBLIC COPY OF THE PROJECT (npm run public).
// Copies the project (ui-catalog/ and showcase_ui-catalog/) into the folder uicatalog/ next to them, without private
// and working files, and packs the same files into client/assets/uicatalog.zip (the Home page's "Download .zip archive").
// The uicatalog/ folder is the content of the public repositories (GitHub, GitLab): its own .git folder, if there is
// one, is kept; everything else is replaced at every run. The private repository ignores uicatalog/ (.gitignore).
// Left out (EXCLUDED_*): installed packages, settings with secrets (.env), local contact messages, the working
// documents (decisions, repository assessments, notes), status reports, system and editor files, logs.
// No packages needed: the zip is written with Node's zlib.

import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync } from 'node:zlib';

const SHOWCASE = path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ROOT = path.resolve(SHOWCASE,'..');
const PUBLIC_NAME = 'uicatalog';
const PUBLIC_FOLDER = path.join(ROOT,PUBLIC_NAME);
const ZIP_FILE = path.join(SHOWCASE,'client','assets',`${PUBLIC_NAME}.zip`);
const SOURCES = [ 'ui-catalog', 'showcase_ui-catalog' ];
const ROOT_FILES = [ '.gitattributes', '.gitignore', 'README.md' ];

// Folders left out wherever they are.
const EXCLUDED_FOLDERS = new Set([ 'node_modules', '.git', '.vscode', '.idea', '.cache', '.npm', 'coverage', '.nyc_output', 'tmp', 'temp', 'logs' ]);
// Files left out wherever they are.
const EXCLUDED_FILES = [ /^\.DS_Store$/, /^Thumbs\.db$/i, /^Desktop\.ini$/i, /\.(log|tmp|bak|swp|swo)$/i, /^\.env(?!\.example$)(\..*)?$/ ];
// Paths left out (relative to the project folder, with /).
const EXCLUDED_PATHS = [
    'showcase_ui-catalog/server/messages',               // contact messages received while testing (names, e-mail addresses)
    'showcase_ui-catalog/DECISIONS.md',                  // working decisions
    'showcase_ui-catalog/REPOSITORY-ASSESSMENTS.md',     // notes on other repositories
    'showcase_ui-catalog/UI-CATALOG-TYPOGRAPHY-RULE.md', // working note
    'ui-catalog/source/UI-CATALOG-SYSTEM-CSS-NOTICE.md', // working note
    `showcase_ui-catalog/client/assets/${PUBLIC_NAME}.zip` // the archive itself
];
const EXCLUDED_PATTERNS = [ /^ui-catalog\/reports\/status-[^/]*\.md$/ ]; // on-demand status reports (release records stay)

// Returns whether a project path (with /) is left out.
function isExcluded( relative, isFolder )
{
    const name = relative.split('/').pop();
    if ( isFolder && EXCLUDED_FOLDERS.has(name) ) { return true; }
    if ( !isFolder && EXCLUDED_FILES.some(pattern => pattern.test(name)) ) { return true; }
    return EXCLUDED_PATHS.includes(relative) || EXCLUDED_PATTERNS.some(pattern => pattern.test(relative));
}

// Lists the files of a project folder that are included (paths with /), sorted.
function listFiles( relative )
{
    const files = [];
    for ( const entry of readdirSync(path.join(ROOT,relative),{ withFileTypes:true }) )
    {
        const child = `${relative}/${entry.name}`;
        if ( isExcluded(child,entry.isDirectory()) ) { continue; }
        if ( entry.isDirectory() ) { files.push(...listFiles(child)); }
        else if ( entry.isFile() ) { files.push(child); }
    }
    return files.sort();
}

// CRC-32 of a buffer (the checksum a zip stores for every file).
const CRC_TABLE = Array.from({ length:256 },( unused, index ) =>
{
    let value = index;
    for ( let bit = 0; bit < 8; bit++ ) { value = value & 1 ? 0xEDB88320 ^ ( value >>> 1 ) : value >>> 1; }
    return value >>> 0;
});
function crc32( buffer )
{
    let crc = 0xFFFFFFFF;
    for ( const byte of buffer ) { crc = CRC_TABLE[( crc ^ byte ) & 0xFF] ^ ( crc >>> 8 ); }
    return ( crc ^ 0xFFFFFFFF ) >>> 0;
}

// Writes a zip file from [ { name, data } ]; every entry gets the same date (today, 00:00).
function writeZip( target, entries )
{
    const now = new Date();
    const dosTime = 0;
    const dosDate = ( ( now.getFullYear() - 1980 ) << 9 ) | ( ( now.getMonth() + 1 ) << 5 ) | now.getDate();
    const parts = [];
    const central = [];
    let offset = 0;
    for ( const { name, data } of entries )
    {
        const nameBytes = Buffer.from(name,'utf8');
        const packed = deflateRawSync(data,{ level:9 });
        const stored = packed.length >= data.length;
        const body = stored ? data : packed;
        const crc = crc32(data);
        const local = Buffer.alloc(30);
        local.writeUInt32LE(0x04034B50,0); local.writeUInt16LE(20,4); local.writeUInt16LE(0x0800,6); local.writeUInt16LE(stored ? 0 : 8,8);
        local.writeUInt16LE(dosTime,10); local.writeUInt16LE(dosDate,12); local.writeUInt32LE(crc,14);
        local.writeUInt32LE(body.length,18); local.writeUInt32LE(data.length,22); local.writeUInt16LE(nameBytes.length,26); local.writeUInt16LE(0,28);
        const header = Buffer.alloc(46);
        header.writeUInt32LE(0x02014B50,0); header.writeUInt16LE(20,4); header.writeUInt16LE(20,6); header.writeUInt16LE(0x0800,8); header.writeUInt16LE(stored ? 0 : 8,10);
        header.writeUInt16LE(dosTime,12); header.writeUInt16LE(dosDate,14); header.writeUInt32LE(crc,16);
        header.writeUInt32LE(body.length,20); header.writeUInt32LE(data.length,24); header.writeUInt16LE(nameBytes.length,28);
        header.writeUInt32LE(offset,42);
        parts.push(local,nameBytes,body);
        central.push(header,nameBytes);
        offset += local.length + nameBytes.length + body.length;
    }
    const centralSize = central.reduce(( sum, part ) => sum + part.length,0);
    const end = Buffer.alloc(22);
    end.writeUInt32LE(0x06054B50,0); end.writeUInt16LE(entries.length,8); end.writeUInt16LE(entries.length,10);
    end.writeUInt32LE(centralSize,12); end.writeUInt32LE(offset,16);
    writeFileSync(target,Buffer.concat([ ...parts, ...central, end ]));
}

// Empties the public folder, keeping its .git folder (the public repository's history).
function clearPublicFolder()
{
    mkdirSync(PUBLIC_FOLDER,{ recursive:true });
    for ( const entry of readdirSync(PUBLIC_FOLDER) )
    {
        if ( entry !== '.git' ) { rmSync(path.join(PUBLIC_FOLDER,entry),{ recursive:true, force:true }); }
    }
}

const files = [ ...ROOT_FILES.filter(file => { try { return statSync(path.join(ROOT,file)).isFile(); } catch { return false; } }), ...SOURCES.flatMap(listFiles) ];
// The licence also at the top, where GitHub and GitLab look for it.
const copies = [ ...files.map(file => ({ from:file, to:file })), { from:'ui-catalog/LICENSE', to:'LICENSE' } ];

clearPublicFolder();
const entries = [];
for ( const { from, to } of copies )
{
    const target = path.join(PUBLIC_FOLDER,to);
    mkdirSync(path.dirname(target),{ recursive:true });
    copyFileSync(path.join(ROOT,from),target);
    entries.push({ name:`${PUBLIC_NAME}/${to}`, data:readFileSync(path.join(ROOT,from)) });
}
writeZip(ZIP_FILE,entries);

const size = statSync(ZIP_FILE).size;
console.log(`Public copy: ${entries.length} files in ${path.relative(ROOT,PUBLIC_FOLDER)}/ and ${path.relative(ROOT,ZIP_FILE)} (${( size / 1024 / 1024 ).toFixed(1)} MB).`);
console.log(`Left out: ${[ ...EXCLUDED_FOLDERS ].join(', ')}, .env, ${EXCLUDED_PATHS.slice(0,-1).join(', ')}, ui-catalog/reports/status-*.md, system and editor files.`);

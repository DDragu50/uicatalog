// uploadFilesFiles.js
//
// PURE HELPERS.
// File types (the accept list, matching a file against it, the icon of a file, the readable list of accepted types),
// sizes written in the user's language ("4.2 MB"), text placeholders. No DOM access, no state.

// Replaces {name} placeholders of a text.
export function fillText( text, values ) { return String(text ?? '').replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match)); }

// Splits accept (a string "a,b" or an array) into lowercase tokens; reports invalid ones through onInvalid.
export function parseAccept( accept, onInvalid )
{
    const tokens = ( Array.isArray(accept) ? accept : String(accept ?? '').split(',') ).map(token => String(token ?? '').trim().toLowerCase()).filter(Boolean);
    return tokens.filter(token =>
    {
        const valid = /^\.[a-z0-9][a-z0-9.+_-]*$/.test(token) || /^[a-z]+\/(\*|[a-z0-9][a-z0-9.+_-]*)$/.test(token);
        if ( !valid ) { onInvalid(token); }
        return valid;
    });
}

// Returns whether a file { name, type } matches the accept tokens (none: every file).
export function isAccepted( file, tokens )
{
    if ( !tokens.length ) { return true; }
    const name = String(file.name ?? '').toLowerCase(), type = String(file.type ?? '').toLowerCase();
    return tokens.some(token =>
    {
        if ( token.startsWith('.') ) { return name.endsWith(token); }
        if ( token.endsWith('/*') ) { return type.startsWith(token.slice(0,-1)); }
        return type === token;
    });
}

// Returns whether the accept tokens allow images (for the camera option).
export function acceptsImages( tokens ) { return !tokens.length || tokens.some(token => token === 'image/*' || token.startsWith('image/') || [ '.jpg', '.jpeg', '.png', '.heic', '.webp' ].includes(token)); }

// Returns the readable list of accepted types: "PDF, DOCX or images".
export function describeAccept( tokens, texts )
{
    const names = tokens.map(token =>
    {
        if ( token.startsWith('.') ) { return token.slice(1).toUpperCase(); }
        const [ group, sub ] = token.split('/');
        if ( sub === '*' ) { return texts.typeGroups[group] ?? `${group} files`; }
        return sub.split(/[.+-]/).pop().toUpperCase();
    }).filter(( name, index, list ) => list.indexOf(name) === index);
    return names.length > 1 ? `${names.slice(0,-1).join(', ')}${texts.or}${names[names.length - 1]}` : names[0] ?? '';
}

// Writes a size in bytes in the user's language: "820 kB", "4.2 MB" (units of 1000, as file managers show them).
export function formatSize( bytes, locale )
{
    const units = [ 'byte', 'kilobyte', 'megabyte', 'gigabyte' ];
    let value = Math.max(0,Number(bytes) || 0), index = 0;
    while ( value >= 1000 && index < units.length - 1 ) { value /= 1000; index++; }
    // bytes: "300 B" (the short "byte" unit reads "300 byte" in some browsers)
    try { if ( index === 0 ) { return `${new Intl.NumberFormat(locale || undefined).format(value)} B`; } return new Intl.NumberFormat(locale || undefined,{ style:'unit', unit:units[index], unitDisplay:'short', maximumFractionDigits:value < 10 && index > 0 ? 1 : 0 }).format(value); }
    catch { return `${Math.round(value)} ${[ 'B', 'kB', 'MB', 'GB' ][index]}`; }
}

// Returns the Font Awesome icon of a file by its type or extension.
export function fileIcon( file )
{
    const type = String(file.type ?? '').toLowerCase(), name = String(file.name ?? '').toLowerCase();
    const extension = name.includes('.') ? name.slice(name.lastIndexOf('.') + 1) : '';
    if ( type.startsWith('image/') ) { return 'fa-regular fa-file-image'; }
    if ( type.startsWith('video/') ) { return 'fa-regular fa-file-video'; }
    if ( type.startsWith('audio/') ) { return 'fa-regular fa-file-audio'; }
    if ( type === 'application/pdf' || extension === 'pdf' ) { return 'fa-regular fa-file-pdf'; }
    if ( [ 'doc', 'docx', 'odt', 'rtf' ].includes(extension) ) { return 'fa-regular fa-file-word'; }
    if ( [ 'xls', 'xlsx', 'ods', 'csv' ].includes(extension) ) { return 'fa-regular fa-file-excel'; }
    if ( [ 'ppt', 'pptx', 'odp' ].includes(extension) ) { return 'fa-regular fa-file-powerpoint'; }
    if ( [ 'zip', 'rar', '7z', 'gz', 'tar' ].includes(extension) ) { return 'fa-regular fa-file-zipper'; }
    if ( type.startsWith('text/') || [ 'txt', 'md', 'json', 'xml' ].includes(extension) ) { return 'fa-regular fa-file-lines'; }
    return 'fa-regular fa-file';
}

// Returns whether a file is an image the browser can show as a preview.
export function isPreviewable( file ) { return /^image\/(png|jpe?g|gif|webp|avif|bmp|svg\+xml)$/.test(String(file.type ?? '').toLowerCase()); }

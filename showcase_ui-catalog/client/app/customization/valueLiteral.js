// valueLiteral.js
//
// VALUE LITERALS.
// Reads and writes object and list values the way the READMEs write them: { key:'edit', label:'Edit' }, [ 'a', 'b' ],
// with single or double quotes, unquoted keys, trailing commas and comments. Strict JSON is accepted too.
// Template strings (`…`) are kept as plain text. Nothing is ever executed: functions and variables are rejected.
// Pure functions without DOM access.

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;
const ESCAPES = { n:'\n', t:'\t', r:'\r', b:'\b', f:'\f', v:'\v', 0:'\0' };

// Parses a value literal; returns the value, or throws an Error whose message names the position of the problem.
export function parseValueLiteral( text )
{
    const source = String(text ?? '');
    let index = 0;

    // Throws a readable error at the current position.
    const fail = expected => { throw new Error(`${expected} expected at character ${index + 1}`); };

    // Skips spaces, line breaks and // or /* */ comments.
    function skip()
    {
        for ( ;; )
        {
            while ( index < source.length && /\s/.test(source[index]) ) { index++; }
            if ( source.startsWith('//',index) ) { while ( index < source.length && source[index] !== '\n' ) { index++; } continue; }
            if ( source.startsWith('/*',index) ) { const end = source.indexOf('*/',index + 2); index = end < 0 ? source.length : end + 2; continue; }
            return;
        }
    }

    // Reads a quoted string ('…', "…" or `…`); template placeholders stay as text.
    function readString()
    {
        const quote = source[index++];
        let result = '';
        while ( index < source.length && source[index] !== quote )
        {
            const character = source[index++];
            if ( character !== '\\' ) { result += character; continue; }
            const next = source[index++];
            if ( next === 'u' ) { result += String.fromCharCode(parseInt(source.slice(index,index + 4),16)); index += 4; }
            else { result += ESCAPES[next] ?? next; }
        }
        if ( source[index] !== quote ) { fail(`closing ${quote}`); }
        index++;
        return result;
    }

    // Reads a number.
    function readNumber()
    {
        const match = source.slice(index).match(/^-?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/);
        if ( !match ) { fail('a value'); }
        index += match[0].length;
        return Number(match[0]);
    }

    // Reads a word: true, false or null are values; anything else (variables, functions) is not allowed.
    function readWord()
    {
        const match = source.slice(index).match(/^[A-Za-z_$][\w$]*/);
        if ( !match ) { fail('a value'); }
        const words = { true:true, false:false, null:null };
        if ( !Object.hasOwn(words,match[0]) ) { throw new Error(`"${match[0]}" at character ${index + 1} is not a value (variables and functions cannot be used)`); }
        index += match[0].length;
        return words[match[0]];
    }

    // Reads an object key: a name, a quoted string or a number.
    function readKey()
    {
        if ( source[index] === '\'' || source[index] === '"' || source[index] === '`' ) { return readString(); }
        const match = source.slice(index).match(/^[A-Za-z_$][\w$]*|^\d+/);
        if ( !match ) { fail('a key'); }
        index += match[0].length;
        return match[0];
    }

    // Reads a list or an object (opening character at index) with optional trailing comma.
    function readGroup( isObject )
    {
        const close = isObject ? '}' : ']';
        const result = isObject ? {} : [];
        index++;
        for ( ;; )
        {
            skip();
            if ( source[index] === close ) { index++; return result; }
            if ( isObject )
            {
                const key = readKey();
                skip();
                if ( source[index] !== ':' ) { fail('":"'); }
                index++;
                result[key] = readValue();
            }
            else { result.push(readValue()); }
            skip();
            if ( source[index] === ',' ) { index++; continue; }
            if ( source[index] !== close ) { fail(`"," or "${close}"`); }
        }
    }

    // Reads any value.
    function readValue()
    {
        skip();
        const character = source[index];
        if ( character === '{' ) { return readGroup(true); }
        if ( character === '[' ) { return readGroup(false); }
        if ( character === '\'' || character === '"' || character === '`' ) { return readString(); }
        if ( character === '-' || character === '.' || /\d/.test(character ?? '') ) { return readNumber(); }
        return readWord();
    }

    const value = readValue();
    skip();
    if ( index < source.length ) { fail('the end of the value'); }
    return value;
}

// Writes a string with single quotes, escaping what needs escaping.
function writeString( value ) { return `'${value.replace(/\\/g,'\\\\').replace(/'/g,'\\\'').replace(/\n/g,'\\n')}'`; }

// Writes a value literal in the README style; short objects and lists stay on one line.
export function formatValueLiteral( value, indent = '' )
{
    if ( value === null || typeof value === 'boolean' || typeof value === 'number' ) { return String(value); }
    if ( typeof value === 'string' ) { return writeString(value); }
    const inner = `${indent}    `;
    if ( Array.isArray(value) )
    {
        if ( !value.length ) { return '[]'; }
        const items = value.map(item => formatValueLiteral(item,inner));
        const line = `[ ${items.join(', ')} ]`;
        return line.length <= 100 && !line.includes('\n') ? line : `[\n${items.map(item => `${inner}${item}`).join(',\n')}\n${indent}]`;
    }
    const entries = Object.entries(value).filter(( [ , item ] ) => item !== undefined);
    if ( !entries.length ) { return '{}'; }
    const parts = entries.map(( [ key, item ] ) => `${IDENTIFIER.test(key) ? key : writeString(key)}:${formatValueLiteral(item,inner)}`);
    const line = `{ ${parts.join(', ')} }`;
    return line.length <= 100 && !line.includes('\n') ? line : `{\n${parts.map(part => `${inner}${part}`).join(',\n')}\n${indent}}`;
}

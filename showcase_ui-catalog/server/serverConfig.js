// serverConfig.js
//
// CONFIGURATION CONTRACT.
// Folders and settings of the local server and the tools, read once from .env (optional) with safe defaults.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reportServerIssue } from './serverErrors.js';

const SERVER_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_DIR = path.resolve(SERVER_DIR,'..');

// Default settings; .env may change PORT, NODE_ENV and UI_CATALOG_SOURCE.
export const DEFAULT_SERVER_CONFIG =
{
    port:3003,
    environment:'development',
    source:'../ui-catalog/source'
};

// Contact-form rules; the client uses the same limits (client/app/appConfig.js, APP_CONFIG.contact).
export const CONTACT_RULES =
{
    maxBodyBytes:20000,
    rateLimitWindowMs:15 * 60 * 1000,
    rateLimitMax:5,
    fields:
    {
        name:{ mandatory:true, maxLength:100 },
        email:{ mandatory:true, maxLength:254, pattern:/^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        subject:{ mandatory:false, maxLength:150 },
        message:{ mandatory:true, minLength:10, maxLength:5000 }
    }
};

// Loads .env from the project folder when it exists (built into Node.js 20.12 and later).
function loadEnvironment()
{
    try { process.loadEnvFile(path.join(PROJECT_DIR,'.env')); }
    catch ( error ) { if ( error.code !== 'ENOENT' ) { reportServerIssue('INVALID_SETTING',{ key:'.env', value:error.message, fallback:'defaults' }); } }
}

// Returns the configured port, or the default with a warning when the value is not a valid port number.
function normalizePort( value )
{
    if ( value === undefined || value === '' ) { return DEFAULT_SERVER_CONFIG.port; }
    const port = Number(value);
    if ( Number.isInteger(port) && port > 0 && port < 65536 ) { return port; }
    reportServerIssue('INVALID_SETTING',{ key:'PORT', value, fallback:DEFAULT_SERVER_CONFIG.port });
    return DEFAULT_SERVER_CONFIG.port;
}

// Builds the frozen configuration used by the server and the tools.
function createServerConfig()
{
    loadEnvironment();
    const clientDir = path.join(PROJECT_DIR,'client');
    return Object.freeze(
    {
        port:normalizePort(process.env.PORT),
        environment:String(process.env.NODE_ENV || DEFAULT_SERVER_CONFIG.environment),
        projectDir:PROJECT_DIR,
        serverDir:SERVER_DIR,
        clientDir,
        sourceDir:path.resolve(PROJECT_DIR,process.env.UI_CATALOG_SOURCE || DEFAULT_SERVER_CONFIG.source),
        componentsDir:path.join(clientDir,'components'),
        appStylingDir:path.join(clientDir,'local-styling'),
        showcaseStylingDir:path.join(clientDir,'showcase-styling'),
        contentDir:path.join(clientDir,'content'),
        adjustmentsDir:path.join(clientDir,'adjustments'),
        catalogFile:path.join(clientDir,'data','catalog.json'),
        catalogRulesFile:path.join(SERVER_DIR,'catalog-rules.json'),
        messagesDir:path.join(SERVER_DIR,'messages')
    });
}

export const SERVER_CONFIG = createServerConfig();

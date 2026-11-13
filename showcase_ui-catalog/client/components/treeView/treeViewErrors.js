// treeViewErrors.js
//
// ERROR CATALOG.
// User errors (validation, children loading) and every developer error and warning TreeView can generate.
//
// source:     "validation" = the user's selection; "component" = loading children failed; "developer" = configuration or usage.
// severity:   "error" = component not rendered; "warning" = value normalized or ignored, rendering continues.
// visibility: corrective (until corrected), console (developer errors and warnings).
// Labels are UPPER_SNAKE_CASE, unique within the component and never renamed (retire instead).

export const TREE_VIEW_ERRORS =
{
    REQUIRED_SELECTION:{ errorLabel:'REQUIRED_SELECTION', source:'validation', severity:'error', visibility:'corrective' },
    EXTERNAL:          { errorLabel:'EXTERNAL', source:'validation', severity:'error', visibility:'corrective' }
};

export const TREE_VIEW_DEVELOPER_ERRORS =
{
    CONTAINER_REQUIRED:{ errorLabel:'CONTAINER_REQUIRED', message:'container is required.', source:'developer', severity:'error', visibility:'console' },
    ID_REQUIRED:       { errorLabel:'ID_REQUIRED', message:'config.id is required.', source:'developer', severity:'error', visibility:'console' },
    UNSAFE_ID:         { errorLabel:'UNSAFE_ID', message:'id must start with a letter and contain only letters, digits, "_", ":", "." or "-".', source:'developer', severity:'error', visibility:'console' },
    DUPLICATE_ID:      { errorLabel:'DUPLICATE_ID', message:'an element with this id already exists in the document.', source:'developer', severity:'error', visibility:'console' },
    LABEL_REQUIRED:    { errorLabel:'LABEL_REQUIRED', message:'label is required when the tree is a mandatory selection.', source:'developer', severity:'error', visibility:'console' },
    LABEL_MISSING:     { errorLabel:'LABEL_MISSING', message:'no label or ariaLabel; the tree is named "{value}" (texts.tree).', source:'developer', severity:'warning', visibility:'console' },
    INVALID_OPTION:    { errorLabel:'INVALID_OPTION', message:'invalid {key} "{value}"; "{fallback}" is used.', source:'developer', severity:'warning', visibility:'console' },
    OPTION_IGNORED:    { errorLabel:'OPTION_IGNORED', message:'{key} is ignored when {condition}.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_ICON_CLASS:{ errorLabel:'INVALID_ICON_CLASS', message:'{key} contains invalid CSS class tokens; they are dropped.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_ITEM:      { errorLabel:'INVALID_ITEM', message:'item at {value} has no id or label; dropped with its children.', source:'developer', severity:'warning', visibility:'console' },
    DUPLICATE_ITEM_ID: { errorLabel:'DUPLICATE_ITEM_ID', message:'duplicate item id "{value}"; the later item is dropped with its children.', source:'developer', severity:'warning', visibility:'console' },
    SINGLE_SELECTED:   { errorLabel:'SINGLE_SELECTED', message:'selectionMode="SINGLE" allows one selected item; only "{value}" is selected.', source:'developer', severity:'warning', visibility:'console' },
    INVALID_ACTION:    { errorLabel:'INVALID_ACTION', message:'{key}[{value}] has no key or label; dropped.', source:'developer', severity:'warning', visibility:'console' },
    DUPLICATE_ACTION_KEY:{ errorLabel:'DUPLICATE_ACTION_KEY', message:'duplicate key "{value}" in {key}; the later action is dropped.', source:'developer', severity:'warning', visibility:'console' },
    UNKNOWN_ITEM:      { errorLabel:'UNKNOWN_ITEM', message:'no item with id "{value}".', source:'developer', severity:'warning', visibility:'console' },
    LOAD_FAILED:       { errorLabel:'LOAD_FAILED', message:'loadChildren failed for "{value}": {reason}', source:'developer', severity:'warning', visibility:'console' },
    UNKNOWN_ACTION:      { errorLabel:'UNKNOWN_ACTION', message:'no action with key "{value}".', source:'developer', severity:'warning', visibility:'console' },
    ACTION_HANDLER_MISSING: { errorLabel:'ACTION_HANDLER_MISSING', message:'{key} without {callback}; the action Buttons are rendered disabled.', source:'developer', severity:'warning', visibility:'console' }
};

// Returns a copy of a user error with its message from texts.errors.
export function getTreeViewError( errorLabel, config, message = '' )
{
    return { ...TREE_VIEW_ERRORS[errorLabel], message:message || config.texts.errors[errorLabel] };
}

// Formats a developer catalog message, writes it to the console by severity and returns its label.
export function reportTreeViewIssue( errorLabel, values = {} )
{
    const definition = TREE_VIEW_DEVELOPER_ERRORS[errorLabel];
    const message = definition.message.replace(/\{(\w+)\}/g,( match, key ) => String(values[key] ?? match));
    const text = `TreeView${values.id ? ` "${values.id}"` : ''} [${errorLabel}]: ${message}`;
    if ( definition.severity === 'error' ) { console.error(text); } else { console.warn(text); }
    return errorLabel;
}

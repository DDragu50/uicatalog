// tooltipPosition.js
//
// PURE HELPERS.
// Where the tooltip goes: the preferred side (START / END resolved by the text direction), the opposite side when the
// preferred one has no room, a shift along the side to stay inside the window, and the arrow's offset from the
// tooltip's edge so it keeps pointing at the target's centre. No DOM access.

// Returns the physical side (TOP, BOTTOM, LEFT, RIGHT) of a placement in a text direction.
export function physicalSide( placement, rtl )
{
    if ( placement === 'START' ) { return rtl ? 'RIGHT' : 'LEFT'; }
    if ( placement === 'END' ) { return rtl ? 'LEFT' : 'RIGHT'; }
    return placement;
}

const OPPOSITE = { TOP:'BOTTOM', BOTTOM:'TOP', LEFT:'RIGHT', RIGHT:'LEFT' };

// Computes { side, left, top, arrow } for a target rectangle { left, top, right, bottom, width, height }, a tooltip
// size { width, height }, a window size { width, height }, the preferred physical side, the gap between target and
// tooltip, the margin kept from the window edges and the smallest distance of the arrow from the tooltip's corners.
export function computeTooltipPosition( target, size, view, side, gap, margin, arrowInset )
{
    const room = { TOP:target.top - gap - margin, BOTTOM:view.height - target.bottom - gap - margin, LEFT:target.left - gap - margin, RIGHT:view.width - target.right - gap - margin };
    const needed = s => ( s === 'TOP' || s === 'BOTTOM' ? size.height : size.width );
    let used = side;
    if ( room[side] < needed(side) && room[OPPOSITE[side]] >= needed(side) ) { used = OPPOSITE[side]; }
    const clamp = ( value, min, max ) => Math.min(Math.max(value,min),Math.max(min,max));
    let left, top, arrow;
    if ( used === 'TOP' || used === 'BOTTOM' )
    {
        const centre = target.left + target.width / 2;
        left = clamp(centre - size.width / 2,margin,view.width - size.width - margin);
        top = used === 'TOP' ? target.top - gap - size.height : target.bottom + gap;
        arrow = clamp(centre - left,arrowInset,size.width - arrowInset);
    }
    else
    {
        const centre = target.top + target.height / 2;
        top = clamp(centre - size.height / 2,margin,view.height - size.height - margin);
        left = used === 'LEFT' ? target.left - gap - size.width : target.right + gap;
        arrow = clamp(centre - top,arrowInset,size.height - arrowInset);
    }
    return { side:used, left:Math.round(left), top:Math.round(top), arrow:Math.round(arrow) };
}

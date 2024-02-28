function getPos(c: string) {
    const KEY_MAP = [
        '1234567890@',
        'QWERTYUIOP=',
        'ASDFGHJKL&;',
        'ZXCVBNM*#!?',
    ];
    for (let y = 0; y < KEY_MAP.length; y++) {
        const x = KEY_MAP[y].indexOf(c);
        if (x !== -1) {
            return [x, y] as const;
        }
    }
}

function makeCodeKey(code: string) {
    let x = 0;
    let y = 0;
    const out: string[] = [];
    const t = '0.05';
    const tm = `${t}s\n${t}s\n`

    for (const i of code) {
        const pos = getPos(i);
        if (pos === undefined) {
            continue;
        }

        const dx = pos[0] - x;
        const dy = pos[1] - y;

        if (dx > 0) {
            out.push(`DPAD_RIGHT ${tm}`.repeat(dx));
        } else if (dx < 0) {
            out.push(`DPAD_LEFT ${tm}`.repeat(Math.abs(dx)));
        }

        if (dy > 0) {
            out.push(`DPAD_DOWN ${tm}`.repeat(dy));
        } else if (dy < 0) {
            out.push(`DPAD_UP ${tm}`.repeat(Math.abs(dy)));
        }

        out.push(`A ${tm}`);

        x = pos[0];
        y = pos[1];
    }

    return out.join('');
}

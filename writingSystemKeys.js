// https://wicg.github.io/keyboard-map/#h-keyboard-getlayoutmap
const getWritingSystemKeys = () => {
    return new Promise(async resolve => {
        try {
            const keys = [
                'Backquote',
                'Backslash',
                'Backspace',
                'BracketLeft',
                'BracketRight',
                'Comma',
                'Digit0',
                'Digit1',
                'Digit2',
                'Digit3',
                'Digit4',
                'Digit5',
                'Digit6',
                'Digit7',
                'Digit8',
                'Digit9',
                'Equal',
                'IntlBackslash',
                'IntlRo',
                'IntlYen',
                'KeyA',
                'KeyB',
                'KeyC',
                'KeyD',
                'KeyE',
                'KeyF',
                'KeyG',
                'KeyH',
                'KeyI',
                'KeyJ',
                'KeyK',
                'KeyL',
                'KeyM',
                'KeyN',
                'KeyO',
                'KeyP',
                'KeyQ',
                'KeyR',
                'KeyS',
                'KeyT',
                'KeyU',
                'KeyV',
                'KeyW',
                'KeyX',
                'KeyY',
                'KeyZ',
                'Minus',
                'Period',
                'Quote',
                'Semicolon',
                'Slash'
            ]
            if (!('keyboard' in navigator)) {
                return resolve()
            }
            const keyoardLayoutMap = await navigator.keyboard.getLayoutMap()
            const writingSystemKeys = keys.map(key => {
                const value = keyoardLayoutMap.get(key)
                return {
                    [key]: value
                }
            })
            return resolve(writingSystemKeys)

        } catch (error) {
            return resolve()
        }

    })
}

(async function() {
    const data = await getWritingSystemKeys()
    console.log(data)
})()

import type { CinematicState, GuiSystem, GuiControl } from '../../types';

export const createGuiSystem = (
    cinematicState: CinematicState,
    options: { registeredControls?: GuiControl[] }
): GuiSystem => {
    return {
        slider: (label, min, max, initial = 0) => {
            const id = `slider-${label}`;
            if (options.registeredControls) {
                options.registeredControls.push({ id, label, type: 'slider', min, max, value: initial });
            }
            return cinematicState.guiValues[id] ?? initial;
        },
        color: (label, initial = "#ffffff") => {
            const id = `color-${label}`;
            if (options.registeredControls) {
                options.registeredControls.push({ id, label, type: 'color', value: initial });
            }
            return cinematicState.guiValues[id] ?? initial;
        },
        checkbox: (label, initial = false) => {
            const id = `checkbox-${label}`;
            if (options.registeredControls) {
                options.registeredControls.push({ id, label, type: 'checkbox', value: initial });
            }
            return cinematicState.guiValues[id] ?? initial;
        },
        button: (label) => {
            const id = `button-${label}`;
            if (options.registeredControls) {
                options.registeredControls.push({ id, label, type: 'button', value: false });
            }
            const fired = cinematicState.guiValues[id] === true;
            if (fired) cinematicState.guiValues[id] = false; // Reset for next frame
            return fired;
        }
    };
};

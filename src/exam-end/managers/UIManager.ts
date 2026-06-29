export class UIManager {
    private clockUI: HTMLDivElement;
    private startScreen: HTMLDivElement;
    private flashlightUI: HTMLDivElement;
    private screenFlash: HTMLDivElement;
    private isNightMode: boolean = false;

    constructor() {
        this.screenFlash = document.createElement('div');
        this.screenFlash.style.position = 'absolute';
        this.screenFlash.style.top = '0';
        this.screenFlash.style.left = '0';
        this.screenFlash.style.width = '100vw';
        this.screenFlash.style.height = '100vh';
        this.screenFlash.style.backgroundColor = 'black';
        this.screenFlash.style.opacity = '0';
        this.screenFlash.style.pointerEvents = 'none';
        this.screenFlash.style.transition = 'opacity 0.28s ease-out';
        this.screenFlash.style.zIndex = '9999';
        document.body.appendChild(this.screenFlash);

        const extraStyles = document.createElement('style');
        extraStyles.innerHTML = `
        @keyframes clockFlash {
            0% { transform: translateX(0); color: white; border-color: white; }
            25% { transform: translateX(-5px); color: red; border-color: red; }
            50% { transform: translateX(5px); color: red; border-color: red; }
            75% { transform: translateX(-5px); color: red; border-color: red; }
            100% { transform: translateX(0); color: white; border-color: white; }
        }
        .clock-flash {
            animation: clockFlash 0.3s ease-in-out;
        }
        `;
        document.head.appendChild(extraStyles);

        this.clockUI = document.createElement('div');
        this.clockUI.id = 'clock-ui';
        this.clockUI.style.position = 'absolute';
        this.clockUI.style.top = '20px';
        this.clockUI.style.left = '20px';
        this.clockUI.style.width = '120px';
        this.clockUI.style.height = '120px';
        this.clockUI.style.borderRadius = '50%';
        this.clockUI.style.backgroundColor = 'rgba(0,0,0,0.5)';
        this.clockUI.style.border = '2px solid white';
        this.clockUI.style.display = 'flex';
        this.clockUI.style.flexDirection = 'column';
        this.clockUI.style.alignItems = 'center';
        this.clockUI.style.justifyContent = 'center';
        this.clockUI.style.fontSize = '30px';
        this.clockUI.style.fontFamily = 'monospace';
        this.clockUI.style.color = 'white';
        this.clockUI.style.fontWeight = 'bold';
        this.clockUI.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
        this.clockUI.style.pointerEvents = 'none';
        this.clockUI.style.zIndex = '100';
        document.body.appendChild(this.clockUI);

        this.startScreen = document.createElement('div');
        this.startScreen.id = 'start-screen';
        this.startScreen.style.position = 'absolute';
        this.startScreen.style.top = '0';
        this.startScreen.style.left = '0';
        this.startScreen.style.width = '100vw';
        this.startScreen.style.height = '100vh';
        this.startScreen.style.backgroundColor = 'rgba(0,0,0,0.8)';
        this.startScreen.style.color = 'white';
        this.startScreen.style.display = 'flex';
        this.startScreen.style.alignItems = 'center';
        this.startScreen.style.justifyContent = 'center';
        this.startScreen.style.fontSize = '30px';
        this.startScreen.style.fontFamily = 'monospace';
        this.startScreen.style.cursor = 'pointer';
        this.startScreen.style.zIndex = '9999';
        this.startScreen.innerHTML = 'Click anywhere to Start';
        document.body.appendChild(this.startScreen);

        this.flashlightUI = document.createElement('div');
        this.flashlightUI.id = 'flashlight-ui';
        this.flashlightUI.style.position = 'absolute';
        this.flashlightUI.style.bottom = '20px';
        this.flashlightUI.style.right = '20px';
        this.flashlightUI.style.fontSize = '32px';
        this.flashlightUI.style.opacity = '0';
        this.flashlightUI.style.transition = 'opacity 0.3s, filter 0.3s';
        this.flashlightUI.innerHTML = '🔦<div style="position:absolute; bottom:-4px; right:-8px; background:#111; color:#fff; font-size:12px; font-family:monospace; padding:2px 5px; border-radius:4px; font-weight:bold; border:1px solid #555; line-height:1; letter-spacing:0;">F</div>';
        this.flashlightUI.style.filter = 'grayscale(100%) opacity(0.5)';
        document.body.appendChild(this.flashlightUI);

        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    private updateClock() {
        const d = new Date();
        let hours = d.getHours();
        if (this.isNightMode) {
            hours = (hours + 12) % 24;
        }
        const hh = hours.toString().padStart(2, '0');
        const mm = d.getMinutes().toString().padStart(2, '0');
        this.clockUI.innerHTML = `${hh}:${mm}`;
    }

    public setNightMode(isNight: boolean) {
        this.isNightMode = isNight;
        this.updateClock();
    }

    public triggerClockFlash() {
        this.clockUI.classList.remove('clock-flash');
        void this.clockUI.offsetWidth; // trigger reflow
        this.clockUI.classList.add('clock-flash');
    }

    public onStart(callback: () => void) {
        this.startScreen.addEventListener('click', () => {
            this.startScreen.remove();
            callback();
        });
    }

    public updateFlashlightUI(isNight: boolean, isFlashlightOn: boolean) {
        if (isNight) {
            this.flashlightUI.style.opacity = '1';
            this.flashlightUI.style.filter = isFlashlightOn ? 'drop-shadow(0 0 10px yellow)' : 'grayscale(100%) opacity(0.5)';
        } else {
            this.flashlightUI.style.opacity = '0';
        }
    }

    public showFlashlightHint() {
        const hint = document.createElement('div');
        hint.id = 'flashlight-hint';
        hint.innerHTML = 'Press <b>F</b> to toggle flashlight<br><span style="font-size:16px; opacity:0.8;">Press <b>Tab</b> to return to day</span>';
        hint.style.position = 'absolute';
        hint.style.top = '20%';
        hint.style.left = '50%';
        hint.style.transform = 'translate(-50%, -50%)';
        hint.style.color = 'white';
        hint.style.fontFamily = 'monospace';
        hint.style.fontSize = '24px';
        hint.style.textAlign = 'center';
        hint.style.textShadow = '0 2px 4px black';
        hint.style.opacity = '0';
        hint.style.transition = 'opacity 1s';
        hint.style.pointerEvents = 'none';
        document.body.appendChild(hint);

        requestAnimationFrame(() => hint.style.opacity = '1');
        setTimeout(() => {
            if (document.getElementById('flashlight-hint')) {
                hint.style.opacity = '0';
                setTimeout(() => hint.remove(), 1000);
            }
        }, 5000);
    }

    public setScreenFlash(opacity: string) {
        this.screenFlash.style.opacity = opacity;
    }
}

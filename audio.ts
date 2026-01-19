
import * as Tone from 'tone';

class SoundManager {
  private static instance: SoundManager;
  private synths: any = {};
  private loops: any = {};
  private isInitialized = false;
  
  // Replaced Tone.Player with procedural oscillators to prevent network errors
  private menuDrone: Tone.FatOscillator | null = null;
  private menuFilter: Tone.Filter | null = null;
  private menuLFO: Tone.LFO | null = null;

  private constructor() {}

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public async init() {
    if (this.isInitialized) return;
    await Tone.start();
    Tone.Destination.volume.value = -8; // Default volume (80%)

    // -- MENU MUSIC (Procedural / Generated) --
    // Fix: Replaced external URL which caused "Failed to fetch" with a dark generated drone
    this.menuFilter = new Tone.Filter(300, "lowpass").toDestination();
    
    this.menuLFO = new Tone.LFO("0.05hz", 200, 600).start();
    this.menuLFO.connect(this.menuFilter.frequency);

    this.menuDrone = new Tone.FatOscillator({
        frequency: "C2",
        type: "sawtooth",
        spread: 20,
        count: 3
    }).connect(this.menuFilter);
    this.menuDrone.volume.value = -100; // Start silent

    // -- UI SOUNDS --
    this.synths.click = new Tone.Synth({
      oscillator: { type: "square" },
      envelope: { attack: 0.005, decay: 0.05, sustain: 0, release: 0.05 }
    }).toDestination();

    this.synths.type = new Tone.PluckSynth({
        attackNoise: 1,
        dampening: 4000,
        resonance: 0.7
    }).toDestination();
    this.synths.type.volume.value = -10;

    this.synths.notify = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 1 }
    }).toDestination();
    this.synths.notify.volume.value = -8;

    // -- AMBIENCE --
    const fanFilter = new Tone.Filter(400, "lowpass").toDestination();
    this.synths.fan = new Tone.Noise("brown").connect(fanFilter);
    this.synths.fan.volume.value = -50;

    const hddFilter = new Tone.Filter(3000, "highpass").toDestination();
    this.synths.hdd = new Tone.Noise("pink").connect(hddFilter);
    this.synths.hdd.volume.value = -60;

    const droneFilter = new Tone.AutoFilter({ frequency: 0.1, baseFrequency: 100, octaves: 2.6 }).toDestination().start();
    this.synths.drone = new Tone.FatOscillator("C2", "sawtooth", 30).connect(droneFilter);
    this.synths.drone.volume.value = -100;

    // Haunting Voices
    const reverb = new Tone.Reverb({ decay: 4, wet: 0.8 }).toDestination();
    const vibrato = new Tone.Vibrato({ frequency: 3, depth: 0.2 }).connect(reverb);
    this.synths.voices = new Tone.Noise("pink").connect(vibrato);
    this.synths.voices.volume.value = -100; // Start silent

    // -- FX --
    this.synths.error = new Tone.MonoSynth({
      oscillator: { type: "sawtooth" },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.2 },
      filterEnvelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1, baseFrequency: 200, octaves: 2 }
    }).toDestination();

    this.synths.glitch = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0 }
    }).toDestination();

    this.synths.boot = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "triangle" },
        envelope: { attack: 0.02, decay: 3, sustain: 0.1, release: 4 }
    }).toDestination();

    this.synths.sting = new Tone.PolySynth(Tone.FMSynth).toDestination();
    this.synths.sting.volume.value = -5;
    
    // NEW JUMPSCARE PUZZLE KEYPRESS SOUND
    this.synths.puzzle_hit = new Tone.MetalSynth({
        frequency: 150,
        envelope: { attack: 0.001, decay: 0.1, release: 0.05 },
        harmonicity: 8.5,
        modulationIndex: 20,
        resonance: 4000,
        octaves: 1.5,
    }).toDestination();
    this.synths.puzzle_hit.volume.value = -3;


    this.synths.screamNoise = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.5, sustain: 0, release: 0.2 }
    }).toDestination();
    this.synths.screamNoise.volume.value = 5;

    this.synths.screamTone = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sawtooth" },
        envelope: { attack: 0.01, decay: 1, sustain: 0, release: 1 }
    }).toDestination();
    this.synths.screamTone.volume.value = 0;

    this.synths.dial = new Tone.Synth({
        oscillator: { type: "sine" },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.1, release: 0.1 }
    }).toDestination();

    this.isInitialized = true;
  }

  public setGlobalVolume(level: number) { // level is 0-100
    if (!this.isInitialized) return;
    // Map 0-100 to a usable dB range, e.g., -60 to 0
    const dB = level === 0 ? -Infinity : (level / 100) * 40 - 40;
    Tone.Destination.volume.rampTo(dB, 0.1);
  }

  public async startMenuMusic() {
    if (!this.isInitialized || !this.menuDrone) return;
    
    // Start procedural drone
    if (this.menuDrone.state !== 'started') {
        this.menuDrone.start();
    }
    // Fade in
    this.menuDrone.volume.rampTo(-15, 3);
  }
  
  public stopMenuMusic() {
    if (!this.menuDrone || this.menuDrone.state === 'stopped') return;
    this.menuDrone.volume.rampTo(-100, 1.5);
    
    setTimeout(() => {
        this.menuDrone?.stop();
    }, 1500);
  }

  public play(sound: 'click' | 'notify' | 'error' | 'glitch' | 'unlock' | 'type' | 'boot' | 'sting' | 'jumpscare' | 'puzzle_hit') {
    if (!this.isInitialized) return;
    
    switch(sound) {
      case 'click': 
          this.synths.click.triggerAttackRelease("C6", "64n"); 
          break;
      case 'type': 
          const note = Math.random() > 0.5 ? "C4" : "C#4";
          this.synths.type.triggerAttackRelease(note, "32n"); 
          break;
      case 'notify': 
          this.synths.notify.triggerAttackRelease(["C5", "E5"], "16n"); 
          break;
      case 'error': 
          this.synths.error.triggerAttackRelease("A2", "8n"); 
          break;
      case 'glitch': 
          this.synths.glitch.triggerAttackRelease("16n"); 
          break;
      case 'unlock': 
        this.synths.notify.triggerAttackRelease(["C5", "E5", "G5", "C6"], "32n", 0.1);
        break;
      case 'boot':
        this.synths.click.triggerAttackRelease("C6", "16n");
        setTimeout(() => {
             this.synths.boot.triggerAttackRelease(["C4", "G4", "C5"], "2n");
        }, 800);
        break;
      case 'sting':
          this.synths.sting.triggerAttackRelease(["C2", "F#2", "C3"], "1n");
          break;
      case 'jumpscare':
          this.synths.screamNoise.triggerAttackRelease("8n");
          this.synths.screamTone.triggerAttackRelease(["C6", "F#6", "A#6", "C7"], "4n");
          break;
      case 'puzzle_hit':
          this.synths.puzzle_hit.triggerAttackRelease();
          break;
    }
  }

  public playTone(note: string, duration: string = "8n") {
     if (!this.isInitialized) return;
     this.synths.dial.triggerAttackRelease(note, duration);
  }

  public setVoices(active: boolean, volume: number = -40) {
      if (!this.isInitialized) return;
      if (active) {
          if (this.synths.voices.state === 'stopped') this.synths.voices.start();
          this.synths.voices.volume.rampTo(volume, 2);
      } else {
          this.synths.voices.volume.rampTo(-100, 2);
          setTimeout(() => this.synths.voices.stop(), 2000);
      }
  }

  public setAmbient(intensity: number) { 
    if (!this.isInitialized) return;
    
    if (this.synths.fan.state === 'stopped') this.synths.fan.start();
    
    if (intensity > 0 && !this.loops.hdd) {
        this.loops.hdd = new Tone.Loop(() => {
            if(Math.random() > 0.7) {
                this.synths.hdd.start().stop("+0.1");
            }
        }, "8n").start(0);
        Tone.Transport.start();
    }

    if (intensity > 2) {
        if (this.synths.drone.state === 'stopped') this.synths.drone.start();
        this.synths.drone.volume.rampTo(-40 + (intensity * 2), 5);
    } else {
        this.synths.drone.stop();
    }
  }

  public stopAll() {
      Tone.Transport.stop();
      if(this.synths.drone) this.synths.drone.stop();
      if(this.synths.fan) this.synths.fan.stop();
      if(this.synths.hdd) this.synths.hdd.stop();
      if(this.synths.voices) {
          this.synths.voices.volume.value = -100;
          this.synths.voices.stop();
      }
      
      if (this.loops.hdd) {
          this.loops.hdd.dispose();
          this.loops.hdd = null;
      }
      this.stopMenuMusic();
  }
}

export const soundManager = SoundManager.getInstance();

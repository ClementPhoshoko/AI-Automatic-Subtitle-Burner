const config = {
  ambient: {
    intensity: 1.0,
    spawnInterval: 3000,
    maxSimultaneousBolts: 3,
    idleMultiplier: 2.0,
    idleThreshold: 5000,
  },

  storm: {
    buildUpTime: 120000,
    minInterval: 1200,
    maxInterval: 5000,
    maxBoltsBase: 1,
    maxBoltsPeak: 6,
    ambientBase: 3000,
    ambientPeak: 1000,
  },

  bolt: {
    maxLength: 700,
    minSegments: 8,
    maxSegments: 22,
    maxBranches: 5,
    branchProbability: 0.55,
    crowFootProbability: 0.4,
    crowFootBranches: 2,
    crowFootSpread: 1.2,
    branchDepth: 2,
    simpleBoltProbability: 0.25,
    thicknessMin: 0.5,
    thicknessMax: 1.5,
    coreOpacity: 0.85,
    glowOpacity: 0,
    lifetimeMin: 200,
    lifetimeMax: 400,
    segmentJitter: 0.6,
    flickerFrequency: 0.12,
    curveDistortion: 0.4,
  },

  sparks: {
    countMin: 3,
    countMax: 10,
    speedMin: 1.5,
    speedMax: 4,
    sizeMin: 1.5,
    sizeMax: 3.5,
    lifetimeMin: 200,
    lifetimeMax: 500,
    decay: 0.97,
  },

  border: {
    crawlFrequency: 4000,
    speed: 0.6,
    fadeDuration: 400,
    sparkProbability: 0.5,
    maxActive: 2,
  },

  hover: {
    probability: 0.15,
    snapDuration: 100,
    glowPulse: 200,
  },

  target: {
    selectors: [
      '.workflow-card',
      '.glass-card',
      '.glass-hover',
      '.card-hover',
      '.home-upload-zone',
      '.home-feature',
      '.nav__left',
      '.how-title',
      '.home-heading',
      '.home-subtitle',
      '.btn',
      '.button-primary',
      '.button-secondary',
    ],
    maxDistance: 500,
    cooldown: 3000,
  },
}

export default config

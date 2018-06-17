module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-flow',
    '@babel/preset-react',
    [
      '@babel/preset-stage-2',
      {
        decoratorsLegacy: true,
      },
    ],
  ],
};

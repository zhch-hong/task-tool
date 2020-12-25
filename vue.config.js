module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        win: {
          target: ['nsis'],
          icon: 'src/assets/icon_256.ico',
        },
        nsis: {
          installerIcon: 'src/assets/icon_256.ico',
        },
      },
    },
  },
};

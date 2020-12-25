module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        win: {
          icon: 'src/assets/icon_256.ico',
        },
      },
    },
  },
};

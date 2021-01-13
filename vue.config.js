module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: '任务管理器',
        win: {
          icon: 'src/assets/icon_256.ico',
        },
        publish: ['github'],
      },
    },
  },
};

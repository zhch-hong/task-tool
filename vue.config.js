module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        productName: '任务配置工具',
        win: {
          icon: 'src/assets/icon_256.ico',
        },
        publish: ['github'],
      },
    },
  },
};

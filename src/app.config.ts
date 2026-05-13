export default defineAppConfig({
  pages: [
    'pages/login/index',
    'pages/home/index',
    'pages/menu/index',
    'pages/order-confirm/index',
    'pages/orders/index',
    'pages/qrcode/index',
    'pages/user/index',
    'pages/merchant/publish/index',
    'pages/merchant/scan/index',
    'pages/merchant/stats/index',
    'pages/merchant/tools/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: 'BeanSave',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#999999',
    selectedColor: '#6F4E37',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png'
      },
      {
        pagePath: 'pages/menu/index',
        text: '点咖啡',
        iconPath: 'assets/icons/menu.png',
        selectedIconPath: 'assets/icons/menu-active.png'
      },
      {
        pagePath: 'pages/orders/index',
        text: '订单',
        iconPath: 'assets/icons/orders.png',
        selectedIconPath: 'assets/icons/orders-active.png'
      },
      {
        pagePath: 'pages/user/index',
        text: '我的',
        iconPath: 'assets/icons/user.png',
        selectedIconPath: 'assets/icons/user-active.png'
      }
    ]
  }
})

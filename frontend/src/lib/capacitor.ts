import { App } from '@capacitor/app'
import { SystemBars, SystemBarsStyle, SystemBarType } from '@capacitor/core'
import { Device } from '@capacitor/device'
import type { Router } from 'vue-router'

declare global {
  interface Window {
    Capacitor?: {
      Plugins?: {
        SplashScreen?: { hide: () => void }
        App?: { addListener: (event: string, callback: () => void, once?: boolean) => void }
        Keyboard?: {
          setResizeMode: (opts: { mode: string }) => void
          setScroll: (opts: { isDisabled: boolean }) => void
          setAccessoryBarVisible: (opts: { isVisible: boolean }) => void
        }
        StatusBar: { setOverlaysWebView: true }
      }
      android: {
        adjustMarginsForEdgeToEdge: 'auto'
      }
    }
    Router: Router
  }
}

const capacitorApp = {
  /** Hides the native Capacitor splash screen after 2 seconds. */
  handleSplashscreen: function () {
    if (!window.Capacitor) return
    setTimeout(() => {
      if (window.Capacitor?.Plugins?.SplashScreen) {
        window.Capacitor.Plugins.SplashScreen.hide()
      }
    }, 2000)
  },

  /** Prevents the Android back button from exiting the app — navigates back instead. */
  handleAndroidBackButton: function () {
    const router = window.Router
    if (!window.Capacitor || !window.Capacitor.Plugins?.App) return
    window.Capacitor.Plugins.App.addListener(
      'backButton',
      function () {
        if (router.currentRoute.value.path !== '/') {
          if (window.history.length > 1) {
            router.go(-1)
          } else {
            router.push('/')
          }
        }
      },
      false,
    )
  },

  /** Cross-platform keyboard resize / scroll / accessory bar management. */
  handleKeyboard: function () {
    if (!window.Capacitor || !window.Capacitor.Plugins?.Keyboard) return

    const Keyboard = window.Capacitor.Plugins.Keyboard
    if (!Keyboard) return
    Keyboard.setResizeMode({ mode: 'native' })
    Keyboard.setScroll({ isDisabled: true })
    Keyboard.setAccessoryBarVisible({ isVisible: false })

    window.addEventListener('keyboardDidHide', () => {
      if (
        document.activeElement &&
        document.activeElement.closest &&
        document.activeElement.closest('.messagebar')
      ) {
        return
      }
      Keyboard.setAccessoryBarVisible({ isVisible: true })
    })

    document.addEventListener(
      'touchstart',
      function (e: TouchEvent) {
        const target = e.target as HTMLElement
        if (!target) return
        const nodeName = target.nodeName.toLowerCase()
        const type = (target as HTMLInputElement).type
        const showForTypes = ['datetime-local', 'time', 'date', 'datetime']
        if (nodeName === 'select' || showForTypes.indexOf(type) >= 0) {
          Keyboard.setAccessoryBarVisible({ isVisible: true })
        } else {
          Keyboard.setAccessoryBarVisible({ isVisible: false })
        }
      },
      true,
    )
  },

  setSystemBarStyleDark: async () => {
    await SystemBars.setStyle({ style: SystemBarsStyle.Dark })
  },

  setSystemBarStyleLight: async () => {
    await SystemBars.setStyle({ style: SystemBarsStyle.Light })
  },

  hideSystemBars: async () => {
    await SystemBars.hide()
  },

  showSystemBars: async () => {
    await SystemBars.show()
  },

  hideNavigationBar: async () => {
    await SystemBars.hide({ bar: SystemBarType.NavigationBar })
  },

  /** Set the status bar animation (iOS only). */
  setStatusBarAnimation: async () => {
    await SystemBars.setAnimation({ animation: 'NONE' })
  },

  getDevice: async function () {
    return Device.getInfo()
  },

  getPlatform: async function () {
    const info = await capacitorApp.getDevice()
    return info.platform
  },

  init: function (router: Router) {
    window.Router = router
    if (!window.Capacitor && !window.Router) {
      console.warn('capacitorApp: Router is not available.')
      return
    }

    capacitorApp.handleAndroidBackButton()
    capacitorApp.handleSplashscreen()
    capacitorApp.handleKeyboard()
  },
}

export default capacitorApp

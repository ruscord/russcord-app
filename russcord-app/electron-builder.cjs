/**
 * Пустая подпись Windows: без signtool и без распаковки winCodeSign (симлинки в кэше).
 * Строка-путь к модулю после merge конфига иногда не попадает в signtoolOptions — задаём функцию напрямую.
 */
async function noopWindowsSign() {}

module.exports = {
  appId: "ru.russcord.app",
  productName: "Russcord",
  copyright: "Copyright © Russcord",
  directories: {
    output: "dist",
    buildResources: "build",
  },
  files: ["src/**/*", "package.json"],
  win: {
    target: ["nsis"],
    /** отключает rcedit+подпись exe; иначе цепочка всё равно тянет winCodeSign на части окружений */
    signAndEditExecutable: false,
    signtoolOptions: {
      sign: noopWindowsSign,
    },
  },
  mac: {
    category: "public.app-category.social-networking",
    target: ["dmg", "zip"],
  },
  linux: {
    target: ["AppImage"],
    category: "Network",
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
  },
};

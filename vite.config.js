import { quasar, transformAssetUrls } from '@quasar/vite-plugin'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { QuasarResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import monacoEditorPlugin from 'vite-plugin-monaco-editor'

export default defineConfig({
  base: '',
  server: {
    host: '0.0.0.0',
    open: true
  },
  configureWebpack: {
    devtool: 'source-map'
},
  publicDir: 'public',
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src')
    }
  },
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    Components({
      resolvers: [
        QuasarResolver()
      ]
    }),
    quasar({
      autoImportComponentCase: 'pascal'
    }),
    monacoEditorPlugin({
      languageWorkers: ['editorWorkerService', 'json'],
      publicPath: 'https://unpkg.com/vite-plugin-monaco-editor@1.0.10/cdn'
    })
  ],
  define: {
    PACKAGE_VERSION: JSON.stringify(process.env.npm_package_version)
  }
})

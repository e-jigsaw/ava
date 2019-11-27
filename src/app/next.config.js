const withCss = require('@zeit/next-css')
const { resolve } = require('path')

const createAlias = name => resolve(__dirname, name)

module.exports = withCss({
  webpack: (config, { isServer }) => {
    if (isServer) {
      const antStyles = /antd\/.*?\/style\/css.*?/
      const origExternals = [...config.externals]
      config.externals = [
        (context, request, callback) => {
          if (request.match(antStyles)) return callback()
          if (typeof origExternals[0] === 'function') {
            origExternals[0](context, request, callback)
          } else {
            callback()
          }
        },
        ...(typeof origExternals[0] === 'function' ? [] : origExternals)
      ]

      config.module.rules.unshift({
        test: antStyles,
        use: 'null-loader'
      })
    }
    config.resolve.alias = {
      ...config.resolve.alias,
      components: createAlias('components'),
      resources: createAlias('resources')
    }
    return config
  },
  distDir: '../../dist/functions/next',
  poweredByHeader: false
})

/*
  webpack 相关:
  yarn add webpack webpack-cli -D

  vue 相关:
  yarn add vue vue-router

  vue loader:
  yarn add vue-loader vue-style-loader -D

  element-plus:
  yarn add element-plus
  yarn add unplugin-vue-components unplugin-auto-import -D

  html插件:
  yarn add html-webpack-plugin -D
  
  复制文件插件:
  yarn add copy-webpack-plugin -D

  css相关:
  yarn add css-loader -D
  yarn add sass sass-loader css-loader -D
  yarn add postcss postcss-loader postcss-preset-env -D
  yarn add mini-css-extract-plugin css-minimizer-webpack-plugin -D

  babel相关:
  yarn add babel-loader @babel/core @vue/cli-plugin-babel -D

  eslint相关:
  yarn add eslint eslint-webpack-plugin eslint-plugin-vue @babel/eslint-parser -D

  开发服务器:
  yarn add webpack-dev-server cross-env -D
*/
const { DefinePlugin } = require("webpack");
const { VueLoaderPlugin } = require("vue-loader");
const TerserPlugin = require("terser-webpack-plugin");
const EslintPlugin = require("eslint-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const AutoImport = require("unplugin-auto-import/webpack");
const Components = require("unplugin-vue-components/webpack");
const { ElementPlusResolver } = require("unplugin-vue-components/resolvers");

const path = require("path");
const mode = process.env.NODE_ENV;
const isDev = mode === "development";
const isPrd = mode === "production";

let output = {
  clean: true,
  path: path.join(__dirname, "../dist"),
  filename: "js/[name].[contenthash:10].js",
  chunkFilename: "js/chunk.[name].[contenthash:5].js",
  assetModuleFilename: "imgs/[hash:5][ext][query]",
};

if (isDev) {
  output = {
    filename: "js/[name].js",
    chunkFilename: "js/chunk.[name].js",
    assetModuleFilename: "imgs/[hash:5][ext][query]",
  };
}

const postcssLoader = {
  loader: "postcss-loader",
  options: {
    postcssOptions: { plugins: ["postcss-preset-env"] },
  },
};

/** @type import("webpack").Configuration */
const config = {
  mode,
  output,
  entry: "/src/main.js",
  devtool: isDev ? "cheap-module-source-map" : "source-map",

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          isDev ? "vue-style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          postcssLoader,
        ],
      },
      {
        test: /\.scss$/,
        use: [
          isDev ? "vue-style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
          postcssLoader,
          {
            loader: "sass-loader",
            options: {
              additionalData: `@use "@/styles/element/index.scss" as *;`,
            },
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            cacheDirectory: true,
            cacheCompression: false,
          },
        },
      },
      {
        test: /\.vue$/,
        use: "vue-loader",
      },
      {
        test: /\.(png|jpe?g|git|webp|svg)$/,
        type: "asset",
        parser: {
          dataUrlCondition: { maxSize: 10 * 1024 },
        },
        generator: {
          filename: "imgs/[hash:10][ext][query]",
        },
      },
      {
        test: /\.(woff2?|ttf)$/,
        type: "asset/resource",
      },
    ],
  },

  resolve: {
    extensions: [".vue", ".js", ".json"],
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },

  optimization: {
    // 控制是否进行压缩
    minimize: isPrd,
    minimizer: [
      // js 压缩
      new TerserPlugin(),
      // 样式压缩
      new CssMinimizerPlugin(),
    ],

    splitChunks: {
      chunks: "all",
      cacheGroups: {
        // vue vue-router
        react: {
          test: /[\\/]node_modules[\\/]vue(.*)?[\\/]/,
          name: "chunk-vue",
          priority: 10,
        },
        // element-plus
        antd: {
          test: /[\\/]node_modules[\\/]element-plus[\\/]/,
          name: "chunk-element",
          priority: 9,
        },
        // 剩下的 node_modules
        libs: {
          test: /[\\/]node_modules[\\/]/,
          name: "chunk-libs",
          priority: 8,
        },
      },
    },

    runtimeChunk: {
      name: (entrypoint) => `runtime~${entrypoint.name}.js`,
    },
  },

  plugins: [
    // 生产环境:复制静态资源
    isPrd &&
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "../public"),
            to: path.resolve(__dirname, "../dist"),
            globOptions: { ignore: ["**/index.html"] }, // 忽略 indx.html
          },
        ],
      }),

    // 生产环境:css 压缩
    isPrd &&
      new MiniCssExtractPlugin({
        filename: "css/[name].[hash:5].css",
        chunkFilename: "css/chunk.[name].[hash:5].css",
      }),

    new EslintPlugin({
      context: path.resolve(__dirname, "../src"),
      cache: true,
      cacheLocation: path.resolve(
        __dirname,
        "../node_modules/.cache/eslintcache"
      ),
    }),

    // https://vue-loader.vuejs.org/zh/
    new VueLoaderPlugin(),

    // cross-env 定义的环境变量只能在 nodejs 中使用
    // DefinePlugin 插件定义的变量可以带浏览器中使用, 解决 vue 警告问题
    new DefinePlugin({
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
    }),

    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "../public/index.html"),
    }),

    // element-按需加载
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: "sass" })],
    }),
  ].filter(Boolean),

  devServer: {
    host: "localhost",
    port: 3001,
    open: false,
    hot: true,
    // 解决前端 history 路由 404 问题
    historyApiFallback: true,
  },

  // 关闭性能分析, 提高打包速度
  performance: false,
};

module.exports = config;

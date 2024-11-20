const path = require('path');

module.exports = {
    entry: './src/index.js', // Entry point
    output: {
        filename: 'bundle.js', // Output file name
        path: path.resolve(__dirname, 'dist'), // Output directory
    },
    module: {
        rules: [
            {
                test: /\.css$/, // For CSS files
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.js$/, // For JavaScript files
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader', // Allows ES6+
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
        ],
    },
    mode: 'development', // or 'production'
};

/**
 * Created by Administrator on 2017-12-07.
 */

module.exports = (include) => {
    return {
        module : {
            rules : [
                {
                    test: /\.css$/,
                    loader: 'postcss-loader',
                    enforce: 'pre',
                    include: include,
                    options: {
                        plugins: () => ([
                            require('stylelint')({
                                ignoreFiles: 'node_modules/!**!/!*.css',
                            }),
                        ]),
                    }
                }
            ]
        }
    }
};

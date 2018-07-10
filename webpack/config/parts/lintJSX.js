/**
 * Created by Administrator on 2017-12-07.
 */

module.exports = (include) => {
    return {
        module : {
            rules : [
                {
                    test: /\.(js|jsx)$/,
                   /* loaders: ['eslint-loader', 'jscs-loader'],*/
                    loaders: ['eslint-loader'],
                    enforce: 'pre',
                    include: include
                },
            ]
        }
    }
};
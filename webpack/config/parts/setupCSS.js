/**
 * Created by Administrator on 2017-12-06.
 */

module.exports = function (paths) {
    return {
        module: {
            rules: [
                {
                    test: /\.(css)$/,
                    loaders: ['style-loader', 'css-loader'],
                   /* include: paths*/
                }
            ]
        }
    };
};

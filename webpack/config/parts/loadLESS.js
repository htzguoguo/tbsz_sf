/**
 * Created by Administrator on 2017-12-14.
 */

module.exports = function (path) {
    return {
        module : {
            rules : [
                {
                    test: /\.less$/,
                    include: path,
                    loaders: [
                        'style-loader',
                       /* 'css-loader?modules&localIdentName=[local]-[hash:base64:5]',*/
                        'css-loader',
                        'less-loader'
                    ]

                }
            ]
        }
    }
};

/**
 * Created by Administrator on 2017-12-11.
 */

module.exports = function () {
    return {
        module : {
            rules : [
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/,
                    use: [
                        'url-loader'
                    ]
                }
            ]
        }
    }
};

/**
 * Created by Administrator on 2017-12-14.
 */

module.exports = function () {
    return {
        module : {
            rules :  [
                {
                    test: /\.(png|svg|jpg|gif)$/,
                    use: [
                        'url-loader'
                    ]
                }
            ]
        }
    }
};

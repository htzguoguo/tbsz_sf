/**
 * Created by Administrator on 2017-12-07.
 */


module.exports = function (include) {
    return {
        module : {
            rules : [
                {
                test : /\.(js|jsx)$/,
                loaders : ['babel-loader'],
                include : include
            }
            ]
        }
    }
};

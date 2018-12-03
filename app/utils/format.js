import moment from 'moment';

export const monthFormat = 'YYYYMM';

export const dateFormat = 'YYYYMMDD';

export const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
};

export function convertPropertiesToMoment(obj, keys, format) {
    keys.forEach(
        d => {
            if(obj[d] && obj[d].length > 0) {
                obj[d] = moment(obj[d], format);
            }
            
        }
    );
}

export function formatDatePickerValue(obj, keys, format) {
    keys.forEach(
        key => {
            obj[key] = obj[key] ? obj[key].format(format) : '';
        }
    );
}

export function ArrayBufferToString (buffer, encoding) {
    if (encoding == null) encoding = 'utf8'

    return Buffer.from(buffer).toString(encoding)
}

export function  copy (source, StartChar, Count ) {
    return source.slice(StartChar - 1, StartChar + Count - 1);
}
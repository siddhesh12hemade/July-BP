import _ from "lodash"
export const formatInitialValueWithoutKey = (initialValue: any) => {

    return _.map(initialValue, (data) => {
        if (!_.get(data, "key")) {
            return { ...data, key: _.uniqueId('key') }
        }
        return data
    })
}
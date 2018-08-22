import R from 'ramda';

const actionSwitcher = {
    FETCH_FOLDER: (state: any, payload: any) => ({
        ...state,
        placeIndicator: [ ...state.placeIndicator, payload.hash ],
        rootFolder: { ...payload.rootFolder },
        folderLoading: false,
    }),
    BREADCRUMB_CHANGE: (state: any, payload: any) => ({
        ...state,
        placeIndicator: R.dropLast(state.placeIndicator.length - payload, state.placeIndicator),
    }),
};

export default (state: {
    rootFolder: { contains: Array<object>, path: null | string },
    placeIndicator: Array<number>,
    folderLoading: boolean,
    } = {
    rootFolder: { contains: [], path: null },
    placeIndicator: [],
    folderLoading: true,
    },
    action: {
        type: string,
        payload: any,
    }) => (<any>actionSwitcher)[action.type]
    ? (<any>actionSwitcher)[action.type](state, action.payload)
    : state;

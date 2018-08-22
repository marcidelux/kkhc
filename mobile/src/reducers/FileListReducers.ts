const actionSwitcher = {
    GET_COMMENTS: (state: any, payload: any) => ({
        ...state,
        comments: payload.comments,
    }),
};

export default (state: any = {},
    action: {
        type: string,
        payload: any,
    }) => (<any>actionSwitcher)[action.type]
    ? (<any>actionSwitcher)[action.type](state, action.payload)
    : state;

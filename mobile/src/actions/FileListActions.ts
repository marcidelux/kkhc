import { BACKEND_API } from 'react-native-dotenv';
import { Dispatch } from 'redux';

const getComments = (hash: number) => async (dispatch: Dispatch) => {
  try {
    const response = await fetch(
      `${BACKEND_API}/getCommentFlow/${hash}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json; charset=utf-8' } },
    );
    const { comments } = await response.json();

    return dispatch({
      type: 'GET_COMMENTS',
      payload: { comments, hash },
    });

  } catch (error) {
    console.error(error);
  }
};

export { getComments };

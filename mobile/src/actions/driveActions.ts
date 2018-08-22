import { BACKEND_API } from 'react-native-dotenv';
import { Dispatch } from 'redux';

const fetchFolder = (hash: number) => async (dispatch: Dispatch) => {
    try {
      const response = await fetch(
        `${BACKEND_API}/folder/${hash}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json; charset=utf-8' } },
      );
      const rootFolder = await response.json();

      dispatch({
        type: 'FETCH_FOLDER',
        payload: { rootFolder, hash },
      });

    } catch (error) {
      console.error(error);
    }
};

const breadCrumbNavigation = (index: number) => (dispatch: Dispatch) => {
    dispatch({
        type: 'BREADCRUMB_CHANGE',
        payload: index,
    });
};

export { fetchFolder, breadCrumbNavigation };
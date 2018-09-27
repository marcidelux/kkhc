import { observable, computed, action, runInAction } from 'mobx';
import { BACKEND_API } from 'react-native-dotenv';

declare type Comment = {
  id: number;
  text: string;
  user: string;
  date: Date;
};

class ImageInspectStore {
  @observable
  comments: Array<Comment>;

  constructor(comments: Array<Comment>) {
    // what is this??
    this.comments = [...comments];
  }

  @action
  async addComment(hash: number, text: string): Promise<void> {
    try {
      const response = await fetch(`${BACKEND_API}/addToCommentFlow/${hash}`, {
        method: 'POST',
        body: JSON.stringify({
          text,
          user: 'aargon',
        }),
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
      const { comments } = await response.json();

      runInAction(() => {
        this.comments = comments;
      });
    } catch (error) {
      console.error(error);
    }
  }
}

export default ImageInspectStore;

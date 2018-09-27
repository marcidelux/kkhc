import { observable, computed, action, runInAction, autorun, when } from 'mobx';
import { BACKEND_API } from 'react-native-dotenv';
import { AsyncStorage } from 'react-native';

class SettingsStore {
  @observable meId: String;
  @observable remoteUsername: String;
  @observable remoteAvatar: String;
  @observable remoteColor: String;
  @observable localUsername: String;
  @observable localAvatar: String;
  @observable localColor: String;
  @observable red: Number;
  @observable green: Number;
  @observable blue: Number;

  constructor() {
    this.meId = null;
    this.remoteUsername = null;
    this.remoteAvatar = null;
    this.remoteColor = null;
    this.initialState();
  }

  initialState() {
    this.localUsername = null;
    this.localAvatar = null;
    this.localColor = null;
    this.red = null;
    this.green = null;
    this.blue = null;
  }

  @action async getLoggedInUserId(usersStatus: any) {
    try {
      const meId = await AsyncStorage.getItem('loggedInUserId');
      const {
        color,
        username,
        avatar,
      } = usersStatus.find((user: any) => user.id === meId);
      this.remoteAvatar = avatar;
      this.remoteUsername = username;
      this.remoteColor = color;
      this.meId = meId;
    } catch (error) {
      console.log(error);
    }
  }

  propertyIsEqualToNull(propertyName: string): Boolean {
    return (<any>this)[propertyName] === null;
  }

  @computed get canSave(): Boolean {
    return (
      !this.propertyIsEqualToNull('localAvatar') ||
      !this.propertyIsEqualToNull('localColor') ||
      !this.propertyIsEqualToNull('localUsername')
    );
  }

  @computed get remoteAndLocalEquality(): Boolean {
    return (
      this.remoteAvatar === (this.propertyIsEqualToNull('localAvatar')
        ? this.remoteAvatar
        : this.localAvatar) &&
      this.remoteColor === (this.propertyIsEqualToNull('localColor')
        ? this.remoteColor
        : this.localColor) &&
      this.remoteUsername === (this.propertyIsEqualToNull('localUsername')
        ? this.remoteUsername
        : this.localUsername)
    );
  }

  @action revertBackToInitialState() {
    this.initialState();
  }

  
  // @action
  // async addComment(hash: number, text: string): Promise<void> {
  //   try {
  //     const response = await fetch(`${BACKEND_API}/addToCommentFlow/${hash}`, {
  //       method: 'POST',
  //       body: JSON.stringify({
  //         text,
  //         user: 'aargon',
  //       }),
  //       headers: {
  //         'Content-Type': 'application/json; charset=utf-8',
  //       },
  //     });
  //     const { comments } = await response.json();

  //     runInAction(() => {
  //       this.comments = comments;
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }
}

export default SettingsStore;

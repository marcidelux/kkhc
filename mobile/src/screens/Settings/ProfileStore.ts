import {
  observable,
  computed,
  action,
  reaction,
} from 'mobx';
import { BACKEND_API } from 'react-native-dotenv';
import { AsyncStorage } from 'react-native';

const CAN_SAVE_WIDGET_OUT_DURATION = 250;

type ProfileProperty = 'Avatar' | 'Username' | 'Color';

export class ProfileStore {
  @observable meId: String = null;
  @observable remoteUsername: String = null;
  @observable remoteAvatar: String = null;
  @observable remoteColor: String = null;
  @observable localUsername: String = null;
  @observable localAvatar: String = null;
  @observable localColor: String = null;
  @observable red: Number = null;
  @observable green: Number = null;
  @observable blue: Number = null;
  @observable saving: Boolean = null;
  properties: Array<ProfileProperty> = ['Avatar', 'Username', 'Color'];

  constructor() {
    reaction(
      () => this.remoteUsername,
      () => this.localUsername = null,
      );
    reaction(
      () => this.remoteAvatar,
      () => this.localAvatar = null,
      );
    reaction(
      () => this.remoteColor,
      () => {
        this.localColor = null;
        this.resetAdditiveColors();
      });
  }

  initialState() {
    this.localUsername = null;
    this.localAvatar = null;
    this.localColor = null;
    this.resetAdditiveColors();
  }

  resetAdditiveColors() {
    this.red = null;
    this.green = null;
    this.blue = null;
  }

  @action revertBackToInitialState() {
    this.initialState();
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

  @action async sendChangesToServer() {
    this.saving = true;
    const {
      localUsername: username,
      localAvatar: avatar,
      localColor: color,
    } = this;
    try {
      let response = await fetch(`${BACKEND_API}/mobile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          query: `mutation($user: UserTypeInput) {
            updateStatus(user: $user) {
              id,
              username,
              avatar,
              color,
            }
          }`,
          variables: {
            user: {
              id: this.meId,
              ...(username ? { username } : {}),
              ...(avatar ? { avatar } : {}),
              ...(color ? { color } : {}),
            },
          },
        }),
      });
      const { data } = await response.json();
      setTimeout(() => this.saving = null, CAN_SAVE_WIDGET_OUT_DURATION);
    } catch (error) {
      console.log(error);
    }
  }

  @computed get canSave(): Boolean {
    return this.properties
      .some(p => !this.propertyIsEqualToNull.call(this, `local${p}`));
  }

  @computed get remoteAndLocalEquality(): boolean {
    return this.properties
        .every(p => this.remoteAndLocalPropertyEquality.call(this, p));
  }

  remoteAndLocalPropertyEquality(propertyName: ProfileProperty): boolean {
    return this.propertyIsEqualToNull(`local${propertyName}`)
      ? true
      : (<any>this)[`remote${propertyName}`] === (<any>this)[`local${propertyName}`];
  }

  propertyIsEqualToNull(fullPropertyName: string): Boolean {
    return (<any>this)[fullPropertyName] === null;
  }
}
